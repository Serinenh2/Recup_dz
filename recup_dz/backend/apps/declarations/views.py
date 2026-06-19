from rest_framework import viewsets, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import ModulePermission
from .models import Declaration
from .serializers import DeclarationSerializer
from .generate_dsd import generate_dsd_pdf

class DeclarationViewSet(viewsets.ModelViewSet):
    module_label     = 'declarations'
    permission_classes = [ModulePermission]
    queryset         = Declaration.objects.select_related('recuperateur').all()
    serializer_class = DeclarationSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['recuperateur', 'annee', 'statut']
    search_fields    = ['denomination', 'code_dechet', 'annee']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def generer_pdf(self, request, pk=None):
        """Genere le PDF DSD pour une declaration existante"""
        decl = self.get_object()
        data = DeclarationSerializer(decl).data
        try:
            pdf = generate_dsd_pdf(data)
            resp = HttpResponse(pdf, content_type='application/pdf')
            resp['Content-Disposition'] = f'attachment; filename="DSD_{decl.denomination}_{decl.annee}.pdf"'
            return resp
        except Exception as e:
            return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_dsd(request):
    """Generate DSD PDF from form data (without saving)"""
    try:
        pdf = generate_dsd_pdf(request.data)
        nom    = request.data.get('denomination', 'DSD')[:20].replace(' ','_')
        annee  = request.data.get('annee', '2024')
        resp   = HttpResponse(pdf, content_type='application/pdf')
        resp['Content-Disposition'] = f'attachment; filename="DSD_{nom}_{annee}.pdf"'
        return resp
    except Exception as e:
        return Response({'error': str(e)}, status=500)
