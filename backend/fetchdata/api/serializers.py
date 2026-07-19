from rest_framework import serializers

from core.models import Category, City, Place


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ["id", "name"]


class PlaceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    city = CitySerializer(read_only=True)
    distance = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()

    # If distance in queryset get distance
    def get_distance(self, instance):
        if hasattr(instance, "distance") and instance.distance is not None:
            return round(instance.distance, 2)
        return None

    def get_is_favorite(self, instance):
        favorite_place_ids = self.context.get("favorite_place_ids", set())
        return instance.pk in favorite_place_ids

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
        read_only_fields = [field.name for field in model._meta.get_fields()]
