from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer
from rest_framework import status


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
