from datetime import UTC, date, datetime, timedelta
from threading import Barrier, Thread

import pytest
from fastapi.testclient import TestClient

from app.services import booking_service
from app.services.availability_service import business_zone


@pytest.fixture
def service_id(client: TestClient, admin_headers: dict) -> str:
    category = client.post("/api/admin/categories", json={"name_sq": "Flokë"}, headers=admin_headers).json()
    service = client.post(
        "/api/admin/services",
        json={"category_id": category["id"], "name_sq": "Fëno", "price": 15, "duration_minutes": 60},
        headers=admin_headers,
    ).json()
    return service["id"]


def next_weekday(weekday: int) -> date:
    """The next given ISO weekday at least two days away (clear of notice rules)."""
    day = datetime.now(business_zone()).date() + timedelta(days=2)
    while day.isoweekday() != weekday:
        day += timedelta(days=1)
    return day


def request(client: TestClient, service_id: str, day: date, at: str, **fields):
    body = {
        "items": [{"service_id": service_id, "quantity": 1}],
        "date": day.isoformat(),
        "time": at,
        "customer_name": "Ana Krasniqi",
        "customer_phone": "+383 44 111 222",
        **fields,
    }
    return client.post("/api/bookings", json=body)


def confirm(client: TestClient, headers: dict, booking_id: str):
    return client.post(f"/api/admin/bookings/{booking_id}/status", json={"status": "confirmed"}, headers=headers)


def pending_ids(client: TestClient, headers: dict) -> list[str]:
    return [b["id"] for b in client.get("/api/admin/bookings?view=pending", headers=headers).json()]


def unavailable(body: dict, day: date) -> dict[str, str]:
    return {entry["time"]: entry["reason"] for entry in body["unavailable"].get(day.isoformat(), [])}


def test_availability_follows_opening_hours(client: TestClient, service_id: str) -> None:
    body = client.get(f"/api/availability?items={service_id}:1").json()
    monday, sunday = next_weekday(1).isoformat(), next_weekday(7).isoformat()

    # Default hours: Mon 09–18, 60-minute service, 30-minute steps.
    assert body["days"][monday][0] == "09:00"
    assert body["days"][monday][-1] == "17:00"
    assert sunday not in body["days"]


def test_requests_overlap_until_one_is_confirmed(client: TestClient, service_id: str, admin_headers: dict) -> None:
    monday = next_weekday(1)
    first = request(client, service_id, monday, "10:00")
    assert first.status_code == 201, first.text
    assert first.json()["status"] == "pending"
    assert len(first.json()["reference"]) == 6

    # A pending request doesn't take the time: a second person can ask too.
    body = client.get(f"/api/availability?items={service_id}:1").json()
    assert "10:00" in body["days"][monday.isoformat()]
    second = request(client, service_id, monday, "10:30", customer_phone="+383 44 999 888")
    assert second.status_code == 201

    # Yllka sees the clash on both.
    listed = client.get("/api/admin/bookings?view=pending", headers=admin_headers).json()
    assert all(len(b["conflicts"]) == 1 for b in listed)
    assert client.get("/api/admin/bookings/summary", headers=admin_headers).json()["conflicts"] == 2

    ten, half_past = listed[0]["id"], listed[1]["id"]
    assert confirm(client, admin_headers, ten).status_code == 200

    # Now the website shows the time as booked, and the other can't be confirmed.
    body = client.get(f"/api/availability?items={service_id}:1").json()
    closed = unavailable(body, monday)
    assert closed["10:00"] == "booked" and closed["09:30"] == "booked" and closed["10:30"] == "booked"
    assert "11:00" in body["days"][monday.isoformat()]
    assert confirm(client, admin_headers, half_past).status_code == 409
    assert request(client, service_id, monday, "10:00", customer_phone="+383 45 000 000").status_code == 409


def test_days_off_and_closed_days_are_refused(client: TestClient, service_id: str, admin_headers: dict) -> None:
    monday = next_weekday(1)
    client.post("/api/admin/schedule/days-off", json={"starts_on": monday.isoformat()}, headers=admin_headers)

    assert request(client, service_id, monday, "10:00").status_code == 409
    assert request(client, service_id, next_weekday(7), "10:00").status_code == 409


