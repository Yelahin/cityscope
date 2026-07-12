from django.urls import include, path
from .views import register_user, SavedSearchViewSet, CustomTokenObtainPairView, get_me
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r"searches", SavedSearchViewSet, basename="search")

urlpatterns = [
    path("", include(router.urls)),
    path("register/", register_user, name="api_user_registration"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me", get_me, name="me")
]
