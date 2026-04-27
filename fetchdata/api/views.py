from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.models import Place
from .serializers import PlaceSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter
from django.db.models import ExpressionWrapper, Value, F
from django.db.models.functions import Radians, ACos, Cos, Sin
from django.db.models import FloatField
from cityscope.settings.base import KILOMETERS


class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = [
        "name",
        "city",
        "address",
        "category",
        "rating",
        "price_level",
        "opening_status",
    ]



    # Add distance to queryset
    def get_queryset(self):
        queryset = super().get_queryset()

        # Get coordinates from request parameters
        latitude = self.request.query_params.get("lat")
        longitude = self.request.query_params.get("lon")

        # Return queryset without distance if user coordinates were not provided
        if latitude is None or longitude is None:
            return queryset
        
        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except ValueError:
            raise ValidationError("latitude and longitude should be floats")
        
        # Provide additional calculated field distance to queryset 
        queryset = queryset.annotate(distance=ExpressionWrapper(
            KILOMETERS * ACos(
                Cos(Radians(F("latitude"))) * Cos(Radians(Value(latitude))) *
                Cos(Radians(F("longitude")) - Radians(Value(longitude))) +
                Sin(Radians(F("latitude"))) * Sin(Radians(Value(latitude)))
            ),
            output_field=FloatField()
        ))
        return queryset.order_by("distance")
