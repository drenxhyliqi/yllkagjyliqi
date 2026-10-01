"""Several services, visits at the client's place, preparation time, the
client's own link, expiry and reminders."""

import uuid
from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from app.models import Booking
from app.services.availability_service import local_datetime, to_local
from tests.test_bookings import confirm, next_weekday, pending_ids, unavailable


def make_services(client: TestClient, headers: dict) -> tuple[str, str]:
    category = client.post("/api/admin/categories", json={"name_sq": "Nuse"}, headers=headers).json()
    def service(name: str, price: int, minutes: int, price_type: str = "fixed") -> str:
        return client.post(
            "/api/admin/services",
            json={"category_id": category["id"], "name_sq": name, "price": price,
                  "price_type": price_type, "duration_minutes": minutes},
            headers=headers,
        ).json()["id"]
    return service("Make-up nuseje", 80, 60, "from"), service("Make-up shoqërueseje", 30, 30)


def rules(client: TestClient, headers: dict, **changes) -> None:
    body = {"slot_interval_minutes": 30, "min_notice_minutes": 120, "booking_window_days": 60, **changes}
    assert client.put("/api/admin/schedule/settings", json=body, headers=headers).status_code == 200


def book(client: TestClient, items: list, day, at: str, **fields):
    return client.post(
        "/api/bookings",
        json={"items": items, "date": day.isoformat(), "time": at, "customer_name": "Bride",
              "customer_phone": "+383 44 123 123", **fields},
    )


def test_bride_and_bridesmaids_in_one_booking(client: TestClient, admin_headers: dict) -> None:
    bride, bridesmaid = make_services(client, admin_headers)
    monday = next_weekday(1)
    items = [{"service_id": bride}, {"service_id": bridesmaid, "quantity": 3}]

    # 60 + 3 × 30 = 150 minutes: 09:00 to 18:00 leaves 15:30 as the last start.
    free = client.get(f"/api/availability?items={bride}:1,{bridesmaid}:3").json()["days"][monday.isoformat()]
    assert free[-1] == "15:30"

    assert book(client, items, monday, "10:00").status_code == 201
    booking = client.get("/api/admin/bookings?view=pending", headers=admin_headers).json()[0]
    assert booking["service_name"] == "Make-up nuseje + Make-up shoqërueseje ×3"
    assert (booking["start"], booking["end"]) == ("10:00", "12:30")
    assert booking["price"] == 170 and booking["price_type"] == "from"
    assert [item["quantity"] for item in booking["items"]] == [1, 3]

    duplicate = [{"service_id": bride}, {"service_id": bride}]
    assert book(client, duplicate, monday, "14:00").status_code == 422


def test_preparation_time_after_each_appointment(client: TestClient, admin_headers: dict) -> None:
    bride, _ = make_services(client, admin_headers)
    rules(client, admin_headers, buffer_minutes=15)
    monday = next_weekday(1)
    book(client, [{"service_id": bride}], monday, "10:00")
    confirm(client, admin_headers, pending_ids(client, admin_headers)[0])

    body = client.get(f"/api/availability?items={bride}:1").json()
    closed = unavailable(body, monday)
    # The 10:00 booking holds 10:00–11:15; a new one also needs 15 minutes after.
    assert closed["11:00"] == "booked" and closed["09:00"] == "booked"
    assert "11:30" in body["days"][monday.isoformat()]


def test_visits_at_the_clients_place(client: TestClient, admin_headers: dict) -> None:
    bride, _ = make_services(client, admin_headers)
    monday = next_weekday(1)
    visit = {"location": "client", "address": "Rruga e Dardanisë 5, Prishtinë"}

    # Not offered until Yllka turns it on.
    assert book(client, [{"service_id": bride}], monday, "10:00", **visit).status_code == 422
    rules(client, admin_headers, home_visits=True, travel_minutes=30)
    assert book(client, [{"service_id": bride}], monday, "10:00", location="client").status_code == 422  # no address

    body = client.get(f"/api/availability?items={bride}:1&location=client").json()
    times = body["days"][monday.isoformat()]
    # 30 minutes to get there after 09:00 opening, 30 back before 18:00.
    assert times[0] == "09:30" and times[-1] == "16:30"

    assert book(client, [{"service_id": bride}], monday, "10:00", **visit).status_code == 201
    confirm(client, admin_headers, pending_ids(client, admin_headers)[0])
    booking = client.get("/api/admin/bookings?view=upcoming", headers=admin_headers).json()[0]
    assert (booking["block_start"], booking["block_end"]) == ("09:30", "11:30")
    assert booking["address"].startswith("Rruga e Dardanisë")

    # The travel time is taken too, for studio appointments as well.
    studio = unavailable(client.get(f"/api/availability?items={bride}:1").json(), monday)
    assert studio["11:00"] == "booked" and studio["09:00"] == "booked"


