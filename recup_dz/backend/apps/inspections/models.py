from django.db import models
from django.conf import settings

class Inspection(models.Model):
    TYPE_CHOICES = [
        ('ROUTINE',   'Contrôle de routine'),
        ('SURPRISE',  'Contrôle inopiné'),
        ('PLAINTE',   'Suite à plainte'),
        ('SUIVI',     'Contrôle de suivi'),
    ]
    RESULTAT_CHOICES = [
        ('CONFORME',   'Conforme'),
        ('NON_CONFORME','Non conforme'),
        ('EN_COURS',   'En cours d\'examen'),
    ]
    recuperateur     = models.ForeignKey('recuperateurs.Recuperateur', on_delete=models.PROTECT,
                                         related_name='inspections')
    inspecteur       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                         null=True, blank=True)
    type_inspection  = models.CharField(max_length=15, choices=TYPE_CHOICES)
    date_inspection  = models.DateField()
    resultat         = models.CharField(max_length=15, choices=RESULTAT_CHOICES, blank=True)
    # PV
    pv_numero        = models.CharField(max_length=50, blank=True)
    pv_type          = models.CharField(max_length=50, blank=True)  # inspection, constatation, infraction
    observations     = models.TextField(blank=True)
    actions_correctives = models.TextField(blank=True)
    delai_regularisation = models.DateField(null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_inspection']

    def __str__(self):
        return f"Inspection {self.date_inspection} — {self.recuperateur}"
