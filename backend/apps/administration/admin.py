from django.contrib import admin
from .models import AdministrationEnvironnement

@admin.register(AdministrationEnvironnement)
class AdministrationAdmin(admin.ModelAdmin):
    list_display  = ['type_administration','denomination','wilaya','nom_directeur','statut']
    list_filter   = ['type_administration','statut','wilaya']
    search_fields = ['denomination','nom_directeur','email']