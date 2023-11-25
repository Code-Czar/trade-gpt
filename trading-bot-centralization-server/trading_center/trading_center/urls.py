from django.contrib import admin
from django.urls import path, include,  re_path
from rest_framework.routers import DefaultRouter
from .views import PositionViewSet
from .views import UserViewSet

router = DefaultRouter()
router.register(r"positions", PositionViewSet)
router.register(r"users", UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include(router.urls)),
    # re_path(r'^users/(?P<id>[0-9a-f-]+)/$', UserViewSet.as_view({'get': 'retrieve'})),

]