def test_overlap_is_refused_by_the_database(client: TestClient, service_id: str, admin_headers: dict) -> None:
    """Even when two overlapping requests are confirmed at the same moment."""
    monday = next_weekday(1)
    request(client, service_id, monday, "12:00", customer_phone="+383 44 000 001")
    request(client, service_id, monday, "12:30", customer_phone="+383 44 000 002")
    ids = pending_ids(client, admin_headers)

    barrier = Barrier(2)
    original = booking_service._commit_or_conflict
    results: list[int] = []

    def slow_commit(db):
        barrier.wait(timeout=5)  # both have changed status before either commits
        original(db)

    booking_service._commit_or_conflict = slow_commit
    try:
        threads = [
            Thread(target=lambda booking_id=booking_id: results.append(
                confirm(TestClient(client.app), admin_headers, booking_id).status_code
            ))
            for booking_id in ids
        ]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()
    finally:
        booking_service._commit_or_conflict = original

    assert sorted(results) == [200, 409]


def test_admin_flow(client: TestClient, service_id: str, admin_headers: dict) -> None:
    monday = next_weekday(1)
    request(client, service_id, monday, "15:00")
    booking = client.get("/api/admin/bookings?view=pending", headers=admin_headers).json()[0]
    assert booking["start"] == "15:00" and booking["end"] == "16:00"
    assert booking["service_name"] == "Fëno"

    confirmed = client.post(
        f"/api/admin/bookings/{booking['id']}/status",
        json={"status": "confirmed", "message": "Ju presim!"},
        headers=admin_headers,
    )
    assert confirmed.status_code == 200
    assert confirmed.json()["admin_message"] == "Ju presim!"

    # Not every change makes sense.
    back_to_pending = client.post(
        f"/api/admin/bookings/{booking['id']}/status", json={"status": "pending"}, headers=admin_headers
    )
    assert back_to_pending.status_code == 422

    moved = client.post(
        f"/api/admin/bookings/{booking['id']}/reschedule",
        json={"date": monday.isoformat(), "time": "16:00"},
        headers=admin_headers,
    )
    assert moved.json()["start"] == "16:00" and moved.json()["end"] == "17:00"

    noted = client.put(
        f"/api/admin/bookings/{booking['id']}/note", json={"admin_note": "Flokë të gjata"}, headers=admin_headers
    )
    assert noted.json()["admin_note"] == "Flokë të gjata"

    cancelled = client.post(
        f"/api/admin/bookings/{booking['id']}/status", json={"status": "cancelled"}, headers=admin_headers
    )
    assert cancelled.json()["status"] == "cancelled"
    # A cancelled booking frees its time.
    assert request(client, service_id, monday, "16:00", customer_phone="+383 49 123 456").status_code == 201


def test_lists_are_nearest_first(client: TestClient, service_id: str, admin_headers: dict) -> None:
    later, sooner = next_weekday(2) + timedelta(days=7), next_weekday(1)
    request(client, service_id, later, "10:00")
    request(client, service_id, sooner, "11:00", customer_phone="+383 44 555 666")

    upcoming = client.get("/api/admin/bookings?view=upcoming", headers=admin_headers).json()
    assert [b["date"] for b in upcoming] == [sooner.isoformat(), later.isoformat()]

    summary = client.get("/api/admin/bookings/summary", headers=admin_headers).json()
    assert summary["pending"] == 2 and summary["upcoming"] == 2


def test_admin_can_add_an_appointment(client: TestClient, service_id: str, admin_headers: dict) -> None:
    sunday = next_weekday(7)  # closed for the website, but Yllka decides
    created = client.post(
        "/api/admin/bookings",
        json={
            "items": [{"service_id": service_id}],
            "date": sunday.isoformat(),
            "time": "11:00",
            "duration_minutes": 90,
            "customer_name": "Sara",
            "customer_phone": "044 222 333",
        },
        headers=admin_headers,
    )
    assert created.status_code == 201, created.text
    assert created.json()["status"] == "confirmed"
    assert created.json()["end"] == "12:30"

    calendar = client.get(
        f"/api/admin/bookings/calendar?from={sunday.isoformat()}&to={sunday.isoformat()}", headers=admin_headers
    ).json()
    assert len(calendar) == 1


def test_pending_limit_per_phone(client: TestClient, service_id: str, admin_headers: dict) -> None:
    monday = next_weekday(1)
    for at in ("09:00", "10:00", "11:00"):
        assert request(client, service_id, monday, at).status_code == 201

    refused = request(client, service_id, monday, "13:00")
    assert refused.status_code == 429
    assert refused.json()["code"] == "pending_limit"

    # Once Yllka confirms one, that one no longer counts.
    first = client.get("/api/admin/bookings?view=pending", headers=admin_headers).json()[0]
    client.post(f"/api/admin/bookings/{first['id']}/status", json={"status": "confirmed"}, headers=admin_headers)
    assert request(client, service_id, monday, "13:00").status_code == 201


