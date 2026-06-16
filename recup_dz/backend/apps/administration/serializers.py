from rest_framework import serializers
from .models import AdministrationEnvironnement

class AdministrationSerializer(serializers.ModelSerializer):
    type_display   = serializers.CharField(source='get_type_administration_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    class Meta:
        model  = AdministrationEnvironnement
        fields = '__all__'