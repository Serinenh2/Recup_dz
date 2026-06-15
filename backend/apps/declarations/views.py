from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Declaration
from .serializers import DeclarationSerializer
class DeclarationViewSet(viewsets.ModelViewSet):
    queryset = Declaration.objects.select_related('recuperateur').all()
    serializer_class = DeclarationSerializer
    filter_backends  = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['recuperateur','periode','annee','statut']
    @action(detail=True, methods=['post'])
    def soumettre(self, request, pk=None):
        d = self.get_object()
        d.statut = 'SOUMISE'
        d.save()
        return Response({'status': 'Soumise'})
    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        d = self.get_object()
        d.statut = 'VALIDEE'
        d.save()
        return Response({'status': 'Validée'})
