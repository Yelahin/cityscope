from django.conf import settings
from django.middleware.csrf import get_token
from rest_framework import status, viewsets
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    throttle_classes,
)
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from core.throttles import (
    GetMeHourThrottle,
    GetMeMinThrottle,
    LoginDayThrottle,
    LoginHourThrottle,
    LoginMinThrottle,
    RegisterDayThrottle,
    RegisterHourThrottle,
    RegisterMinThrottle,
    SavedSearchDayThrottle,
    SavedSearchHourThrottle,
    SavedSearchMinThrottle,
)
from users.models import SavedSearch

from .serializers import SavedSearchSerializer, UserSerializer


class SavedSearchViewSet(viewsets.ModelViewSet):
    throttle_classes = [SavedSearchMinThrottle, SavedSearchHourThrottle, SavedSearchDayThrottle]
    serializer_class = SavedSearchSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter, SearchFilter]
    ordering_fields = ["id", "name"]
    search_fields = ["name"]

    def get_queryset(self):
        return SavedSearch.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginMinThrottle, LoginHourThrottle, LoginDayThrottle]
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        access_token = response.data["access"]
        refresh_token = response.data["refresh"]

        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=access_token,
            max_age=int(
                settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()
            ),
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
            value=refresh_token,
            max_age=int(
                settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()
            ),
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        del response.data["access"]
        del response.data["refresh"]

        response.data["details"] = "Login successful!"

        return response


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([RegisterMinThrottle, RegisterHourThrottle, RegisterDayThrottle])
def register_user(request):
    user = UserSerializer(data=request.data)
    if user.is_valid():
        user.save()
        return Response(
            data={"message": "User was successfully created"},
            status=status.HTTP_201_CREATED,
        )
    return Response(data={"message": user.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@throttle_classes([GetMeMinThrottle, GetMeHourThrottle])
def get_me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def logout_user(request):
    response = Response({"details": "Logout successful!"})
    response.delete_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE"],
        path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
        domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
    )

    response.delete_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
        path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
        domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
    )

    response.delete_cookie("sessionid")
    return response
