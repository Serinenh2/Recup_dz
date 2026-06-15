from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Inspection
from .serializers import InspectionSerializer
class InspectionViewSet(viewsets.ModelViewSet):
    queryset = Inspection.objects.select_related('recuperateur','inspecteur').all()
    serializer_class = InspectionSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['recuperateur','type_inspection','resultat']
    search_fields    = ['pv_numero','observations']
    def perform_create(self, s):
        s.save(inspecteur=self.request.user)
