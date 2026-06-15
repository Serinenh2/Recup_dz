from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.tenants.models import Tenant
from .serializers import UserSerializer
import uuid

User = get_user_model()

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == 'PATCH':
        s = UserSerializer(request.user, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)
    return Response(UserSerializer(request.user).data)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def mon_recuperateur(request):
    try:
        rec = request.user.recuperateur
    except Exception:
        return Response({'error': 'Aucune fiche recuperateur liee'}, status=404)
    if request.method == 'PATCH':
        from apps.recuperateurs.serializers import RecuperateurSerializer
        s = RecuperateurSerializer(rec, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)
    from apps.recuperateurs.serializers import RecuperateurSerializer
    return Response(RecuperateurSerializer(rec).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    nom_entreprise    = request.data.get('nom_entreprise', '').strip()
    nif               = request.data.get('nif', '').strip()
    nis               = request.data.get('nis', '').strip()
    registre_commerce = request.data.get('registre_commerce', '').strip()
    username          = request.data.get('username', '').strip()
    password          = request.data.get('password', '').strip()
    email             = request.data.get('email', '').strip()
    first_name        = request.data.get('first_name', '').strip()
    last_name         = request.data.get('last_name', '').strip()

    if not nom_entreprise:
        return Response({'error': "Le nom de l'entreprise est obligatoire"}, status=400)
    if not nif:
        return Response({'error': "Le NIF est obligatoire"}, status=400)
    if not nis:
        return Response({'error': "Le NIS est obligatoire"}, status=400)
    if not registre_commerce:
        return Response({'error': "Le Registre de Commerce est obligatoire"}, status=400)

    if not username:
        import re
        base = re.sub(r'[^a-z0-9]', '_', nom_entreprise.lower())[:20].strip('_')
        username = base
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}_{counter}"
            counter += 1

    if User.objects.filter(username=username).exists():
        return Response({'error': "Ce nom d'utilisateur est deja pris"}, status=400)

    if not password:
        password = str(uuid.uuid4())[:12].upper()

    import re, unicodedata
    slug_base = unicodedata.normalize('NFD', nom_entreprise.lower())
    slug_base = slug_base.encode('ascii', 'ignore').decode('ascii')
    slug_base = re.sub(r'[^a-z0-9]+', '-', slug_base).strip('-')[:50]
    slug = slug_base
    counter = 1
    while Tenant.objects.filter(slug=slug).exists():
        slug = f"{slug_base}-{counter}"
        counter += 1

    tenant = Tenant.objects.create(
        nom=nom_entreprise, slug=slug, email=email,
        nif=nif, nis=nis, registre_commerce=registre_commerce,
        plan='STARTER', statut='ACTIF', max_users=10,
    )

    user = User.objects.create_user(
        username=username, password=password, email=email,
        first_name=first_name, last_name=last_name,
        role='ADMIN', tenant=tenant,
    )

    return Response({
        'success': True,
        'message': f"Compte cree avec succes pour {nom_entreprise}",
        'username': username,
        'password': password,
        'tenant': tenant.nom,
    }, status=201)
