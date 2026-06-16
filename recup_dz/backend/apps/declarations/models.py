from django.db import models
from django.conf import settings

class Declaration(models.Model):
    """DSD — Declaration des Dechets Speciaux Dangereux"""
    STATUT_CHOICES = [
        ('BROUILLON', 'Brouillon'),
        ('SOUMISE',   'Soumise'),
        ('VALIDEE',   'Validee'),
        ('ARCHIVEE',  'Archivee'),
    ]
    recuperateur     = models.ForeignKey('recuperateurs.Recuperateur',
                        on_delete=models.PROTECT, related_name='declarations', null=True, blank=True)
    annee            = models.CharField(max_length=4)
    date_transmission= models.DateField(null=True, blank=True)
    statut           = models.CharField(max_length=15, choices=STATUT_CHOICES, default='BROUILLON')
    # Identification
    denomination     = models.CharField(max_length=300, blank=True)
    statut_juridique = models.CharField(max_length=20, blank=True)
    siege_social     = models.TextField(blank=True)
    domaine_activite = models.TextField(blank=True)
    certification    = models.CharField(max_length=300, blank=True)
    responsable_dechets = models.CharField(max_length=200, blank=True)
    # Section A
    matiere_premiere    = models.TextField(blank=True)
    denomination_dechet = models.TextField(blank=True)
    code_dechet         = models.CharField(max_length=200, blank=True)
    consistance         = models.CharField(max_length=50, blank=True)
    autres_precisions   = models.TextField(blank=True)
    quantite_generee    = models.CharField(max_length=50, blank=True)
    composition_chimique= models.TextField(blank=True)
    critere_dangerosite = models.TextField(blank=True)
    stockage_temporaire_qte = models.CharField(max_length=50, blank=True)
    stockage_permanent_qte  = models.CharField(max_length=50, blank=True)
    modalites_stockage  = models.TextField(blank=True)
    # Section B
    modalites_gestion   = models.TextField(blank=True)
    modalites_controle  = models.TextField(blank=True)
    modalites_elimination = models.TextField(blank=True)
    types_installation  = models.TextField(blank=True)
    types_traitement    = models.TextField(blank=True)
    quantites_traitees  = models.CharField(max_length=50, blank=True)
    rendement_traitement= models.CharField(max_length=100, blank=True)
    # Section C
    reutilisation_qte   = models.CharField(max_length=50, default='0')
    recyclage_qte       = models.CharField(max_length=50, default='0')
    valorisation_qte    = models.CharField(max_length=50, default='0')
    elimination_qte     = models.CharField(max_length=50, default='0')
    mesures_min_prises  = models.TextField(blank=True)
    mesures_min_envisager = models.TextField(blank=True)
    mesures_bpe_prises  = models.TextField(blank=True)
    mesures_bpe_envisager = models.TextField(blank=True)
    mesures_tech_prises = models.TextField(blank=True)
    mesures_tech_envisager = models.TextField(blank=True)
    mesures_pp_prises   = models.TextField(blank=True)
    mesures_pp_envisager = models.TextField(blank=True)
    mesures_risques_prises = models.TextField(blank=True)
    mesures_risques_envisager = models.TextField(blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                    on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-annee', '-created_at']
        verbose_name = 'Declaration DSD'

    def __str__(self):
        return f"DSD {self.annee} — {self.denomination}"
