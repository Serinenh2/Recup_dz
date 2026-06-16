from django.db import models

class Nomenclature(models.Model):
    CLASSE_CHOICES = [
        ('MA','Ménagers et Assimilés'),
        ('I', 'Inertes'),
        ('S', 'Spéciaux'),
        ('SD','Spéciaux Dangereux'),
    ]
    code          = models.CharField(max_length=20, unique=True)
    famille       = models.CharField(max_length=10, blank=True)  # ex: "01"
    sous_famille  = models.CharField(max_length=20, blank=True)  # ex: "01 01"
    designation_fr= models.TextField()
    designation_ar= models.TextField(blank=True)
    classe        = models.CharField(max_length=5, choices=CLASSE_CHOICES)
    dangerosite_fr= models.TextField(blank=True)
    dangerosite_ar= models.TextField(blank=True)
    # Réglementaire
    bsd_obligatoire     = models.BooleanField(default=False)
    agrement_requis     = models.BooleanField(default=False)
    conditions_stockage = models.TextField(blank=True)
    conditions_transport= models.TextField(blank=True)
    filieres_valorisation = models.TextField(blank=True)
    filieres_elimination  = models.TextField(blank=True)
    # Danger checkboxes
    explosible             = models.BooleanField(default=False)
    inflammable            = models.BooleanField(default=False)
    toxique                = models.BooleanField(default=False)
    cancerogene            = models.BooleanField(default=False)
    corrosive              = models.BooleanField(default=False)
    infectieuse            = models.BooleanField(default=False)
    dangereuse_environnement = models.BooleanField(default=False)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"[{self.code}] {self.designation_fr[:60]}"

    @property
    def couleur_danger(self):
        return {'MA':'green','I':'green','S':'orange','SD':'red'}.get(self.classe,'gray')
