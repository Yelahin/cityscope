from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from core.models import Place
from .filters import PlaceFilterSet, PlaceOrderingFilter, PlaceSearchFilter
from .serializers import PlaceSerializer
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404


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
        queryset = request.user.favorite_places.all()
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
                    "message": f"Place was successfully saved to favorite places!"
                },
                status=status.HTTP_201_CREATED,
            )

        elif request.method == "DELETE":
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
                    "message": f"Place was successfully removed from favorite places!"
                },
                status=status.HTTP_200_OK,
            )
