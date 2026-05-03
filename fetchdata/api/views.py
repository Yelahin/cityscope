from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer
from rest_framework import status
from core.models import Place
from .filters import PlaceFilterSet, PlaceOrderingFilter, PlaceSearchFilter
from .serializers import PlaceSerializer


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


@api_view(["POST"])
def register_user(request):
    user = UserSerializer(data=request.data)
    if user.is_valid():
        user.save()
        return Response(
            data={"message": "User was successfully created"},
            status=status.HTTP_201_CREATED,
        )
    else:
        return Response(
            data={"message": user.errors}, status=status.HTTP_400_BAD_REQUEST
        )
