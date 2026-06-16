from rest_framework import serializers
from .models import Declaration

class DeclarationSerializer(serializers.ModelSerializer):
    statut_display       = serializers.CharField(source='get_statut_display', read_only=True)
    recuperateur_nom     = serializers.SerializerMethodField()

    class Meta:
        model  = Declaration
        fields = '__all__'

    def get_recuperateur_nom(self, obj):
        return obj.recuperateur.nom_raison_sociale if obj.recuperateur else ''
