from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.models import Place
from .serializers import PlaceSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from cityscope.settings.base import KILOMETERS
from .filters import PlaceFilterSet

class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PlaceFilterSet
