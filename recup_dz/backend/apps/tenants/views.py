from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.db.models import Count
from apps.accounts.permissions import IsSuperAdmin
from .models import Tenant
from .serializers import TenantSerializer

User = get_user_model()

class TenantViewSet(viewsets.ModelViewSet):
    module_label     = 'tenants'
    permission_classes = [IsSuperAdmin]
    queryset         = Tenant.objects.all()
    serializer_class = TenantSerializer
    filter_backends  = [filters.SearchFilter, DjangoFilterBackend]
    search_fields    = ['nom', 'slug', 'email', 'registre_commerce']
    filterset_fields = ['plan', 'statut', 'wilaya']

    @action(detail=True, methods=['post'])
    def creer_admin(self, request, pk=None):
        tenant   = self.get_object()
        username = request.data.get('username')
        password = request.data.get('password')
        email    = request.data.get('email', '')
        prenom   = request.data.get('first_name', '')
        nom      = request.data.get('last_name', '')
        if not username or not password:
            return Response({'error': 'username et password requis'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Ce nom utilisateur existe deja'}, status=400)
        user = User.objects.create_user(
            username=username, password=password,
            email=email, first_name=prenom, last_name=nom,
            role='ADMIN', tenant=tenant,
        )
        return Response({'status': 'Admin cree', 'username': user.username, 'tenant': tenant.nom})

    @action(detail=True, methods=['get'])
    def utilisateurs(self, request, pk=None):
        tenant = self.get_object()
        users  = User.objects.filter(tenant=tenant)
        return Response({
            'total': users.count(),
            'max':   tenant.max_users,
            'users': [{'id':u.id,'username':u.username,
                       'nom':f"{u.first_name} {u.last_name}".strip(),
                       'role':u.role,'actif':u.is_active} for u in users],
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = Tenant.objects.all()
        return Response({
            'total':     qs.count(),
            'actifs':    qs.filter(statut='ACTIF').count(),
            'essai':     qs.filter(statut='ESSAI').count(),
            'suspendus': qs.filter(statut='SUSPENDU').count(),
            'par_plan':  list(qs.values('plan').annotate(count=Count('id'))),
        })