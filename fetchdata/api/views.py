from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.models import Place
from .serializers import PlaceSerializer
from django_filters.rest_framework import DjangoFilterBackend


class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = [
        "name",
        "city",
        "address",
        "category",
        "rating",
        "price_level",
        "opening_status",
    ]
