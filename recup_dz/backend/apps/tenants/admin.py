from django.contrib import admin
from .models import Tenant

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['nom', 'slug', 'plan', 'statut', 'max_users', 'date_fin']
    list_filter  = ['plan', 'statut']
    search_fields= ['nom', 'slug', 'email']
    prepopulated_fields = {'slug': ('nom',)}