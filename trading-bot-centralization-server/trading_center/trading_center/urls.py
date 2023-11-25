from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PositionViewSet
from .views import UserViewSet

router = DefaultRouter()
router.register(r"positions", PositionViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path("", include(router.urls)),
]