from datetime import timedelta

from fastapi.testclient import TestClient

from app.services.schedule_service import business_today

WEEK = [
    {"weekday": day, "is_open": day < 6, "opens_at": "10:00", "closes_at": "17:00"}
    for day in range(1, 8)
]


def test_schedule_starts_with_defaults(client: TestClient, admin_headers: dict) -> None:
    body = client.get("/api/admin/schedule", headers=admin_headers).json()

    assert body["timezone"] == "Europe/Belgrade"
    assert [day["weekday"] for day in body["hours"]] == [1, 2, 3, 4, 5, 6, 7]
    assert body["hours"][0] == {
        "weekday": 1,
        "is_open": True,
        "opens_at": "09:00:00",
        "closes_at": "18:00:00",
        "break_starts_at": None,
        "break_ends_at": None,
    }
    assert body["hours"][6]["is_open"] is False
    assert body["settings"] == {
        "slot_interval_minutes": 30,
        "min_notice_minutes": 120,
        "booking_window_days": 60,
        "buffer_minutes": 0,
        "home_visits": False,
        "travel_minutes": 30,
        "home_visit_note_sq": None,
        "home_visit_note_en": None,
        "cancellation_notice_hours": 24,
        "policy_sq": None,
        "policy_en": None,
    }
    assert body["days_off"] == []


def test_admin_routes_need_a_session(client: TestClient) -> None:
    assert client.get("/api/admin/schedule").status_code == 401
    assert client.put("/api/admin/schedule/hours", json={"days": WEEK}).status_code == 401


def test_public_schedule_is_readable(client: TestClient) -> None:
    assert client.get("/api/schedule").status_code == 200


def test_update_hours(client: TestClient, admin_headers: dict) -> None:
    response = client.put("/api/admin/schedule/hours", json={"days": WEEK}, headers=admin_headers)

    assert response.status_code == 200
    days = response.json()
    assert days[0]["opens_at"] == "10:00:00"
    # Closed days drop their hours.
    assert days[5] == {
        "weekday": 6,
        "is_open": False,
        "opens_at": None,
        "closes_at": None,
        "break_starts_at": None,
        "break_ends_at": None,
    }


def test_hours_are_validated(client: TestClient, admin_headers: dict) -> None:
    backwards = [dict(day, opens_at="18:00", closes_at="09:00") for day in WEEK]
    missing_day = WEEK[:6]

    for days in (backwards, missing_day):
        response = client.put("/api/admin/schedule/hours", json={"days": days}, headers=admin_headers)
        assert response.status_code == 422
        assert "message" in response.json()


def test_update_settings(client: TestClient, admin_headers: dict) -> None:
    update = {"slot_interval_minutes": 45, "min_notice_minutes": 1440, "booking_window_days": 90}
    response = client.put("/api/admin/schedule/settings", json=update, headers=admin_headers)
    assert response.status_code == 200
    assert {key: response.json()[key] for key in update} == update

    odd = dict(update, slot_interval_minutes=17)
    assert client.put("/api/admin/schedule/settings", json=odd, headers=admin_headers).status_code == 422


def test_days_off_lifecycle(client: TestClient, admin_headers: dict) -> None:
    start = business_today() + timedelta(days=3)
    created = client.post(
        "/api/admin/schedule/days-off",
        json={"starts_on": start.isoformat(), "ends_on": (start + timedelta(days=2)).isoformat(), "note": " Holiday "},
        headers=admin_headers,
    )
    assert created.status_code == 201
    period = created.json()
    assert period["note"] == "Holiday"

    listed = client.get("/api/admin/schedule", headers=admin_headers).json()["days_off"]
    assert [p["id"] for p in listed] == [period["id"]]

    url = f"/api/admin/schedule/days-off/{period['id']}"
    assert client.delete(url, headers=admin_headers).status_code == 204
    assert client.delete(url, headers=admin_headers).status_code == 404


def test_single_day_off_and_validation(client: TestClient, admin_headers: dict) -> None:
    day = business_today() + timedelta(days=1)
    single = client.post(
        "/api/admin/schedule/days-off", json={"starts_on": day.isoformat()}, headers=admin_headers
    ).json()
    assert single["starts_on"] == single["ends_on"] == day.isoformat()

    past = business_today() - timedelta(days=1)
    reversed_range = {"starts_on": day.isoformat(), "ends_on": past.isoformat()}
    for body in ({"starts_on": past.isoformat()}, reversed_range):
        assert client.post("/api/admin/schedule/days-off", json=body, headers=admin_headers).status_code == 422


def test_break_must_sit_inside_opening_hours(client: TestClient, admin_headers: dict) -> None:
    def week(**monday):
        return [{**WEEK[0], **monday}, *WEEK[1:]]

    ok = client.put(
        "/api/admin/schedule/hours",
        json={"days": week(break_starts_at="12:00", break_ends_at="13:00")},
        headers=admin_headers,
    )
    assert ok.status_code == 200
    assert ok.json()[0]["break_starts_at"] == "12:00:00"

    for bad in (
        {"break_starts_at": "12:00"},  # no end
        {"break_starts_at": "13:00", "break_ends_at": "12:00"},  # backwards
        {"break_starts_at": "08:00", "break_ends_at": "09:00"},  # before opening (10:00)
    ):
        response = client.put("/api/admin/schedule/hours", json={"days": week(**bad)}, headers=admin_headers)
        assert response.status_code == 422, bad
