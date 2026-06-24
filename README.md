# Cityscope

<hr>

Cityscope is a geo search web app for discovering nearby places 

## Installation

<hr>

1) Clone the repository
```bash
git clone https://github.com/Yelahin/cityscope
```

2) Open project folder
```bash
cd cityscope
```

3) Create **backend/.env** file for backend and create **frontend/env.local** file for frontend

4) Set up variables in **backend/.env** and **frontend/.env.local** file. Variables displayed in **.env.example** file located both in backend and frontend app

```bash
SECRET_KEY=your-django-secret-key
POSTGRES_DB=name-of-your-db
POSTGRES_USER=username-of-your-db
POSTGRES_PASSWORD=password-of-your-db
POSTGRES_HOST=cityscope-postgres
```

5) Make sure Docker Engine or Docker Desktop is working

6) Create and run containers in detached mode
```bash
docker compose up --build -d
```

7) Apply database migrations
```bash
docker exec cityscope-backend python manage.py migrate
```