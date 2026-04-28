from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.models import Place
from .serializers import PlaceSerializer
from django_filters.rest_framework import DjangoFilterBackend
from cityscope.settings.base import KILOMETERS
from rest_framework.filters import SearchFilter
from .filters import PlaceFilterSet, PlaceOrderingFilter

class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, PlaceOrderingFilter, SearchFilter]
    filterset_class = PlaceFilterSet
    ordering_fields = [
        "name",
        "address",
        "latitude",
        "longitude",
        "category",
        "city",
        "distance",
        ]
    search_fields = [
        "name",
        "address"
    ]