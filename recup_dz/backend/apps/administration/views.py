from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import ModulePermission
from .models import AdministrationEnvironnement
from .serializers import AdministrationSerializer

class AdministrationViewSet(viewsets.ModelViewSet):
    module_label     = 'administration'
    permission_classes = [ModulePermission]
    queryset         = AdministrationEnvironnement.objects.all()
    serializer_class = AdministrationSerializer
    filter_backends  = [filters.SearchFilter, DjangoFilterBackend]
    search_fields    = ['denomination','nom_directeur','email']
    filterset_fields = ['type_administration','statut','wilaya']