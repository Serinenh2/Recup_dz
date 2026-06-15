from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import BordereauSuiviDechet
from .serializers import BSDSerializer
class BSDViewSet(viewsets.ModelViewSet):
    queryset = BordereauSuiviDechet.objects.select_related('recuperateur').all()
    serializer_class = BSDSerializer
    filter_backends  = [filters.SearchFilter, DjangoFilterBackend]
    search_fields    = ['numero','generateur_nom','code_dechet','designation']
    filterset_fields = ['recuperateur','statut','classe']
    def perform_create(self, s):
        s.save(created_by=self.request.user)
    @action(detail=True, methods=['post'])
    def signer(self, request, pk=None):
        bsd = self.get_object()
        actor = request.data.get('actor','')
        if actor == 'generateur':   bsd.signature_generateur   = True
        if actor == 'transporteur': bsd.signature_transporteur = True
        if actor == 'recepteur':
            bsd.signature_recepteur = True
            bsd.statut = 'SIGNE'
        bsd.save()
        return Response({'status': 'Signé', 'bsd': BSDSerializer(bsd).data})
