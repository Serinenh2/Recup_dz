from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from apps.accounts.permissions import ModulePermission
from .models import OperationRecuperation
from .serializers import OperationSerializer

class OperationViewSet(viewsets.ModelViewSet):
    module_label     = 'operations'
    permission_classes = [ModulePermission]
    queryset         = OperationRecuperation.objects.select_related(
        'recuperateur','generateur','transporteur','valorisateur','eliminateur'
    ).all()
    serializer_class = OperationSerializer
    filter_backends  = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields    = ['numero','code_dechet','designation_dechet',
                        'bon_livraison','bon_commande','chauffeur','immatriculation']
    filterset_fields = ['recuperateur','statut','classe_dechet','destination_type']
    ordering_fields  = ['date_recuperation','created_at','quantite']

    def perform_create(self, s):
        s.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        return Response({
            'total':             qs.count(),
            'quantite_totale':   qs.aggregate(t=Sum('quantite'))['t'] or 0,
            'par_statut':        list(qs.values('statut').annotate(count=Count('id'))),
            'par_destination':   list(qs.values('destination_type').annotate(count=Count('id'))),
            'par_classe':        list(qs.values('classe_dechet').annotate(count=Count('id'))),
        })
