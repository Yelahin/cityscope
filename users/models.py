from django.db import models
from django.contrib.auth.models import AbstractUser, Group
from core.models import Place

# Create your models here.


class User(AbstractUser):
    favorite_places = models.ManyToManyField(Place)


# Define proxy Group to stack User and Group in same admin category
class ProxyGroup(Group):
    pass

    class Meta:
        app_label = "users"
        proxy = True
        verbose_name = "Group"
        verbose_name_plural = "Groups"
