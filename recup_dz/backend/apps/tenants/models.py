from django.db import models

class Tenant(models.Model):
    """Représente une entreprise cliente (récupérateur abonné)"""
    PLAN_CHOICES = [
        ('STARTER',      'Starter — 1 utilisateur'),
        ('PROFESSIONAL', 'Professional — 5 utilisateurs'),
        ('ENTERPRISE',   'Enterprise — Illimité'),
    ]
    STATUT_CHOICES = [
        ('ACTIF',    'Actif'),
        ('SUSPENDU', 'Suspendu'),
        ('EXPIRE',   'Expiré'),
        ('ESSAI',    'Période d\'essai'),
    ]

    # Identité
    nom            = models.CharField(max_length=300, verbose_name="Nom de l'entreprise")
    slug           = models.SlugField(max_length=100, unique=True,
                      help_text="Identifiant unique ex: sarl-ecorecup")
    registre_commerce = models.CharField(max_length=100, blank=True)
    nif            = models.CharField(max_length=50, blank=True)
    nis            = models.CharField(max_length=50, blank=True)
    wilaya         = models.CharField(max_length=3, blank=True)
    telephone      = models.CharField(max_length=30, blank=True)
    email          = models.EmailField(blank=True)
    adresse        = models.TextField(blank=True)
    logo           = models.ImageField(upload_to='tenants/logos/', null=True, blank=True)

    # Abonnement
    plan           = models.CharField(max_length=20, choices=PLAN_CHOICES, default='STARTER')
    statut         = models.CharField(max_length=15, choices=STATUT_CHOICES, default='ESSAI')
    date_debut     = models.DateField(null=True, blank=True)
    date_fin       = models.DateField(null=True, blank=True)
    max_users      = models.IntegerField(default=1)

    # Config
    couleur_primaire = models.CharField(max_length=7, default='#4F46E5',
                        help_text="Couleur principale ex: #4F46E5")
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return f"{self.nom} ({self.slug})"

    @property
    def est_actif(self):
        from datetime import date
        if self.statut not in ('ACTIF', 'ESSAI'):
            return False
        if self.date_fin:
            return date.today() <= self.date_fin
        return True

    @property
    def jours_restants(self):
        from datetime import date
        if not self.date_fin:
            return None
        return (self.date_fin - date.today()).days
