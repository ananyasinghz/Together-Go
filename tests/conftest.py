"""
Pytest configuration: force test DB name before importing the FastAPI app.

Requires MongoDB at MONGO_URL (default mongodb://127.0.0.1:27017).
"""

from __future__ import annotations

import os
from datetime import datetime, timezone

# Must run before backend import so Motor binds to the test database.
os.environ["DB_NAME"] = "together_go_test"
os.environ.setdefault("MONGO_URL", "mongodb://127.0.0.1:27017")

import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient

import auth_utils  # noqa: E402
import server  # noqa: E402
from server import app  # noqa: E402

COLLECTIONS = ["carpools", "event_pools", "messages", "notifications"]


def _seed_users(sync_db) -> None:
    now = datetime.now(timezone.utc).isoformat()
    sync_db.users.insert_many(
        [
            {
                "registration_no": "id101",
                "name": "Admin",
                "password_hash": auth_utils.hash_password("prerna08"),
                "is_admin": True,
                "first_login": False,
                "created_at": now,
            },
            {
                "registration_no": "stu001",
                "name": "Student One",
                "password_hash": auth_utils.hash_password("secretone1"),
                "is_admin": False,
                "first_login": True,
                "created_at": now,
            },
            {
                "registration_no": "stu002",
                "name": "Student Two",
                "password_hash": auth_utils.hash_password("secrettwo2"),
                "is_admin": False,
                "first_login": True,
                "created_at": now,
            },
            {
                "registration_no": "stu003",
                "name": "Student Three",
                "password_hash": auth_utils.hash_password("secretth3"),
                "is_admin": False,
                "first_login": True,
                "created_at": now,
            },
        ]
    )


@pytest.fixture(scope="session")
def client() -> TestClient:
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def reset_db() -> None:
    url = os.environ["MONGO_URL"]
    name = os.environ["DB_NAME"]
    mc = MongoClient(url)
    sync_db = mc[name]
    for coll in COLLECTIONS:
        sync_db[coll].delete_many({})
    sync_db.users.delete_many({})
    _seed_users(sync_db)
    mc.close()
    yield


@pytest.fixture
def admin_token(client: TestClient) -> str:
    r = client.post(
        "/api/auth/login",
        json={"registration_no": "id101", "password": "prerna08"},
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture
def student1_token(client: TestClient) -> str:
    r = client.post(
        "/api/auth/login",
        json={"registration_no": "stu001", "password": "secretone1"},
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture
def student2_token(client: TestClient) -> str:
    r = client.post(
        "/api/auth/login",
        json={"registration_no": "stu002", "password": "secrettwo2"},
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture
def student3_token(client: TestClient) -> str:
    r = client.post(
        "/api/auth/login",
        json={"registration_no": "stu003", "password": "secretth3"},
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]
