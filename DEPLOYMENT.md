# Deployment instructions for CityScope on VPS

## Pre requirements

- VPS with any modern Linux distribution: Ubuntu, Fedora, Debian, etc...
- Git installed
- Docker and Docker compose installed

## Installation

1. Clone the repository

```bash
git clone https://github.com/Yelahin/cityscope
```

2. Open the root directory

```bash
cd cityscope
```

3. Create **backend/.env** file for backend and create **frontend/.env.local** file for frontend

4. Set up variables in **backend/.env** and **frontend/.env.local** file. Variables displayed in **.env.example** file located both in backend and frontend app. Examples of **.env** file exists in **env.example** files both in 
frontend and backend folders.

Make sure:

- `DJANGO_DEBUG` set to `False`
- `DJANGO_SETTINGS_MODULE` set to `cityscope.settings.production`
- `SECRET_KEY` setting use real secure secret key. Example: `fxb7a0!f6%u7)w6mo!npwoi!5n$_sz0dtxccgm(id8)^796n94`
- `ALLOWED_HOSTS` setting contain your domains or VPS IP address. Example: [`cityscope.com`, `192.0.2.10`]
- `AUTH_COOKIE_DOMAIN` set to your frontend domain. (not IP address). Example: `cityscope.com`
- `CORS_ALLOWED_ORIGINS` set to your frontend domain or IP address. Example: [`https://cityscope.com`, `http://192.0.2.10`]
- `CSRF_TRUSTED_ORIGINS` set to your frontend domain or IP address. Example: [`https://cityscope.com`, `http://192.0.2.10`]

5. Build and start docker containers

```bash
docker compose up --build -d
```

6. Apply migrations

```bash
docker exec cityscope-backend python manage.py migrate
```

## Stop application

```bash
docker compose stop
```

## Start application

Normal mode:

```bash
docker compose up --build
```

Detached mode:

```bash
docker compose up --build -d
```

## Update application

1. Stop the application 

```bash
docker compose stop
```

2. Pull last version of project

```bash
git pull
```

3. Rebuild and start docker containers

```bash
docker compose up --build -d
```

4. Apply migrations

```bash
docker exec cityscope-backend python manage.py migrate
```