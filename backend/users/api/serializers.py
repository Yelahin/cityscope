from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import SavedSearch
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        username = validated_data.get("username")
        password = validated_data.get("password")
        user = get_user_model().objects.create_user(
            username=username, password=password
        )
        return user

    def validate_password(self, value):
        validate_password(value)
        return value


class SavedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedSearch
        fields = "__all__"
        read_only_fields = ["user"]
