from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_register_login():
    reg_data = {
        "name": "Test Candidate",
        "email": "candidate_test@techcorp.io",
        "password": "testpassword123"
    }
    res_reg = client.post("/api/auth/register", json=reg_data)
    assert res_reg.status_code in [200, 400]

    login_data = {
        "email": "candidate_test@techcorp.io",
        "password": "testpassword123"
    }
    res_login = client.post("/api/auth/login", json=login_data)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()
