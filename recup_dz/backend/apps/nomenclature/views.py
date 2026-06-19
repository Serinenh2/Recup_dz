from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Nomenclature
from .serializers import NomenclatureSerializer

class NomenclatureViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Nomenclature.objects.all()
    serializer_class = NomenclatureSerializer
    filter_backends  = [filters.SearchFilter, DjangoFilterBackend]
    search_fields    = ['code','designation_fr','designation_ar']
    filterset_fields = ['classe','famille','bsd_obligatoire','agrement_requis']
    pagination_class = None
