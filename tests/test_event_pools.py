"""Event pool API integration tests."""

import os

from pymongo import MongoClient

from http_helpers import auth_headers


def test_create_list_event_pool(client, student1_token):
    r = client.post(
        "/api/event-pools",
        headers=auth_headers(student1_token),
        json={
            "event_name": "Hackathon 2026",
            "event_date": "2026-09-01",
            "event_link": "https://example.com",
            "members_needed": 3,
            "requirements": "Laptop",
        },
    )
    assert r.status_code == 200
    assert r.json()["event_name"] == "Hackathon 2026"

    lst = client.get("/api/event-pools", headers=auth_headers(student1_token))
    assert lst.status_code == 200
    assert len(lst.json()) >= 1


def test_event_join_accept_full_notifications(client, student1_token, student2_token):
    create = client.post(
        "/api/event-pools",
        headers=auth_headers(student1_token),
        json={
            "event_name": "Team Contest",
            "event_date": "2026-10-01",
            "event_link": "",
            "members_needed": 2,
            "requirements": "",
        },
    )
    eid = create.json()["id"]

    client.post(
        "/api/event-pools/join",
        headers=auth_headers(student2_token),
        json={"group_id": eid},
    )

    client.post(
        "/api/event-pools/request-action",
        headers=auth_headers(student1_token),
        json={"group_id": eid, "user_id": "stu002", "action": "accept"},
    )

    mc = MongoClient(os.environ["MONGO_URL"])
    n = mc[os.environ["DB_NAME"]].notifications.count_documents({"type": "event_group_full"})
    mc.close()
    assert n >= 2