def test_rate_limit_per_visitor(client: TestClient, service_id: str) -> None:
    monday = next_weekday(1)
    for number in range(10):
        # Different phones and an unbookable time: only the attempt counts.
        request(client, service_id, monday, "10:15", customer_phone=f"+383 44 000 {number:03d}")
    refused = request(client, service_id, monday, "10:00", customer_phone="+383 44 999 999")
    assert refused.status_code == 429
    assert refused.json()["code"] == "rate_limited"


def test_validation(client: TestClient, service_id: str) -> None:
    monday = next_weekday(1)
    assert request(client, service_id, monday, "10:00", customer_phone="call me").status_code == 422
    assert request(client, service_id, monday, "10:00", customer_email="nope").status_code == 422
    assert request(client, service_id, monday, "10:15").status_code == 409  # not on the grid


def test_admin_booking_routes_need_a_session(client: TestClient) -> None:
    assert client.get("/api/admin/bookings").status_code == 401
    assert client.get("/api/admin/bookings/summary").status_code == 401


def test_past_bookings_are_most_recent_first(client: TestClient, db, service_id: str, admin_headers: dict) -> None:
    from app.models import Booking

    now = datetime.now(UTC)
    for days_ago in (5, 1):
        start = now - timedelta(days=days_ago)
        db.add(
            Booking(
                reference=f"PAST{days_ago:02d}",
                status="completed",
                source="admin",
                service_name_sq="Fëno",
                price_type="fixed",
                start_time=start,
                end_time=start + timedelta(hours=1),
                block_start=start,
                block_end=start + timedelta(hours=1),
                manage_token=f"token-{days_ago}",
                customer_name="A",
                customer_phone="044000000",
            )
        )
    db.commit()
    past = client.get("/api/admin/bookings?view=past", headers=admin_headers).json()
    assert [b["reference"] for b in past] == ["PAST01", "PAST05"]


def test_break_blocks_bookings_and_taken_times_are_listed(
    client: TestClient, service_id: str, admin_headers: dict
) -> None:
    week = [
        {"weekday": d, "is_open": d < 7, "opens_at": "09:00", "closes_at": "18:00",
         **({"break_starts_at": "12:00", "break_ends_at": "13:00"} if d == 1 else {})}
        for d in range(1, 8)
    ]
    client.put("/api/admin/schedule/hours", json={"days": week}, headers=admin_headers)
    monday = next_weekday(1)
    request(client, service_id, monday, "09:00")
    confirm(client, admin_headers, pending_ids(client, admin_headers)[0])

    body = client.get(f"/api/availability?items={service_id}:1").json()
    free, closed = body["days"][monday.isoformat()], unavailable(body, monday)

    # 60-minute service: 11:30 would run into the break, 12:00 and 12:30 are in it.
    assert closed["11:30"] == closed["12:00"] == closed["12:30"] == "break"
    assert closed["09:00"] == closed["09:30"] == "booked"
    assert "13:00" in free and "11:00" in free
    assert not set(free) & set(closed)

    assert request(client, service_id, monday, "12:00", customer_phone="+383 49 000 000").status_code == 409


def test_every_hour_of_an_open_day_is_listed(client: TestClient, db, service_id: str, admin_headers: dict) -> None:
    """Too-soon and booked times stay in the day, as taken, not removed."""
    from app.services import availability_service
    from app.services.availability_service import local_datetime

    monday = next_weekday(1)
    request(client, service_id, monday, "15:00")
    confirm(client, admin_headers, pending_ids(client, admin_headers)[0])
    now = local_datetime(monday, datetime.strptime("10:00", "%H:%M").time())

    free, closed = availability_service.slots(db, 60, monday, monday, now=now, min_notice_minutes=120)
    reasons = dict(closed[monday])
    day = sorted(free[monday] + list(reasons))

    # 09:00 to 17:00 every 30 minutes: nothing is missing.
    assert day[0] == "09:00" and day[-1] == "17:00" and len(day) == 17
    assert reasons["09:00"] == reasons["11:30"] == "notice"  # before 12:00 (two hours' notice)
    assert reasons["14:30"] == reasons["15:00"] == reasons["15:30"] == "booked"
    assert free[monday][0] == "12:00"
