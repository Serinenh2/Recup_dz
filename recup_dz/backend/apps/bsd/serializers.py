from rest_framework import serializers
from .models import BordereauSuiviDechet
class BSDSerializer(serializers.ModelSerializer):
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    class Meta:
        model = BordereauSuiviDechet
        fields = '__all__'
