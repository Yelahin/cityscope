from decouple import Csv, config

from cityscope.settings.base import INSTALLED_APPS, SIMPLE_JWT

DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="", cast=Csv())

INSTALLED_APPS += []

SIMPLE_JWT["AUTH_COOKIE_SECURE"] = True
SIMPLE_JWT["AUTH_COOKIE_DOMAIN"] = config("AUTH_COOKIE_DOMAIN", default=None)

CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv())
