from django.contrib import admin
from .models import AIAlert, AIConversation, AIMessage, AIRecommendation, KnowledgeBase


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'contexte', 'titre', 'entite_id', 'created_at', 'updated_at']
    list_filter = ['contexte']
    search_fields = ['titre', 'user__username', 'user__email', 'entite_id']
    readonly_fields = ['created_at', 'updated_at', 'last_message_at']


@admin.register(AIMessage)
class AIMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'role', 'created_at']
    list_filter = ['role', 'conversation__contexte']
    search_fields = ['message', 'conversation__titre', 'conversation__user__username']
    readonly_fields = ['created_at']


@admin.register(AIAlert)
class AIAlertAdmin(admin.ModelAdmin):
    list_display = ['id', 'type_alerte', 'niveau', 'user', 'entite_type', 'entite_id', 'est_lue', 'created_at']
    list_filter = ['type_alerte', 'niveau', 'est_lue', 'entite_type']
    search_fields = ['description', 'user__username', 'entite_id']
    readonly_fields = ['created_at']


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ['id', 'categorie', 'titre', 'reference_reglementaire', 'langue', 'date_mise_a_jour', 'est_active']
    list_filter = ['categorie', 'langue', 'est_active']
    search_fields = ['titre', 'contenu', 'reference_reglementaire', 'tags']


@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'type_recommandation', 'statut', 'date_echeance', 'created_at', 'updated_at']
    list_filter = ['type_recommandation', 'statut']
    search_fields = ['recommandation', 'user__username', 'contexte_json']
    readonly_fields = ['created_at', 'updated_at']
