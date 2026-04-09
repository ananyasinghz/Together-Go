"""Unit tests for backend/auth_utils.py (fast; used with mutation testing)."""

from jose import jwt

from auth_utils import ALGORITHM, SECRET_KEY, create_access_token, hash_password, verify_password


def test_hash_and_verify_roundtrip():
    h = hash_password("my-secret-pass")
    assert verify_password("my-secret-pass", h)
    assert not verify_password("wrong-pass", h)


def test_create_access_token_contains_sub_and_exp():
    token = create_access_token({"sub": "user42"})
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "user42"
    assert "exp" in payload
