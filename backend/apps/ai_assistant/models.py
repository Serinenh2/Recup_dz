from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AIConversation(models.Model):
    CONTEXT_CHOICES = [
        ('general', 'Général'),
        ('bsd', 'BSD'),
        ('recuperateur', 'Récupérateur'),
        ('operateur', 'Opérateur'),
        ('stock', 'Stock'),
        ('agrement', 'Agrément'),
        ('nomenclature', 'Nomenclature'),
        ('inspection', 'Inspection'),
        ('declaration', 'Déclaration'),
        ('dashboard', 'Tableau de bord'),
    ]

    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations')
    contexte = models.CharField(max_length=30, choices=CONTEXT_CHOICES, default='general')
    entite_id = models.PositiveIntegerField(null=True, blank=True, help_text="ID de l'entité concernée (BSD, récupérateur, etc.)")
    titre = models.CharField(max_length=200, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_derniere_activite = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_derniere_activite']
        indexes = [
            models.Index(fields=['utilisateur', '-date_derniere_activite']),
        ]

    def __str__(self):
        return f"Conversation #{self.id} — {self.utilisateur.username} ({self.contexte})"


class AIMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'Utilisateur'),
        ('assistant', 'Assistant'),
        ('system', 'Système'),
    ]

    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    message = models.TextField()
    contexte_json = models.JSONField(null=True, blank=True, help_text="Contexte de la plateforme associé")
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date_creation']
        indexes = [
            models.Index(fields=['conversation', 'date_creation']),
        ]

    def __str__(self):
        return f"Message #{self.id} ({self.role})"


class AIAlert(models.Model):
    TYPE_CHOICES = [
        ('bsd_retard', 'BSD en retard'),
        ('bsd_incomplet', 'BSD incomplet'),
        ('agrement_expire', 'Agrément expiré'),
        ('agrement_bientot_expire', 'Agrément bientôt expiré'),
        ('dechet_non_conforme', 'Déchet non conforme'),
        ('stock_depasse', 'Stock dépassé'),
        ('transport_non_autorise', 'Transport non autorisé'),
        ('traitement_non_conforme', 'Traitement non conforme'),
        ('document_manquant', 'Document manquant'),
        ('inspection_requise', 'Inspection requise'),
        ('nomenclature_erreur', 'Erreur nomenclature'),
        ('autre', 'Autre'),
    ]

    NIVEAU_CHOICES = [
        ('info', 'Information'),
        ('warning', 'Avertissement'),
        ('danger', 'Danger'),
        ('critique', 'Critique'),
    ]

    type_alerte = models.CharField(max_length=40, choices=TYPE_CHOICES)
    niveau = models.CharField(max_length=20, choices=NIVEAU_CHOICES, default='warning')
    description = models.TextField()
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_alerts', null=True, blank=True)
    entite_type = models.CharField(max_length=50, blank=True, help_text="Type d'entité concernée (BSD, Agrement, etc.)")
    entite_id = models.PositiveIntegerField(null=True, blank=True)
    lien = models.URLField(blank=True)
    est_lue = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['utilisateur', 'est_lue', '-date_creation']),
            models.Index(fields=['type_alerte', 'niveau']),
        ]

    def __str__(self):
        return f"Alerte #{self.id} — {self.get_type_alerte_display()}"


class KnowledgeBase(models.Model):
    CATEGORIE_CHOICES = [
        ('loi', 'Loi'),
        ('decret', 'Décret exécutif'),
        ('referentiel', 'Référentiel'),
        ('procedure', 'Procédure'),
        ('agrement', 'Agrément'),
        ('nomenclature', 'Nomenclature'),
        ('glossaire', 'Glossaire'),
        ('guide', 'Guide'),
        ('faq', 'FAQ'),
        ('autre', 'Autre'),
    ]

    categorie = models.CharField(max_length=30, choices=CATEGORIE_CHOICES)
    titre = models.CharField(max_length=300)
    contenu = models.TextField()
    reference_reglementaire = models.CharField(max_length=200, blank=True, help_text="Article, décret, loi concerné")
    langue = models.CharField(max_length=5, default='fr', choices=[('fr', 'Français'), ('ar', 'Arabe')])
    tags = models.JSONField(default=list, blank=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)
    est_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['categorie', 'titre']
        indexes = [
            models.Index(fields=['categorie', 'est_active']),
            models.Index(fields=['langue']),
        ]

    def __str__(self):
        return f"{self.titre} ({self.get_categorie_display()})"


class AIRecommendation(models.Model):
    TYPE_CHOICES = [
        ('verification', 'Vérification'),
        ('analyse', 'Analyse'),
        ('alerte', 'Alerte'),
        ('optimisation', 'Optimisation'),
        ('formation', 'Formation'),
        ('correction', 'Correction'),
    ]

    STATUT_CHOICES = [
        ('nouvelle', 'Nouvelle'),
        ('en_cours', 'En cours de traitement'),
        ('traitee', 'Traitée'),
        ('ignoree', 'Ignorée'),
    ]

    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_recommendations')
    type_recommandation = models.CharField(max_length=30, choices=TYPE_CHOICES)
    recommandation = models.TextField()
    contexte_json = models.JSONField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='nouvelle')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_traitement = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['utilisateur', 'statut', '-date_creation']),
        ]

    def __str__(self):
        return f"Recommandation #{self.id} — {self.get_type_recommandation_display()}"
