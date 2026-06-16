from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NomenclatureViewSet
router = DefaultRouter()
router.register('', NomenclatureViewSet)
urlpatterns = [path('', include(router.urls))]
