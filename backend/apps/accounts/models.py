from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('SUPERADMIN',   'Super Administrateur (Plateforme)'),
        ('ADMIN',        'Administrateur'),
        ('INSPECTEUR',   'Inspecteur'),
        ('RECUPERATEUR', 'Recuperateur'),
        ('READONLY',     'Consultation uniquement'),
    ]
    role       = models.CharField(max_length=20, choices=ROLE_CHOICES, default='READONLY')
    phone      = models.CharField(max_length=20, blank=True)
    wilaya     = models.CharField(max_length=3, blank=True)
    tenant     = models.ForeignKey(
        'tenants.Tenant', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='users'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"