from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeclarationViewSet, generate_dsd

router = DefaultRouter()
router.register('', DeclarationViewSet, basename='declaration')

urlpatterns = [
    path('generate-dsd/', generate_dsd),
    path('', include(router.urls)),
]
