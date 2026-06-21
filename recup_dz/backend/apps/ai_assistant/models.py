from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()


class AIConversation(models.Model):
    CONTEXTE_CHOICES = [
        ('GENERAL', 'Général'),
        ('AGREMENTS', 'Agréments'),
        ('BSD', 'Bordereaux de suivi des déchets'),
        ('NOMENCLATURE', 'Nomenclature des déchets'),
        ('STOCKS', 'Stocks et opérations'),
        ('REGLEMENTAIRE', 'Réglementaire'),
        ('DASHBOARD', 'Tableau de bord'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations')
    contexte = models.CharField(max_length=30, choices=CONTEXTE_CHOICES, default='GENERAL')
    entite_id = models.CharField(max_length=50, blank=True)
    titre = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-updated_at', '-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['contexte', 'created_at']),
            models.Index(fields=['entite_id', 'contexte']),
        ]

    def __str__(self):
        return self.titre


class AIMessage(models.Model):
    ROLE_CHOICES = [
        ('USER', 'Utilisateur'),
        ('ASSISTANT', 'Assistant IA'),
        ('SYSTEM', 'Système'),
    ]

    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='USER')
    message = models.TextField()
    contexte_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['role', 'created_at']),
        ]

    def __str__(self):
        return f"{self.get_role_display()} - {self.message[:60]}"


class AIAlert(models.Model):
    TYPE_CHOICES = [
        ('AGREMENT_EXPIRE', 'Agrément expiré'),
        ('AGREMENT_EXPIRING', 'Agrément bientôt expiré'),
        ('AGREMENT_STATUT', 'Statut agrément inhabituel'),
        ('BSD_ANOMALIE', 'Anomalie BSD'),
        ('BSD_SIGNATURE_MANQUANTE', 'Signature BSD manquante'),
        ('BSD_CODE_INCONNU', 'Code déchet BSD inconnu'),
        ('DECLARATION_RETARD', 'Déclaration en retard'),
        ('STOCK_ELEVE', 'Stock élevé'),
        ('REGLEMENTAIRE', 'Information réglementaire'),
        ('INFO', 'Information'),
    ]
    NIVEAU_CHOICES = [
        ('INFO', 'Information'),
        ('FAIBLE', 'Faible'),
        ('MOYEN', 'Moyen'),
        ('ELEVE', 'Élevé'),
        ('CRITIQUE', 'Critique'),
    ]

    type_alerte = models.CharField(max_length=30, choices=TYPE_CHOICES, default='INFO')
    niveau = models.CharField(max_length=15, choices=NIVEAU_CHOICES, default='MOYEN')
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_alerts')
    entite_type = models.CharField(max_length=50, blank=True)
    entite_id = models.CharField(max_length=50, blank=True)
    lien = models.CharField(max_length=500, blank=True)
    est_lue = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'est_lue', 'created_at']),
            models.Index(fields=['type_alerte', 'created_at']),
            models.Index(fields=['entite_type', 'entite_id']),
        ]

    def __str__(self):
        return f"{self.get_type_alerte_display()} - {self.get_niveau_display()}"


class KnowledgeBase(models.Model):
    CATEGORIE_CHOICES = [
        ('LOI', 'Loi'),
        ('DECRET', 'Décret'),
        ('REFERENTIEL', 'Référentiel'),
        ('GLOSSAIRE', 'Glossaire'),
        ('FAQ', 'FAQ'),
        ('GUIDE', 'Guide'),
        ('PROCEDURE', 'Procédure'),
        ('DECHETS_HOSPITALIERS', 'Déchets hospitaliers'),
        ('DECLARATION_TRIMESTRIELLE', 'Déclarations trimestrielles'),
        ('AUTRE', 'Autre'),
    ]

    categorie = models.CharField(max_length=40, choices=CATEGORIE_CHOICES, default='AUTRE')
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    reference_reglementaire = models.CharField(max_length=200, blank=True)
    langue = models.CharField(max_length=5, default='fr')
    tags = models.JSONField(default=list, blank=True)
    date_mise_a_jour = models.DateField(default=timezone.now)
    est_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['categorie', 'titre']
        indexes = [
            models.Index(fields=['categorie', 'est_active']),
            models.Index(fields=['reference_reglementaire']),
            models.Index(fields=['langue', 'est_active']),
        ]

    def __str__(self):
        return self.titre


class AIRecommendation(models.Model):
    TYPE_CHOICES = [
        ('GENERAL', 'Générale'),
        ('AGREMENT', 'Agrément'),
        ('BSD', 'BSD'),
        ('NOMENCLATURE', 'Nomenclature'),
        ('STOCK', 'Stock'),
        ('DECLARATION', 'Déclaration'),
        ('REGLEMENTAIRE', 'Réglementaire'),
    ]
    STATUT_CHOICES = [
        ('ACTIVE', 'Active'),
        ('EN_ATTENTE', 'En attente'),
        ('REJETEE', 'Rejetée'),
        ('REALISEE', 'Réalisée'),
        ('EXPIREE', 'Expirée'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_recommendations')
    type_recommandation = models.CharField(max_length=30, choices=TYPE_CHOICES, default='GENERAL')
    recommandation = models.TextField()
    contexte_json = models.JSONField(default=dict, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    date_echeance = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'statut', 'created_at']),
            models.Index(fields=['type_recommandation', 'statut']),
        ]

    def __str__(self):
        return f"{self.get_type_recommandation_display()} - {self.get_statut_display()}"
