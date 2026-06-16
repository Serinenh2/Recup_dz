from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BSDViewSet, generate_bsd

router = DefaultRouter()
router.register('', BSDViewSet)

urlpatterns = [
    path('generate-bsd/', generate_bsd),
    path('', include(router.urls)),
]
