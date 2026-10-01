from fastapi.testclient import TestClient


def test_business_settings(client: TestClient, admin_headers: dict) -> None:
    assert client.get("/api/admin/business").status_code == 401

    response = client.put(
        "/api/admin/business",
        json={
            "business_name": "Yllka",
            "phone": "+383 44 123 456",
            "email": "",
            "street": "Rruga B",
            "city": "Prishtinë",
            "instagram": "https://www.instagram.com/yllka.hair/",
            "facebook_url": "facebook.com/yllka",
        },
        headers=admin_headers,
    )
    assert response.status_code == 200, response.text
    saved = response.json()
    assert saved["instagram"] == "yllka.hair"
    assert saved["email"] is None
    assert saved["facebook_url"] == "https://facebook.com/yllka"

    public = client.get("/api/business").json()
    assert public["instagram"] == {"handle": "yllka.hair", "url": "https://www.instagram.com/yllka.hair/"}
    assert public["address"] == {"street": "Rruga B", "city": "Prishtinë"}
    assert len(public["hours"]) == 7
    assert public["hours"][0] == {"weekday": 1, "opens": "09:00", "closes": "18:00"}


def test_business_settings_validation(client: TestClient, admin_headers: dict) -> None:
    for bad in ({"phone": "call me"}, {"email": "nope"}, {"instagram": "not a name!"}):
        response = client.put(
            "/api/admin/business", json={"business_name": "Yllka", **bad}, headers=admin_headers
        )
        assert response.status_code == 422, bad
