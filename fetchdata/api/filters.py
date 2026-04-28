from django_filters import rest_framework as filters
from core.models import Place
from django.db.models import ExpressionWrapper, Value, F
from django.db.models.functions import Radians, ACos, Cos, Sin
from django.db.models import FloatField
from rest_framework.exceptions import ValidationError
from cityscope.settings.base import KILOMETERS
import logging
from rest_framework.filters import OrderingFilter



logger = logging.getLogger(__name__)

class PlaceFilterSet(filters.FilterSet):
    lat = filters.NumberFilter(method="do_nothing", label="Users latitude")
    lon = filters.NumberFilter(method="do_nothing", label="Users longitude")
    radius = filters.NumberFilter(method="get_radius", lookup_expr="lt", label="Radius of places")

    # Mock individual lat and lon parameters logic
    def do_nothing(self, queryset, name, value):
        return queryset

    def get_radius(self, queryset, name, value):
        if "distance" in queryset.query.annotations:
            return queryset.filter(distance__lt=value)
        return queryset

    class Meta:
        model = Place
        fields = [
            "name",
            "city",
            "address",
            "category",
            "rating",
            "price_level",
            "opening_status",
        ]

    # Add users latitude and longitude to filters
    def filter_queryset(self, queryset):
        latitude = self.form.cleaned_data.get("lat")
        longitude = self.form.cleaned_data.get("lon")
        radius = self.form.cleaned_data.get("radius")

        # Return queryset without distance if user coordinates were not provided
        if latitude is None and longitude is None and radius is None:
            return super().filter_queryset(queryset)

        # Check if user try to filter by radius without coordinates provided
        if radius and (not latitude and not longitude):
            logger.exception("Can not filter by radius without users coordinates provided!")
            raise ValidationError("Radius filter expect users coordinates: lat, lon")

        # Check if only one coordinate was provided
        if latitude is None or longitude is None:
            logger.exception("User provide only one coordinate!")
            raise ValidationError(
                "Both latitude and longitude should be provided!"
            )

        if 90 < latitude or latitude < -90:
            logger.exception(f"{latitude} is invalid value for latitutde!")
            raise ValidationError("Latitude should be less than 90.0 and greater than -90.0")
        
        if 180 < longitude or longitude < -180:
            logger.exception(f"{longitude} is invalid value for longitude!")
            raise ValidationError("Longitude should be less than 180.0 and greater than -180.0")
        
        distance = ExpressionWrapper(
                KILOMETERS
                * ACos(
                    Cos(Radians(F("latitude")))
                    * Cos(Radians(Value(latitude)))
                    * Cos(Radians(F("longitude")) - Radians(Value(longitude)))
                    + Sin(Radians(F("latitude")))
                    * Sin(Radians(Value(latitude)))
                ),
                output_field=FloatField(),
            )
        
        queryset = queryset.annotate(distance=distance)

        return super().filter_queryset(queryset)
    

class PlaceOrderingFilter(OrderingFilter):
    class Meta:
        model = Place

    def filter_queryset(self, request, queryset, view):
        ordering_field = request.query_params.get("ordering")

        if (ordering_field == "distance" or ordering_field == "-distance") and "distance" not in queryset.query.annotations:
            logger.exception("Order by distance without providing coordinates")
            raise ValidationError("Can't order by distance without users coordinates provided!")
        return super().filter_queryset(request, queryset, view)
        