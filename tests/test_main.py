import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import initialize_database


@pytest.fixture
def client(tmp_path, monkeypatch):
    # Give each test its own temporary SQLite database.
    database_file = tmp_path / "test_todo.db"

    monkeypatch.setattr(
        "app.database.DATABASE_NAME",
        str(database_file),
    )

    initialize_database()

    with TestClient(app) as test_client:
        yield test_client


def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_create_task(client):
    response = client.post(
        "/api/tasks",
        json={
            "title": "Learn Jenkins",
            "description": "Create a CI/CD pipeline",
            "due_date": "",
            "priority": "High",
        },
    )

    assert response.status_code == 201

    task = response.json()
    assert task["title"] == "Learn Jenkins"
    assert task["description"] == "Create a CI/CD pipeline"
    assert task["priority"] == "High"
    assert task["completed"] is False
    assert "id" in task


def test_get_tasks(client):
    client.post(
        "/api/tasks",
        json={"title": "Learn Docker", "priority": "Medium"},
    )

    response = client.get("/api/tasks")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Learn Docker"


def test_complete_task(client):
    create_response = client.post(
        "/api/tasks",
        json={"title": "Complete project", "priority": "Medium"},
    )
    task_id = create_response.json()["id"]

    response = client.patch(f"/api/tasks/{task_id}/complete")

    assert response.status_code == 200
    assert response.json()["completed"] is True


def test_update_task(client):
    create_response = client.post(
        "/api/tasks",
        json={"title": "Old title", "priority": "Low"},
    )
    task_id = create_response.json()["id"]

    response = client.put(
        f"/api/tasks/{task_id}",
        json={
            "title": "Updated title",
            "description": "Updated description",
            "due_date": "",
            "priority": "High",
            "completed": False,
        },
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated title"
    assert response.json()["priority"] == "High"


def test_delete_task(client):
    create_response = client.post(
        "/api/tasks",
        json={"title": "Temporary task", "priority": "Medium"},
    )
    task_id = create_response.json()["id"]

    response = client.delete(f"/api/tasks/{task_id}")

    assert response.status_code == 204

    get_response = client.get("/api/tasks")
    assert get_response.json() == []


def test_create_task_rejects_blank_title(client):
    response = client.post(
        "/api/tasks",
        json={"title": "   ", "priority": "Medium"},
    )

    assert response.status_code == 422
