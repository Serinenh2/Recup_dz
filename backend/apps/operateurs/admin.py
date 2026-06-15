from django.contrib import admin
from .models import Operateur

@admin.register(Operateur)
class OperateurAdmin(admin.ModelAdmin):
    list_display  = ['type_operateur','raison_sociale','wilaya','num_agrement','statut','created_at']
    list_filter   = ['type_operateur','statut','wilaya']
    search_fields = ['raison_sociale','nif','nis','num_agrement']
