from django.db import models

class Declaration(models.Model):
    PERIODE_CHOICES = [
        ('MENSUELLE','Mensuelle'),
        ('TRIMESTRIELLE','Trimestrielle'),
        ('ANNUELLE','Annuelle'),
    ]
    STATUT_CHOICES = [
        ('BROUILLON','Brouillon'),
        ('SOUMISE','Soumise'),
        ('VALIDEE','Validée'),
        ('REJETEE','Rejetée'),
    ]
    recuperateur     = models.ForeignKey('recuperateurs.Recuperateur', on_delete=models.PROTECT,
                                         related_name='declarations')
    periode          = models.CharField(max_length=15, choices=PERIODE_CHOICES)
    annee            = models.IntegerField()
    mois             = models.IntegerField(null=True, blank=True)
    trimestre        = models.IntegerField(null=True, blank=True)
    # Quantités
    qte_recuperee    = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    qte_stockee      = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    qte_transferee   = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    qte_valorisee    = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    qte_eliminee     = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    statut           = models.CharField(max_length=15, choices=STATUT_CHOICES, default='BROUILLON')
    observations     = models.TextField(blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-annee','-created_at']

    def __str__(self):
        return f"Déclaration {self.periode} {self.annee} — {self.recuperateur}"
