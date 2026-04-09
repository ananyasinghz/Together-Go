"""Admin API integration tests."""

import io

import pandas as pd

from http_helpers import auth_headers


def test_admin_routes_forbidden_for_student(client, student1_token):
    r = client.get("/api/admin/users", headers=auth_headers(student1_token))
    assert r.status_code == 403


def test_admin_list_users(client, admin_token):
    r = client.get("/api/admin/users", headers=auth_headers(admin_token))
    assert r.status_code == 200
    users = r.json()
    regs = {u["registration_no"] for u in users}
    assert "id101" in regs
    assert "stu001" in regs


def test_admin_upload_students(client, admin_token):
    buf = io.BytesIO()
    df = pd.DataFrame(
        {
            "Reg. No.": ["newstu01"],
            "Name": ["New Student Alpha"],
        }
    )
    df.to_excel(buf, index=False)
    buf.seek(0)
    raw = buf.getvalue()

    r = client.post(
        "/api/admin/upload-students",
        headers=auth_headers(admin_token),
        files={"file": ("batch.xlsx", raw, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )
    assert r.status_code == 200
    assert "uploaded" in r.json()["message"].lower() or "1" in r.json()["message"]

    # Default rule: first token of name (lower) + last 4 of reg no → "new" + "tu01"
    login = client.post(
        "/api/auth/login",
        json={"registration_no": "newstu01", "password": "newtu01"},
    )
    assert login.status_code == 200


def test_admin_reset_password(client, admin_token, student1_token):
    # Change stu001 password first
    client.post(
        "/api/auth/change-password",
        headers=auth_headers(student1_token),
        json={"old_password": "secretone1", "new_password": "tempchanged"},
    )

    r = client.post(
        "/api/admin/reset-password?registration_no=stu001",
        headers=auth_headers(admin_token),
    )
    assert r.status_code == 200

    # "Student One" → student + last 4 of "stu001" → studentu001
    ok = client.post(
        "/api/auth/login",
        json={"registration_no": "stu001", "password": "studentu001"},
    )
    assert ok.status_code == 200
