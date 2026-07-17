from decouple import config

from cityscope.settings.base import *

DEBUG = config("DJANGO_DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "backend"]

INSTALLED_APPS += []

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://localhost:3000",
]

CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]

SIMPLE_JWT["AUTH_COOKIE_SECURE"] = False
SIMPLE_JWT["AUTH_COOKIE_DOMAIN"] = None
