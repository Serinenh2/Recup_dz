from django.contrib import admin
from .models import AIConversation, AIMessage, AIAlert, KnowledgeBase, AIRecommendation


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'utilisateur', 'contexte', 'entite_id', 'titre', 'date_derniere_activite']
    list_filter = ['contexte', 'date_creation']
    search_fields = ['utilisateur__username', 'titre']
    raw_id_fields = ['utilisateur']


@admin.register(AIMessage)
class AIMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'role', 'date_creation']
    list_filter = ['role', 'date_creation']
    search_fields = ['message']


@admin.register(AIAlert)
class AIAlertAdmin(admin.ModelAdmin):
    list_display = ['id', 'type_alerte', 'niveau', 'utilisateur', 'est_lue', 'date_creation']
    list_filter = ['type_alerte', 'niveau', 'est_lue']
    search_fields = ['description']
    actions = ['marquer_toutes_lues']

    def marquer_toutes_lues(self, request, queryset):
        queryset.update(est_lue=True)
    marquer_toutes_lues.short_description = "Marquer les alertes sélectionnées comme lues"


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ['id', 'titre', 'categorie', 'langue', 'est_active', 'date_mise_a_jour']
    list_filter = ['categorie', 'langue', 'est_active']
    search_fields = ['titre', 'contenu', 'reference_reglementaire']


@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ['id', 'utilisateur', 'type_recommandation', 'statut', 'date_creation']
    list_filter = ['type_recommandation', 'statut']
    search_fields = ['recommandation']
