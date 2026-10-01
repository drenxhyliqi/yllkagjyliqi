"""Photos on Cloudinary, with Cloudinary's API replaced by a stand-in."""

import hashlib

import httpx
import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.integrations.storage import image_provider
from tests.test_portfolio import photo_bytes


@pytest.fixture
def cloudinary(monkeypatch: pytest.MonkeyPatch) -> list[dict]:
    settings = get_settings()
    for field, value in {
        "image_provider": "cloudinary",
        "cloudinary_cloud_name": "demo-cloud",
        "cloudinary_api_key": "key-123",
        "cloudinary_api_secret": "secret-456",
    }.items():
        monkeypatch.setattr(settings, field, value)

    calls: list[dict] = []

    def fake_post(url: str, data: dict, files=None, timeout=None) -> httpx.Response:
        calls.append({"url": url, "data": data, "files": files})
        body = (
            {"public_id": f"yllka/{data['public_id']}", "secure_url": f"https://res.cloudinary.com/demo-cloud/image/upload/yllka/{data['public_id']}.webp"}
            if url.endswith("/upload")
            else {"result": "ok"}
        )
        return httpx.Response(200, json=body, request=httpx.Request("POST", url))

    monkeypatch.setattr(image_provider.httpx, "post", fake_post)
    return calls


def test_signature_matches_cloudinary_rules() -> None:
    expected = hashlib.sha1(b"folder=yllka&public_id=abc&timestamp=1700000000secret").hexdigest()
    params = {"timestamp": "1700000000", "public_id": "abc", "folder": "yllka"}
    assert image_provider.cloudinary_signature(params, "secret") == expected


def test_upload_and_delete_go_to_cloudinary(client: TestClient, admin_headers: dict, cloudinary: list[dict]) -> None:
    response = client.post(
        "/api/admin/media",
        files={"file": ("photo.jpg", photo_bytes(), "image/jpeg")},
        headers=admin_headers,
    )
    assert response.status_code == 201, response.text
    media = response.json()
    assert media["url"].startswith("https://res.cloudinary.com/demo-cloud/")
    assert (media["width"], media["height"]) == (2400, 1600)

    upload = cloudinary[0]
    assert upload["url"] == "https://api.cloudinary.com/v1_1/demo-cloud/image/upload"
    assert upload["data"]["api_key"] == "key-123" and upload["data"]["folder"] == "yllka"
    # The secret is only used to sign, never sent.
    assert "secret-456" not in str(upload["data"])
    assert upload["files"]["file"][2] == "image/webp"

    item = client.post(
        "/api/admin/portfolio", json={"title_sq": "A", "image_ids": [media["id"]]}, headers=admin_headers
    ).json()
    client.delete(f"/api/admin/portfolio/{item['id']}", headers=admin_headers)
    destroy = cloudinary[-1]
    assert destroy["url"].endswith("/image/destroy")
    assert destroy["data"]["public_id"].startswith("yllka/")


def test_cloudinary_down_is_a_clear_error(client: TestClient, admin_headers: dict, cloudinary, monkeypatch) -> None:
    def failing_post(*args, **kwargs):
        raise httpx.ConnectError("unreachable")

    monkeypatch.setattr(image_provider.httpx, "post", failing_post)
    response = client.post(
        "/api/admin/media",
        files={"file": ("photo.jpg", photo_bytes(), "image/jpeg")},
        headers=admin_headers,
    )
    assert response.status_code == 503
