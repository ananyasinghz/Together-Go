"""Auth and profile API integration tests."""

from http_helpers import auth_headers


def test_login_invalid_credentials(client):
    r = client.post(
        "/api/auth/login",
        json={"registration_no": "nope", "password": "wrong"},
    )
    assert r.status_code == 401


def test_login_success_student(client, student1_token):
    assert student1_token


def test_auth_me_requires_token(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 403


def test_auth_me_success(client, student1_token):
    r = client.get("/api/auth/me", headers=auth_headers(student1_token))
    assert r.status_code == 200
    data = r.json()
    assert data["registration_no"] == "stu001"
    assert data["name"] == "Student One"
    assert data["is_admin"] is False


def test_change_password_wrong_old(client, student1_token):
    r = client.post(
        "/api/auth/change-password",
        headers=auth_headers(student1_token),
        json={"old_password": "notthepassword", "new_password": "newpass123"},
    )
    assert r.status_code == 400


def test_change_password_success(client, student1_token):
    r = client.post(
        "/api/auth/change-password",
        headers=auth_headers(student1_token),
        json={"old_password": "secretone1", "new_password": "newsecret99"},
    )
    assert r.status_code == 200

    r2 = client.post(
        "/api/auth/login",
        json={"registration_no": "stu001", "password": "newsecret99"},
    )
    assert r2.status_code == 200


def test_mark_notification_read(client, student1_token, student2_token):
    # stu001 creates carpool; stu002 joins -> notification to stu001
    create = client.post(
        "/api/carpools",
        headers=auth_headers(student1_token),
        json={
            "source": "A",
            "destination": "B",
            "date_time": "2026-05-01T10:00:00",
            "seats": 3,
            "notes": "",
        },
    )
    assert create.status_code == 200
    cid = create.json()["id"]

    client.post(
        "/api/carpools/join",
        headers=auth_headers(student2_token),
        json={"group_id": cid},
    )

    notes = client.get("/api/notifications", headers=auth_headers(student1_token))
    assert notes.status_code == 200
    items = notes.json()
    assert len(items) >= 1
    nid = items[0]["id"]

    r = client.post(
        f"/api/notifications/{nid}/read",
        headers=auth_headers(student1_token),
    )
    assert r.status_code == 200
