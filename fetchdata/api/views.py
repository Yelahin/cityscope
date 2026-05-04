from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from core.models import Place
from .filters import PlaceFilterSet, PlaceOrderingFilter, PlaceSearchFilter
from .serializers import PlaceSerializer
from rest_framework.response import Response



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
            filter_backends=[DjangoFilterBackend, PlaceOrderingFilter, PlaceSearchFilter],
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
    