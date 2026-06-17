from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = 'users'
    # Rename category in admin panel
    verbose_name = "Authentication"
