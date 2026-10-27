# TaskFlow — To-Do List Application

A full-stack task management application built using FastAPI, SQLite, HTML, CSS, and JavaScript. The project demonstrates REST API development, database integration, automated testing, Docker containerization, and CI/CD automation using Jenkins.

## Project Overview

TaskFlow helps users organize and manage their daily tasks through a simple web interface. The application connects a lightweight frontend to a FastAPI backend and stores tasks in an SQLite database.

The project also includes an automated Jenkins pipeline that tests the application, builds a Docker image, and publishes the image to Docker Hub.

## Features

* Create tasks with a title, description, due date, and priority.
* View tasks through a web interface.
* Edit existing tasks.
* Mark tasks as completed.
* Delete tasks.
* Store task information in SQLite.
* Validate API requests using FastAPI.
* Run automated tests using pytest.
* Build a Docker image for consistent deployment.
* Automate testing and image publishing through Jenkins.

## Technology Stack

| Category           | Technologies               |
| ------------------ | -------------------------- |
| Frontend           | HTML5, CSS3, JavaScript    |
| Backend            | Python, FastAPI            |
| Database           | SQLite                     |
| API                | REST API                   |
| Testing            | pytest, FastAPI TestClient |
| Containerization   | Docker                     |
| CI/CD              | Jenkins                    |
| Source Control     | Git, GitHub                |
| Container Registry | Docker Hub                 |

## Project Structure

```text
todo-list-app/
├── app/
│   ├── main.py
│   ├── database.py
│   └── static/
│       ├── index.html
│       ├── style.css
│       └── script.js
├── tests/
│   └── test_main.py
├── requirements.txt
├── Dockerfile
├── Jenkinsfile
├── .dockerignore
├── .gitignore
└── README.md
```

## Application Architecture

The application follows a simple client-server architecture.

1. The user interacts with the HTML, CSS, and JavaScript frontend.
2. JavaScript sends HTTP requests to the FastAPI backend.
3. FastAPI validates requests and processes task operations.
4. The backend reads or updates task records in SQLite.
5. The API returns responses that the frontend uses to update the interface.

## Getting Started

### Prerequisites

Install the following tools:

* Python 3.10 or later
* Git
* Docker Desktop (optional, for containerized execution)

### 1. Clone the repository

```bash
git clone https://github.com/nithyashree0910/taskflow-todo-app.git
cd taskflow-todo-app
```

### 2. Create a virtual environment

On Windows:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

On Linux or macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Start the application

```bash
python -m uvicorn app.main:app --reload
```

Open the application in your browser:

* Web application: http://127.0.0.1:8000
* Interactive API documentation: http://127.0.0.1:8000/docs
* Health check: http://127.0.0.1:8000/health

The application initializes its SQLite database when it starts.

## REST API Endpoints

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/health`                       | Check application health |
| GET    | `/api/tasks`                    | Retrieve tasks           |
| POST   | `/api/tasks`                    | Create a task            |
| PUT    | `/api/tasks/{task_id}`          | Update a task            |
| PATCH  | `/api/tasks/{task_id}/complete` | Mark a task as completed |
| DELETE | `/api/tasks/{task_id}`          | Delete a task            |

Interactive API documentation is available at `/docs` while the application is running.

## Automated Testing

The project uses pytest and FastAPI's TestClient to test API functionality.

The test suite covers:

* Application health check.
* Task creation.
* Retrieving tasks.
* Completing tasks.
* Updating tasks.
* Deleting tasks.
* Rejecting a task with a blank title.

Run the tests using:

```bash
python -m pytest tests/test_main.py -v
```

**Current test coverage:** Seven automated test cases.

## Docker

Build the Docker image from the project root:

```bash
docker build -t taskflow-app:1.0 .
```

Run the container:

```bash
docker run -d --name taskflow-container -p 8001:8000 taskflow-app:1.0
```

Open the application at:

http://localhost:8001

Check the health endpoint:

```bash
curl http://localhost:8001/health
```

To stop the container:

```bash
docker stop taskflow-container
```

To remove the stopped container:

```bash
docker rm taskflow-container
```

The container uses port 8000 internally and exposes the application on port 8001 on the host.

## CI/CD Pipeline

The project uses Jenkins to automate testing and Docker image publishing.

### Pipeline stages

1. **Checkout:** Retrieves the source code from GitHub.
2. **Environment verification:** Checks Python and Docker availability.
3. **Virtual environment creation:** Creates an isolated Python environment.
4. **Dependency installation:** Installs the application and testing dependencies.
5. **Automated testing:** Executes the pytest test suite.
6. **Docker image build:** Builds the application image.
7. **Docker Hub publishing:** Pushes the numbered build image and the `latest` tag to Docker Hub.

### Pipeline workflow

```text
Developer
    |
    v
GitHub Repository
    |
    v
Jenkins Pipeline
    |
    v
Install Dependencies
    |
    v
Run Automated Tests
    |
    v
Build Docker Image
    |
    v
Push Image to Docker Hub
```

The pipeline has been executed successfully in the local Jenkins environment.



## Security Practices

* Exclude virtual environments and local database files from Git.
* Keep credentials and access tokens out of source code.
* Use `.gitignore` to exclude local files and `.dockerignore` to reduce unnecessary Docker build context.
* Store Docker Hub credentials in Jenkins Credentials rather than hardcoding them in the Jenkinsfile.
* Avoid committing passwords, API tokens, or other secrets to the repository.

## Future Enhancements

* Deploy the application to AWS EC2.
* Add user authentication and authorization.
* Add task filtering and search.
* Improve automated test coverage.
* Configure persistent database storage for containerized deployments.
* Add monitoring and deployment health checks.

## Learning Outcomes

Through this project, I gained practical experience in:

* Developing REST APIs with FastAPI.
* Connecting a backend application to SQLite.
* Building a frontend with HTML, CSS, and JavaScript.
* Writing automated API tests with pytest.
* Containerizing Python applications with Docker.
* Automating testing and Docker image publishing using Jenkins.
* Managing source code with Git and GitHub.

---

**Project:** TaskFlow — To-Do List Application
**Developer:** Nithya Shree
**Focus Areas:** Python Development, REST APIs, Docker, CI/CD, and Cloud Deployment
