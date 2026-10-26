from contextlib import asynccontextmanager
from pathlib import Path
import sqlite3

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.database import get_connection, initialize_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="TaskFlow API",
    description="A To-Do List application built with FastAPI",
    version="1.0.0",
    lifespan=lifespan,
)


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=1000)
    due_date: str = ""
    priority: str = "Medium"


class TaskUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=1000)
    due_date: str = ""
    priority: str = "Medium"
    completed: bool = False


def task_to_dict(task):
    result = dict(task)
    result["completed"] = bool(result["completed"])
    return result


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/tasks")
def get_tasks():
    with get_connection() as connection:
        tasks = connection.execute(
            "SELECT * FROM tasks ORDER BY id DESC"
        ).fetchall()

    return [task_to_dict(task) for task in tasks]


@app.post("/api/tasks", status_code=201)
def create_task(task: TaskCreate):
    title = task.title.strip()

    if not title:
        raise HTTPException(status_code=422, detail="Task title is required")

    if task.priority not in {"Low", "Medium", "High"}:
        raise HTTPException(status_code=422, detail="Invalid priority")

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO tasks (title, description, due_date, priority)
            VALUES (?, ?, ?, ?)
            """,
            (title, task.description, task.due_date, task.priority),
        )
        created = connection.execute(
            "SELECT * FROM tasks WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()

    return task_to_dict(created)


@app.put("/api/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    title = task.title.strip()

    if not title:
        raise HTTPException(status_code=422, detail="Task title is required")

    if task.priority not in {"Low", "Medium", "High"}:
        raise HTTPException(status_code=422, detail="Invalid priority")

    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE tasks
            SET title = ?, description = ?, due_date = ?,
                priority = ?, completed = ?
            WHERE id = ?
            """,
            (
                title,
                task.description,
                task.due_date,
                task.priority,
                int(task.completed),
                task_id,
            ),
        )

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task not found")

        updated = connection.execute(
            "SELECT * FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()

    return task_to_dict(updated)


@app.patch("/api/tasks/{task_id}/complete")
def toggle_task(task_id: int):
    with get_connection() as connection:
        task = connection.execute(
            "SELECT * FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()

        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        new_status = 0 if task["completed"] else 1

        connection.execute(
            "UPDATE tasks SET completed = ? WHERE id = ?",
            (new_status, task_id),
        )

        updated = connection.execute(
            "SELECT * FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()

    return task_to_dict(updated)


@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM tasks WHERE id = ?", (task_id,)
        )

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task not found")


app.mount(
    "/",
    StaticFiles(directory=Path(__file__).parent / "static", html=True),
    name="frontend",
)

