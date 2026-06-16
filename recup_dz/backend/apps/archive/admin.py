from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display  = ['titre', 'categorie', 'taille_lisible', 'uploaded_by', 'created_at']
    list_filter   = ['categorie']
    search_fields = ['titre', 'description', 'tags']