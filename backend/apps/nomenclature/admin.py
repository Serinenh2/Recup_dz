from django.contrib import admin
from .models import Nomenclature
@admin.register(Nomenclature)
class NomenclatureAdmin(admin.ModelAdmin):
    list_display  = ['code','designation_fr','classe','bsd_obligatoire','agrement_requis']
    list_filter   = ['classe','bsd_obligatoire','agrement_requis']
    search_fields = ['code','designation_fr','designation_ar']
