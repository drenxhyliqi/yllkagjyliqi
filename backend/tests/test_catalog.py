from fastapi.testclient import TestClient


def make_category(client: TestClient, headers: dict, **fields) -> str:
    body = {"name_sq": "Flokë", "name_en": "Hair", **fields}
    response = client.post("/api/admin/categories", json=body, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()["id"]


def make_service(client: TestClient, headers: dict, category_id: str, **fields) -> dict:
    body = {"category_id": category_id, "name_sq": "Fëno", "price": 15, "duration_minutes": 45, **fields}
    response = client.post("/api/admin/services", json=body, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_admin_routes_need_a_session(client: TestClient) -> None:
    assert client.get("/api/admin/catalog").status_code == 401
    assert client.post("/api/admin/categories", json={"name_sq": "X"}).status_code == 401
    assert client.post("/api/admin/services", json={}).status_code == 401


def test_create_category_and_service(client: TestClient, admin_headers: dict) -> None:
    category_id = make_category(client, admin_headers)
    service = make_service(client, admin_headers, category_id, name_en="Blow-dry", price="12.50")

    assert service["slug"] == "blow-dry"
    assert service["price"] == 12.5
    catalog = client.get("/api/admin/catalog", headers=admin_headers).json()
    assert catalog[0]["slug"] == "hair"
    assert catalog[0]["services"][0]["name_sq"] == "Fëno"


def test_slugs_stay_unique(client: TestClient, admin_headers: dict) -> None:
    category_id = make_category(client, admin_headers)
    first = make_service(client, admin_headers, category_id, name_sq="Make-up për nuse")
    second = make_service(client, admin_headers, category_id, name_sq="Make-up për nuse")

    assert first["slug"] == "make-up-per-nuse"
    assert second["slug"] == "make-up-per-nuse-2"


def test_price_rules(client: TestClient, admin_headers: dict) -> None:
    category_id = make_category(client, admin_headers)
    missing = client.post(
        "/api/admin/services",
        json={"category_id": category_id, "name_sq": "X", "price_type": "fixed"},
        headers=admin_headers,
    )
    assert missing.status_code == 422

    on_request = make_service(client, admin_headers, category_id, price=50, price_type="on_request")
    assert on_request["price"] is None


def test_public_catalog_hides_inactive_and_translates(client: TestClient, admin_headers: dict) -> None:
    hair = make_category(client, admin_headers)
    hidden = make_category(client, admin_headers, name_sq="Fshehur", is_active=False)
    make_service(client, admin_headers, hair, name_en="Blow-dry")
    make_service(client, admin_headers, hair, name_sq="Gërsheta", is_active=False)
    make_service(client, admin_headers, hidden)

    sq = client.get("/api/catalog").json()
    en = client.get("/api/catalog?locale=en").json()

    assert [c["name"] for c in sq] == ["Flokë"]
    assert [s["name"] for s in sq[0]["services"]] == ["Fëno"]
    assert en[0]["name"] == "Hair"
    assert en[0]["services"][0]["name"] == "Blow-dry"


def test_category_with_services_cannot_be_deleted(client: TestClient, admin_headers: dict) -> None:
    category_id = make_category(client, admin_headers)
    service = make_service(client, admin_headers, category_id)

    refused = client.delete(f"/api/admin/categories/{category_id}", headers=admin_headers)
    assert refused.status_code == 409

    client.delete(f"/api/admin/services/{service['id']}", headers=admin_headers)
    assert client.delete(f"/api/admin/categories/{category_id}", headers=admin_headers).status_code == 204


def test_reorder(client: TestClient, admin_headers: dict) -> None:
    a = make_category(client, admin_headers, name_sq="A", name_en=None)
    b = make_category(client, admin_headers, name_sq="B", name_en=None)
    s1 = make_service(client, admin_headers, a, name_sq="Një")["id"]
    s2 = make_service(client, admin_headers, a, name_sq="Dy")["id"]

    assert client.put("/api/admin/categories-order", json={"ids": [b, a]}, headers=admin_headers).status_code == 204
    assert client.put(f"/api/admin/categories/{a}/services-order", json={"ids": [s2, s1]}, headers=admin_headers).status_code == 204
    # A list that doesn't match the current one is refused.
    assert client.put("/api/admin/categories-order", json={"ids": [a]}, headers=admin_headers).status_code == 422

    catalog = client.get("/api/admin/catalog", headers=admin_headers).json()
    assert [c["name_sq"] for c in catalog] == ["B", "A"]
    assert [s["name_sq"] for s in catalog[1]["services"]] == ["Dy", "Një"]


def test_moving_a_service_to_another_category(client: TestClient, admin_headers: dict) -> None:
    a = make_category(client, admin_headers, name_sq="A", name_en=None)
    b = make_category(client, admin_headers, name_sq="B", name_en=None)
    service = make_service(client, admin_headers, a)

    moved = client.put(
        f"/api/admin/services/{service['id']}",
        json={"category_id": b, "name_sq": "Fëno", "price": 20, "duration_minutes": 30},
        headers=admin_headers,
    )
    assert moved.status_code == 200
    assert moved.json()["category_id"] == b
