from django.urls import path
from core.views import health_endpoint

urlpatterns = [
    path('api/health/', health_endpoint, name='health')
]