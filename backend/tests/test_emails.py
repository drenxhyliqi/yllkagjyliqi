"""Booking emails, with Resend replaced by a stand-in."""

import logging

import httpx
import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.services import notification_service
from tests.test_bookings import next_weekday, pending_ids


@pytest.fixture
def outbox(monkeypatch: pytest.MonkeyPatch) -> list[dict]:
    settings = get_settings()
    monkeypatch.setattr(settings, "resend_api_key", "re_test")
    monkeypatch.setattr(settings, "email_from", "Yllka <termine@example.test>")
    monkeypatch.setattr(settings, "site_url", "https://yllka.example")
    sent: list[dict] = []

    def fake_post(url, headers, json, timeout):
        assert url == notification_service.RESEND_API
        assert headers["Authorization"] == "Bearer re_test"
        sent.append(json)
        return httpx.Response(200, json={"id": "1"}, request=httpx.Request("POST", url))

    monkeypatch.setattr(notification_service.httpx, "post", fake_post)
    return sent


@pytest.fixture
def service_id(client: TestClient, admin_headers: dict) -> str:
    category = client.post("/api/admin/categories", json={"name_sq": "Flokë"}, headers=admin_headers).json()
    return client.post(
        "/api/admin/services",
        json={"category_id": category["id"], "name_sq": "Fëno", "name_en": "Blow-dry", "price": 15, "duration_minutes": 60},
        headers=admin_headers,
    ).json()["id"]


def request(client: TestClient, service_id: str, **fields):
    return client.post(
        "/api/bookings",
        json={
            "items": [{"service_id": service_id}],
            "date": next_weekday(1).isoformat(),
            "time": "10:00",
            "customer_name": "Ana <b>Krasniqi</b>",
            "customer_phone": "+383 44 111 222",
            **fields,
        },
    )


def test_new_request_emails_yllka_and_the_client(client: TestClient, service_id: str, admin_headers: dict, outbox) -> None:
    assert request(client, service_id, customer_email="ana@example.test", locale="en").status_code == 201

    to_admin, to_client = outbox
    assert to_admin["to"] == ["owner@example.test"]
    assert to_admin["subject"].startswith("Kërkesë e re: Ana")
    assert "https://yllka.example/admin/bookings/" in to_admin["html"]
    assert to_admin["reply_to"] == "ana@example.test"
    # What people typed is escaped, never HTML.
    assert "<b>Krasniqi</b>" not in to_admin["html"] and "&lt;b&gt;" in to_admin["html"]

    assert to_client["to"] == ["ana@example.test"]
    assert to_client["subject"].startswith("Your request was received")
    assert "Blow-dry" in to_client["text"]
    assert "https://yllka.example/en/booking/" in to_client["html"]


def test_no_client_email_without_an_address(client: TestClient, service_id: str, outbox) -> None:
    request(client, service_id)
    assert [email["to"] for email in outbox] == [["owner@example.test"]]


def test_confirmation_carries_yllkas_message(client: TestClient, service_id: str, admin_headers: dict, outbox) -> None:
    request(client, service_id, customer_email="ana@example.test")
    outbox.clear()
    booking_id = pending_ids(client, admin_headers)[0]
    client.post(
        f"/api/admin/bookings/{booking_id}/status",
        json={"status": "confirmed", "message": "Ju pres me kënaqësi!"},
        headers=admin_headers,
    )
    (email,) = outbox
    assert email["subject"].startswith("Termini juaj u konfirmua")
    assert "Ju pres me kënaqësi!" in email["text"]

    # Marking it done later sends nothing.
    outbox.clear()
    client.post(f"/api/admin/bookings/{booking_id}/status", json={"status": "completed"}, headers=admin_headers)
    assert outbox == []


def test_client_cancel_tells_yllka(client: TestClient, service_id: str, outbox) -> None:
    token = request(client, service_id, customer_email="ana@example.test").json()["manage_token"]
    outbox.clear()
    client.post(f"/api/bookings/manage/{token}/cancel")
    subjects = [email["subject"] for email in outbox]
    assert subjects[0].startswith("Klienti anuloi terminin")
    assert subjects[1].startswith("Termini u anulua")


def test_without_a_key_emails_are_only_logged(client: TestClient, service_id: str, caplog) -> None:
    caplog.set_level(logging.INFO, logger="app.services.notification_service")
    assert request(client, service_id).status_code == 201
    assert "Email not sent (no RESEND_API_KEY)" in caplog.text


def test_a_failed_email_never_fails_the_booking(client: TestClient, service_id: str, outbox, monkeypatch) -> None:
    def broken(*args, **kwargs):
        raise httpx.ConnectError("down")

    monkeypatch.setattr(notification_service.httpx, "post", broken)
    assert request(client, service_id).status_code == 201
