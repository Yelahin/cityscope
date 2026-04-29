from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.models import Place
from .serializers import PlaceSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .filters import PlaceFilterSet, PlaceOrderingFilter, PlaceSearchFilter


class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        PlaceOrderingFilter,
        PlaceSearchFilter,
    ]
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
    search_fields = ["name", "address"]
