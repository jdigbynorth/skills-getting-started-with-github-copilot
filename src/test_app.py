import pytest
from fastapi.testclient import TestClient
from app import app, activities

client = TestClient(app)

def test_root_redirect():
    response = client.get("/", allow_redirects=False)
    assert response.status_code in (302, 307)
    assert response.headers["location"].endswith("/static/index.html")

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_for_activity_success():
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Ensure clean state
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert email in activities[activity]["participants"]
    assert f"Signed up {email} for {activity}" in response.json()["message"]

def test_signup_for_activity_already_signed_up():
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Ensure user is signed up
    if email not in activities[activity]["participants"]:
        activities[activity]["participants"].append(email)
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already signed up"

def test_signup_for_activity_not_found():
    response = client.post("/activities/Nonexistent/signup?email=someone@mergington.edu")
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_unregister_from_activity_success():
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Ensure user is signed up
    if email not in activities[activity]["participants"]:
        activities[activity]["participants"].append(email)
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 200
    assert email not in activities[activity]["participants"]
    assert f"Unregistered {email} from {activity}" in response.json()["message"]

def test_unregister_from_activity_not_registered():
    activity = "Chess Club"
    email = "notregistered@mergington.edu"
    # Ensure user is not signed up
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Email not registered for this activity"

def test_unregister_from_activity_not_found():
    response = client.post("/activities/Nonexistent/unregister?email=someone@mergington.edu")
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"
