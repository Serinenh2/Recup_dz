from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import ModulePermission
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    module_label     = 'archive'
    permission_classes = [ModulePermission]
    queryset         = Document.objects.select_related('uploaded_by').all()
    serializer_class = DocumentSerializer
    parser_classes   = [MultiPartParser, FormParser, JSONParser]
    filter_backends  = [filters.SearchFilter, DjangoFilterBackend]
    search_fields    = ['titre', 'description', 'tags', 'nom_original']
    filterset_fields = ['categorie']

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def perform_create(self, serializer):
        fichier = self.request.FILES.get('fichier')
        extra = {}
        if fichier:
            extra['nom_original'] = fichier.name
            extra['taille']       = fichier.size
            extra['type_mime']    = fichier.content_type or ''
        serializer.save(uploaded_by=self.request.user, **extra)

    def perform_update(self, serializer):
        fichier = self.request.FILES.get('fichier')
        extra = {}
        if fichier:
            extra['nom_original'] = fichier.name
            extra['taille']       = fichier.size
            extra['type_mime']    = fichier.content_type or ''
        serializer.save(**extra)