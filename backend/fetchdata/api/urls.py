from django.urls import include, path
from rest_framework import routers

from .views import CategoryListView, CityListView, PlaceViewSet

router = routers.DefaultRouter()
router.register(r"places", PlaceViewSet, basename="place")

urlpatterns = [
    path("", include(router.urls)),
    path("categories/", CategoryListView.as_view()),
    path("cities/", CityListView.as_view()),
]
