from rest_framework import serializers
from .models import Declaration
class DeclarationSerializer(serializers.ModelSerializer):
    statut_display  = serializers.CharField(source='get_statut_display', read_only=True)
    periode_display = serializers.CharField(source='get_periode_display', read_only=True)
    class Meta:
        model = Declaration
        fields = '__all__'
