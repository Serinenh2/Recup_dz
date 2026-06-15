from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeclarationViewSet
router = DefaultRouter()
router.register('', DeclarationViewSet)
urlpatterns = [path('', include(router.urls))]
