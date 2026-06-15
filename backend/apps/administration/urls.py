from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdministrationViewSet

router = DefaultRouter()
router.register('', AdministrationViewSet, basename='administration')
urlpatterns = [path('', include(router.urls))]