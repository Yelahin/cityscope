from rest_framework import serializers
from django.contrib.auth.models import User

from core.models import Place


class PlaceSerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()

    # If distance in queryset get distance
    def get_distance(self, instance):
        if hasattr(instance, "distance") and instance.distance is not None:
            return round(instance.distance, 2)

    # If latitude or longitude are missing in query parameters - remove distance from response
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context["request"]

        latitude = request.query_params.get("lat")
        longitude = request.query_params.get("lon")

        if latitude is None or longitude is None:
            data.pop("distance")

        return data

    class Meta:
        model = Place
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        username = validated_data.get("username")
        password = validated_data.get("password")
        user = User.objects.create_user(username=username, password=password)
        return user
