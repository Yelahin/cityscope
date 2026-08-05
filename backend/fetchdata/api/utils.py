import logging

from django.db.models import (
    ExpressionWrapper,
    F,
    FloatField,
    Value,
)
from django.db.models.functions import ACos, Cos, Radians, Sin
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination

from cityscope.settings.base import KILOMETERS

logger = logging.getLogger(__name__)


def get_calculated_distance(latitude, longitude, logger=logger) -> FloatField:
    # Check if only one coordinate was provided
    if latitude is None or longitude is None:
        logger.exception("User provide only one coordinate!")
        if latitude is None:
            raise ValidationError(
                {"lat": ["Both latitude and longitude should be provided!"]}
            )
        raise ValidationError(
            {"lon": ["Both latitude and longitude should be provided!"]}
        )

    # Check if latitude and longitude are numbers
    try:
        latitude = float(latitude)
    except (ValueError, TypeError):
        logger.exception("Provided latitude is not a number!")
        raise ValidationError({"lat": ["lat should be numbers!"]})

    try:
        longitude = float(longitude)
    except (ValueError, TypeError):
        logger.exception("Provided longitude is not a number!")
        raise ValidationError({"lon": ["lon should be numbers!"]})

    # Validate latitude
    if latitude > 90 or latitude < -90:
        logger.exception(f"{latitude} is invalid value for latitutde!")
        raise ValidationError(
            {
                "lat": [
                    "Latitude should be less than 90.0 and greater than -90.0"
                ]
            }
        )

    # Validate longitude
    if longitude > 180 or longitude < -180:
        logger.exception(f"{longitude} is invalid value for longitude!")
        raise ValidationError(
            {
                "lon": [
                    "Longitude should be less than 180.0 and greater than -180.0"
                ]
            }
        )

    # Calculate distance
    return ExpressionWrapper(
        KILOMETERS
        * ACos(
            Cos(Radians(F("latitude")))
            * Cos(Radians(Value(latitude)))
            * Cos(Radians(F("longitude")) - Radians(Value(longitude)))
            + Sin(Radians(F("latitude"))) * Sin(Radians(Value(latitude)))
        ),
        output_field=FloatField(),
    )


class StandardResultSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = "page_size"
    max_page_size = 1000
