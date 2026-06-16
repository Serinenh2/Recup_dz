from rest_framework import viewsets, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from .models import BordereauSuiviDechet
from .serializers import BSDSerializer
from .generate_bsd import generate_bsd_pdf

class BSDViewSet(viewsets.ModelViewSet):
    queryset = BordereauSuiviDechet.objects.select_related('recuperateur').all()
    serializer_class = BSDSerializer
    filter_backends  = [filters.SearchFilter, DjangoFilterBackend]
    search_fields    = ['numero','generateur_nom','code_dechet','designation']
    filterset_fields = ['recuperateur','statut','classe']

    def perform_create(self, s):
        s.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def generer_pdf(self, request, pk=None):
        bsd = self.get_object()
        data = BSDSerializer(bsd).data
        try:
            pdf  = generate_bsd_pdf(data)
            resp = HttpResponse(pdf, content_type='application/pdf')
            resp['Content-Disposition'] = f'attachment; filename="BSD_{bsd.numero}.pdf"'
            return resp
        except Exception as e:
            return Response({'error': str(e)}, status=500)

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_bsd(request):
    try:
        pdf  = generate_bsd_pdf(request.data)
        num  = request.data.get('numero', 'BSD')[:30].replace(' ','_')
        resp = HttpResponse(pdf, content_type='application/pdf')
        resp['Content-Disposition'] = f'attachment; filename="BSD_{num}.pdf"'
        return resp
    except Exception as e:
        return Response({'error': str(e)}, status=500)
