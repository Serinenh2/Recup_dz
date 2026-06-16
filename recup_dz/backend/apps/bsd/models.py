from django.db import models
from django.conf import settings

class BordereauSuiviDechet(models.Model):
    STATUT_CHOICES = [
        ('BROUILLON','Brouillon'),
        ('EMIS',     'Émis'),
        ('EN_TRANSIT','En transit'),
        ('RECEPTIONNE','Réceptionné'),
        ('SIGNE',    'Signé'),
        ('ARCHIVE',  'Archivé'),
    ]
    numero           = models.CharField(max_length=30, unique=True, blank=True)
    recuperateur     = models.ForeignKey('recuperateurs.Recuperateur', on_delete=models.PROTECT,
                                         related_name='bsds')
    # Acteurs
    generateur_nom   = models.CharField(max_length=300)
    generateur_adresse = models.TextField(blank=True)
    transporteur_nom = models.CharField(max_length=300, blank=True)
    recepteur_nom    = models.CharField(max_length=300, blank=True)
    # Déchet
    code_dechet      = models.CharField(max_length=20)
    designation      = models.CharField(max_length=300)
    classe           = models.CharField(max_length=5, blank=True)
    quantite         = models.DecimalField(max_digits=12, decimal_places=3)
    unite            = models.CharField(max_length=10, default='KG')
    # Dates
    date_emission    = models.DateField()
    date_reception   = models.DateField(null=True, blank=True)
    statut           = models.CharField(max_length=20, choices=STATUT_CHOICES, default='BROUILLON')
    # Signatures
    signature_generateur  = models.BooleanField(default=False)
    signature_transporteur= models.BooleanField(default=False)
    signature_recepteur   = models.BooleanField(default=False)
    observations     = models.TextField(blank=True)
    created_by       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                         null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'BSD'

    def save(self, *args, **kwargs):
        if not self.numero:
            import uuid
            from datetime import date
            self.numero = f"BSD-{date.today().strftime('%Y')}-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.numero
