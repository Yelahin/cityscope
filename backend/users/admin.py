# Register your models here.

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group

from .models import ProxyGroup, User

# Register custom User model
admin.site.register(User, UserAdmin)

# Unregister original Group to register ProxyGroup
# This way we can stack Grop and User in same category in admin panel
admin.site.unregister(Group)
admin.site.register(ProxyGroup)
