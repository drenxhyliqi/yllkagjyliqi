import io
from pathlib import Path

from fastapi.testclient import TestClient
from PIL import Image

from app.core.config import get_settings


def photo_bytes(size: tuple[int, int] = (3000, 2000), fmt: str = "JPEG") -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, (200, 180, 160)).save(buffer, fmt)
    return buffer.getvalue()


def upload(client: TestClient, headers: dict, data: bytes | None = None) -> dict:
    response = client.post(
        "/api/admin/media",
        files={"file": ("photo.jpg", data or photo_bytes(), "image/jpeg")},
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_upload_resizes_and_converts(client: TestClient, admin_headers: dict) -> None:
    media = upload(client, admin_headers)

    assert (media["width"], media["height"]) == (2400, 1600)
    assert media["url"].startswith("/media/") and media["url"].endswith(".webp")
    assert (Path(get_settings().media_root) / media["url"].removeprefix("/media/")).exists()


def test_upload_rejects_non_images(client: TestClient, admin_headers: dict) -> None:
    response = client.post(
        "/api/admin/media",
        files={"file": ("notes.jpg", b"not really a photo", "image/jpeg")},
        headers=admin_headers,
    )
    assert response.status_code == 422


def test_upload_needs_a_session(client: TestClient) -> None:
    response = client.post("/api/admin/media", files={"file": ("p.jpg", photo_bytes(), "image/jpeg")})
    assert response.status_code == 401


def test_work_lifecycle(client: TestClient, admin_headers: dict) -> None:
    first, second = upload(client, admin_headers), upload(client, admin_headers)
    created = client.post(
        "/api/admin/portfolio",
        json={"title_sq": "Nuse verore", "image_ids": [first["id"], second["id"]], "is_featured": True},
        headers=admin_headers,
    )
    assert created.status_code == 201, created.text
    item = created.json()
    assert item["slug"] == "nuse-verore"
    assert [image["id"] for image in item["images"]] == [first["id"], second["id"]]

    public = client.get("/api/portfolio").json()
    assert public[0]["images"][0]["src"] == first["url"]
    assert public[0]["images"][0]["alt"] == "Nuse verore"

    # Dropping a photo deletes its file.
    first_file = Path(get_settings().media_root) / first["url"].removeprefix("/media/")
    updated = client.put(
        f"/api/admin/portfolio/{item['id']}",
        json={"title_sq": "Nuse verore", "image_ids": [second["id"]], "is_published": False},
        headers=admin_headers,
    )
    assert updated.status_code == 200
    assert not first_file.exists()
    # Hidden work is not public.
    assert client.get("/api/portfolio").json() == []
    assert client.get("/api/portfolio/nuse-verore").status_code == 404

    assert client.delete(f"/api/admin/portfolio/{item['id']}", headers=admin_headers).status_code == 204
    assert client.get("/api/admin/portfolio", headers=admin_headers).json() == []


def test_new_work_goes_first(client: TestClient, admin_headers: dict) -> None:
    for title in ("E para", "E dyta"):
        client.post(
            "/api/admin/portfolio",
            json={"title_sq": title, "image_ids": [upload(client, admin_headers)["id"]]},
            headers=admin_headers,
        )
    titles = [item["title_sq"] for item in client.get("/api/admin/portfolio", headers=admin_headers).json()]
    assert titles == ["E dyta", "E para"]


def test_a_photo_belongs_to_one_work(client: TestClient, admin_headers: dict) -> None:
    media = upload(client, admin_headers)
    body = {"title_sq": "A", "image_ids": [media["id"]]}
    assert client.post("/api/admin/portfolio", json=body, headers=admin_headers).status_code == 201
    assert client.post("/api/admin/portfolio", json=body, headers=admin_headers).status_code == 422


def test_category_with_work_cannot_be_deleted(client: TestClient, admin_headers: dict) -> None:
    category_id = client.post(
        "/api/admin/categories", json={"name_sq": "Nuse"}, headers=admin_headers
    ).json()["id"]
    client.post(
        "/api/admin/portfolio",
        json={"title_sq": "A", "category_id": category_id, "image_ids": [upload(client, admin_headers)["id"]]},
        headers=admin_headers,
    )
    assert client.delete(f"/api/admin/categories/{category_id}", headers=admin_headers).status_code == 409
