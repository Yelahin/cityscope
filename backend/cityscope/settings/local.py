from decouple import config

from cityscope.settings.base import *

DEBUG = config("DJANGO_DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

INSTALLED_APPS += []
