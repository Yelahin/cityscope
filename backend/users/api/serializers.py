from rest_framework import serializers
from rest_framework.validators import ValidationError
from django.contrib.auth import get_user_model
from users.models import SavedSearch
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}, "username": {"validators": []}}

    def create(self, validated_data):
        username = validated_data.get("username")
        password = validated_data.get("password")
        email = validated_data.get("email")
        user = get_user_model().objects.create_user(
            username=username, password=password, email=email
        )
        return user

    def validate_password(self, value):
        validate_password(value)
        return value
    
    def validate_username(self, value):
        if get_user_model().objects.filter(username=value).exists():
            raise ValidationError(f"User with username '{value}' already exists!")
        return value
        
    def validate_email(self, value):
        if get_user_model().objects.filter(email=value).exists():
            raise ValidationError(f"'{value}' email alredy taken!")
        return value


class SavedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedSearch
        fields = "__all__"
        read_only_fields = ["user"]
