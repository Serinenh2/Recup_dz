from rest_framework import serializers
from .models import Inspection
class InspectionSerializer(serializers.ModelSerializer):
    type_display    = serializers.CharField(source='get_type_inspection_display', read_only=True)
    resultat_display= serializers.CharField(source='get_resultat_display', read_only=True)
    class Meta:
        model = Inspection
        fields = '__all__'
