from rest_framework import serializers
from .models import Nomenclature
class NomenclatureSerializer(serializers.ModelSerializer):
    classe_display = serializers.CharField(source='get_classe_display', read_only=True)
    couleur_danger = serializers.ReadOnlyField()
    class Meta:
        model = Nomenclature
        fields = '__all__'
