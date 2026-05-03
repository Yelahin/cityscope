from django.urls import include, path
from rest_framework import routers
from .views import PlaceViewSet, register_user
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r"places", PlaceViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("register/", register_user, name="api_user_registration"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
