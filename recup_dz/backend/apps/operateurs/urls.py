from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OperateurViewSet

router = DefaultRouter()
router.register('', OperateurViewSet, basename='operateur')
urlpatterns = [path('', include(router.urls))]
