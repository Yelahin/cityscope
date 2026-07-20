from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser, Group
from django.core.exceptions import ValidationError
from django.db import models

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


def validate_search_params(value):
    if not isinstance(value, dict):
        raise ValidationError(message="params value should be json object!")


class SavedSearch(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    params = models.JSONField(validators=[validate_search_params])
