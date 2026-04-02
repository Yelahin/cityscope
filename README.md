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

3) Create **.env** file

4) Set up variables in **.env** file. Variables displayed in .env.example file

```bash
SECRET_KEY=your-django-secret-key
POSTGRES_DB=name-of-your-db
POSTGRES_USER=username-of-your-db
POSTGRES_PASSWORD=password-of-your-db
POSTGRES_HOST=cityscope-postgres
```

5) Make sure Docker Engine or Docker Desktop is working

6) Create and run containers
```bash
docker compose up --build
```