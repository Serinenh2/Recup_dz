from rest_framework import serializers
from .models import Tenant

class TenantSerializer(serializers.ModelSerializer):
    plan_display   = serializers.CharField(source='get_plan_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    est_actif      = serializers.ReadOnlyField()
    jours_restants = serializers.ReadOnlyField()

    class Meta:
        model  = Tenant
        fields = '__all__'