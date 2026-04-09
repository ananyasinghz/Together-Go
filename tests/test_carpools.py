"""Carpool API integration tests."""

from http_helpers import auth_headers


def test_create_and_list_carpools(client, student1_token):
    r = client.post(
        "/api/carpools",
        headers=auth_headers(student1_token),
        json={
            "source": "Campus",
            "destination": "City Center",
            "date_time": "2026-06-15T08:00:00",
            "seats": 3,
            "notes": "Test ride",
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["source"] == "Campus"
    assert body["creator_id"] == "stu001"
    assert len(body["members"]) == 1

    lst = client.get("/api/carpools", headers=auth_headers(student1_token))
    assert lst.status_code == 200
    assert len(lst.json()) >= 1


def test_join_request_and_accept(client, student1_token, student2_token):
    create = client.post(
        "/api/carpools",
        headers=auth_headers(student1_token),
        json={
            "source": "A",
            "destination": "B",
            "date_time": "2026-07-01T09:00:00",
            "seats": 3,
            "notes": "",
        },
    )
    cid = create.json()["id"]

    j = client.post(
        "/api/carpools/join",
        headers=auth_headers(student2_token),
        json={"group_id": cid},
    )
    assert j.status_code == 200

    acc = client.post(
        "/api/carpools/request-action",
        headers=auth_headers(student1_token),
        json={"group_id": cid, "user_id": "stu002", "action": "accept"},
    )
    assert acc.status_code == 200

    pool = client.get("/api/carpools", headers=auth_headers(student1_token))
    found = next(c for c in pool.json() if c["id"] == cid)
    assert len(found["members"]) == 2


def test_join_duplicate_blocked(client, student1_token, student2_token):
    create = client.post(
        "/api/carpools",
        headers=auth_headers(student1_token),
        json={
            "source": "X",
            "destination": "Y",
            "date_time": "2026-07-02T09:00:00",
            "seats": 4,
            "notes": "",
        },
    )
    cid = create.json()["id"]
    client.post(
        "/api/carpools/join",
        headers=auth_headers(student2_token),
        json={"group_id": cid},
    )
    dup = client.post(
        "/api/carpools/join",
        headers=auth_headers(student2_token),
        json={"group_id": cid},
    )
    assert dup.status_code == 400
    assert "already" in dup.json()["detail"].lower() or "request" in dup.json()["detail"].lower()


def test_accept_reject_and_seat_cap(client, student1_token, student2_token, student3_token):
    create = client.post(
        "/api/carpools",
        headers=auth_headers(student1_token),
        json={
            "source": "P",
            "destination": "Q",
            "date_time": "2026-07-03T09:00:00",
            "seats": 2,
            "notes": "",
        },
    )
    cid = create.json()["id"]

    client.post(
        "/api/carpools/join",
        headers=auth_headers(student2_token),
        json={"group_id": cid},
    )
    client.post(
        "/api/carpools/join",
        headers=auth_headers(student3_token),
        json={"group_id": cid},
    )

    client.post(
        "/api/carpools/request-action",
        headers=auth_headers(student1_token),
        json={"group_id": cid, "user_id": "stu002", "action": "accept"},
    )

    full = client.post(
        "/api/carpools/request-action",
        headers=auth_headers(student1_token),
        json={"group_id": cid, "user_id": "stu003", "action": "accept"},
    )
    assert full.status_code == 400
    assert "seat" in full.json()["detail"].lower()

    # New carpool for reject path
    c2 = client.post(
        "/api/carpools",
        headers=auth_headers(student1_token),
        json={
            "source": "R",
            "destination": "S",
            "date_time": "2026-07-04T09:00:00",
            "seats": 4,
            "notes": "",
        },
    )
    id2 = c2.json()["id"]
    client.post(
        "/api/carpools/join",
        headers=auth_headers(student2_token),
        json={"group_id": id2},
    )
    rej = client.post(
        "/api/carpools/request-action",
        headers=auth_headers(student1_token),
        json={"group_id": id2, "user_id": "stu002", "action": "reject"},
    )
    assert rej.status_code == 200


def test_messages_for_carpool_group(client, student1_token):
    create = client.post(
        "/api/carpools",
        headers=auth_headers(student1_token),
        json={
            "source": "M1",
            "destination": "M2",
            "date_time": "2026-08-01T10:00:00",
            "seats": 2,
            "notes": "",
        },
    )
    gid = create.json()["id"]

    m = client.post(
        "/api/messages",
        headers=auth_headers(student1_token),
        json={"group_id": gid, "group_type": "carpool", "message": "Hello team"},
    )
    assert m.status_code == 200

    g = client.get(f"/api/messages/{gid}", headers=auth_headers(student1_token))
    assert g.status_code == 200
    assert len(g.json()) == 1
    assert g.json()[0]["message"] == "Hello team"