def test_client_can_cancel_through_their_link(client: TestClient, admin_headers: dict) -> None:
    bride, _ = make_services(client, admin_headers)
    monday = next_weekday(1)
    token = book(client, [{"service_id": bride}], monday, "10:00").json()["manage_token"]

    seen = client.get(f"/api/bookings/manage/{token}").json()
    assert seen["status"] == "pending" and seen["can_change"] is True
    assert "customer_phone" not in seen

    cancelled = client.post(f"/api/bookings/manage/{token}/cancel")
    assert cancelled.status_code == 200 and cancelled.json()["status"] == "cancelled"
    booking = client.get("/api/admin/bookings?view=cancelled", headers=admin_headers).json()[0]
    assert booking["cancelled_by"] == "client"
    assert client.get("/api/bookings/manage/not-a-real-token").status_code == 404


def test_client_change_goes_back_to_yllka(client: TestClient, admin_headers: dict) -> None:
    bride, _ = make_services(client, admin_headers)
    monday = next_weekday(1)
    token = book(client, [{"service_id": bride}], monday, "10:00").json()["manage_token"]
    confirm(client, admin_headers, pending_ids(client, admin_headers)[0])

    # Its own time shows as free when moving it.
    own = client.get(f"/api/bookings/manage/{token}/availability").json()
    assert "10:00" in own["days"][monday.isoformat()]

    moved = client.post(f"/api/bookings/manage/{token}/reschedule", json={"date": monday.isoformat(), "time": "14:00"})
    assert moved.status_code == 200, moved.text
    assert moved.json()["status"] == "pending" and moved.json()["start"] == "14:00"
    booking = client.get("/api/admin/bookings?view=pending", headers=admin_headers).json()[0]
    assert booking["client_changed_at"] is not None


def test_no_changes_online_after_the_deadline(client: TestClient, admin_headers: dict, db) -> None:
    bride, _ = make_services(client, admin_headers)
    rules(client, admin_headers, cancellation_notice_hours=24)
    monday = next_weekday(1)
    token = book(client, [{"service_id": bride}], monday, "10:00").json()["manage_token"]

    booking = db.query(Booking).one()
    soon = datetime.now(UTC) + timedelta(hours=5)
    booking.start_time, booking.end_time = soon, soon + timedelta(hours=1)
    booking.block_start, booking.block_end = booking.start_time, booking.end_time
    db.commit()

    assert client.get(f"/api/bookings/manage/{token}").json()["can_change"] is False
    assert client.post(f"/api/bookings/manage/{token}/cancel").status_code == 409


def test_unanswered_requests_expire(client: TestClient, admin_headers: dict, db) -> None:
    bride, _ = make_services(client, admin_headers)
    book(client, [{"service_id": bride}], next_weekday(1), "10:00")
    booking = db.query(Booking).one()
    past = datetime.now(UTC) - timedelta(hours=2)
    booking.start_time, booking.end_time = past, past + timedelta(hours=1)
    booking.block_start, booking.block_end = booking.start_time, booking.end_time
    db.commit()

    assert client.get("/api/admin/bookings?view=pending", headers=admin_headers).json() == []
    expired = client.get("/api/admin/bookings?view=cancelled", headers=admin_headers).json()
    assert expired[0]["status"] == "expired"


def test_reminders_for_tomorrow(client: TestClient, admin_headers: dict, db) -> None:
    bride, _ = make_services(client, admin_headers)
    created = client.post(
        "/api/admin/bookings",
        json={"items": [{"service_id": bride}], "date": next_weekday(1).isoformat(), "time": "10:00",
              "customer_name": "Ana", "customer_phone": "044 111 222"},
        headers=admin_headers,
    ).json()
    booking = db.get(Booking, uuid.UUID(created["id"]))
    tomorrow = datetime.now(UTC) + timedelta(days=1)
    start = local_datetime(to_local(tomorrow).date(), datetime.strptime("10:00", "%H:%M").time())
    booking.start_time, booking.end_time = start, start + timedelta(hours=1)
    booking.block_start, booking.block_end = booking.start_time, booking.end_time
    db.commit()

    assert client.get("/api/admin/bookings/summary", headers=admin_headers).json()["reminders"] == 1
    listed = client.get("/api/admin/bookings?view=reminders", headers=admin_headers).json()
    assert [b["id"] for b in listed] == [created["id"]]

    sent = client.put(f"/api/admin/bookings/{created['id']}/reminder", json={"sent": True}, headers=admin_headers)
    assert sent.json()["reminder_sent_at"] is not None
    assert client.get("/api/admin/bookings/summary", headers=admin_headers).json()["reminders"] == 0
