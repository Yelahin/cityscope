from django.urls import include, path
from rest_framework import routers

from .views import (
    CustomTokenObtainPairView,
    RegisterUserView,
    SavedSearchViewSet,
    get_csrf_token,
    get_me,
    logout_user,
)

router = routers.DefaultRouter()
router.register(r"searches", SavedSearchViewSet, basename="search")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "register/", RegisterUserView.as_view(), name="api_user_registration"
    ),
    path(
        "token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"
    ),
    path("logout/", logout_user, name="api_user_logout"),
    path("csrf/", get_csrf_token, name="api_csrf_token"),
    path("me/", get_me, name="api_current_user"),
]
