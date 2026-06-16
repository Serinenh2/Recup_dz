from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InspectionViewSet, generate_pv

router = DefaultRouter()
router.register('', InspectionViewSet)

urlpatterns = [
    path('generate-pv/', generate_pv),
    path('', include(router.urls)),
]
