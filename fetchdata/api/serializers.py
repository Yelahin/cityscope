from core.models import Place
from rest_framework import serializers


class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = "__all__"
