import logging

from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from core.models import Category, City, Place
from core.throttles import (
    CategoryDayThrottle,
    CategoryHourThrottle,
    CategoryMinThrottle,
    CityDayThrottle,
    CityHourThrottle,
    CityMinThrottle,
    PlaceDayThrottle,
    PlaceHourThrottle,
    PlaceMinThrottle,
)

from .filters import PlaceFilterSet, PlaceOrderingFilter, PlaceSearchFilter
from .serializers import CategorySerializer, CitySerializer, PlaceSerializer
from .utils import StandardResultSetPagination, get_calculated_distance

logger = logging.getLogger(__name__)


class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    throttle_classes = [PlaceMinThrottle, PlaceHourThrottle, PlaceDayThrottle]
    queryset = Place.objects.select_related("category", "city")
    serializer_class = PlaceSerializer
    pagination_class = StandardResultSetPagination
    permission_classes = [AllowAny]
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

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.user.is_authenticated:
            context["favorite_place_ids"] = set(
                self.request.user.favorite_places.values_list("pk", flat=True)
            )
        return context

    @action(
        detail=False,
        methods=["GET"],
        url_path="favorite",
        permission_classes=[IsAuthenticated],
        filter_backends=[
            DjangoFilterBackend,
            PlaceOrderingFilter,
            PlaceSearchFilter,
        ],
        filterset_class=PlaceFilterSet,
    )
    def favorite_places(self, request):
        queryset = request.user.favorite_places.select_related("category", "city")
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["GET", "POST", "DELETE"],
        permission_classes=[IsAuthenticated],
        url_path="favorite",
    )
    def detail_favorite_place(self, request, pk=None):
        place = get_object_or_404(Place, pk=pk)
        is_place_exists = request.user.favorite_places.filter(id=pk).exists()

        if request.method == "GET":
            if not is_place_exists:
                return Response(
                    data={
                        "message": f"Place with id {pk} not found in favorite places!"
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            latitude = request.query_params.get("lat")
            longitude = request.query_params.get("lon")

            if latitude is not None or longitude is not None:
                distance = get_calculated_distance(latitude, longitude, logger)
                if distance is not None:
                    place = (
                        Place.objects.filter(id=pk)
                        .annotate(distance=distance)
                        .first()
                    )

            serializer = self.get_serializer(place)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if request.method == "POST":
            if is_place_exists:
                return Response(
                    data={
                        "message": f"Place with id {pk} already in favorite places!"
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            request.user.favorite_places.add(place)
            return Response(
                data={
                    "message": "Place was successfully saved to favorite places!"
                },
                status=status.HTTP_201_CREATED,
            )

        if request.method == "DELETE":
            if not is_place_exists:
                return Response(
                    data={
                        "message": f"Place with id {pk} is not in favorite places!"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            request.user.favorite_places.remove(place)
            return Response(
                data={
                    "message": "Place was successfully removed from favorite places!"
                },
                status=status.HTTP_200_OK,
            )

        raise MethodNotAllowed(request.method)


class CategoryListView(generics.ListAPIView):
    throttle_classes = [CategoryMinThrottle, CategoryHourThrottle, CategoryDayThrottle]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = StandardResultSetPagination
    permission_classes = [AllowAny]


class CityListView(generics.ListAPIView):
    throttle_classes = [CityMinThrottle, CityHourThrottle, CityDayThrottle]
    queryset = City.objects.all()
    serializer_class = CitySerializer
    pagination_class = StandardResultSetPagination
    permission_classes = [AllowAny]
