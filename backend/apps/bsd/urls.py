from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BSDViewSet
router = DefaultRouter()
router.register('', BSDViewSet)
urlpatterns = [path('', include(router.urls))]
