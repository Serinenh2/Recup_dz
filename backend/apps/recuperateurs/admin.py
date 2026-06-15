from django.contrib import admin
from .models import Recuperateur, AgrementRecuperateur, DocumentRecuperateur

class AgrementInline(admin.TabularInline):
    model = AgrementRecuperateur
    extra = 0

class DocInline(admin.TabularInline):
    model = DocumentRecuperateur
    extra = 0

@admin.register(Recuperateur)
class RecuperateurAdmin(admin.ModelAdmin):
    list_display  = ['numero_id','nom_raison_sociale','type_recuperateur','statut','wilaya']
    list_filter   = ['type_recuperateur','statut','wilaya']
    search_fields = ['nom_raison_sociale','numero_id']
    inlines       = [AgrementInline, DocInline]

@admin.register(AgrementRecuperateur)
class AgrementAdmin(admin.ModelAdmin):
    list_display  = ['numero_agrement','recuperateur','type_agrement','etendue_geo','statut','date_fin']
    list_filter   = ['type_agrement','statut','etendue_geo']
    search_fields = ['numero_agrement','codes_dechets']