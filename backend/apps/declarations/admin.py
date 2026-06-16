from django.contrib import admin
from .models import Declaration

@admin.register(Declaration)
class DeclarationAdmin(admin.ModelAdmin):
    list_display  = ['denomination', 'annee', 'code_dechet', 'statut', 'created_at']
    list_filter   = ['statut', 'annee']
    search_fields = ['denomination', 'code_dechet']
