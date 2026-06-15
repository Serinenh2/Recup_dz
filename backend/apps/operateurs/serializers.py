from rest_framework import serializers
from .models import Operateur

class OperateurSerializer(serializers.ModelSerializer):
    type_display   = serializers.CharField(source='get_type_operateur_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    agrement_valide= serializers.ReadOnlyField()
    codes_list     = serializers.ReadOnlyField()

    class Meta:
        model  = Operateur
        fields = '__all__'

class OperateurListSerializer(serializers.ModelSerializer):
    type_display   = serializers.CharField(source='get_type_operateur_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    agrement_valide= serializers.ReadOnlyField()

    class Meta:
        model  = Operateur
        fields = ['id','type_operateur','type_display','raison_sociale','wilaya',
                  'commune','telephone','email','num_agrement','date_fin_agrement',
                  'statut','statut_display','agrement_valide','created_at']
