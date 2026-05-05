from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer, SavedSearchSerializer
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import viewsets
from users.models import SavedSearch


class SavedSearchViewSet(viewsets.ModelViewSet):
    serializer_class = SavedSearchSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter, SearchFilter]
    ordering_fields = ["id", "name"]
    search_fields = ["name"]

    def get_queryset(self):
        return SavedSearch.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        return super().perform_create(serializer)
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)
        return super().perform_update(serializer)


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
