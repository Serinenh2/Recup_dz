from rest_framework import serializers
from .models import Recuperateur, AgrementRecuperateur, DocumentRecuperateur

class AgrementSerializer(serializers.ModelSerializer):
    type_display    = serializers.CharField(source='get_type_agrement_display', read_only=True)
    etendue_display = serializers.CharField(source='get_etendue_geo_display', read_only=True)
    statut_display  = serializers.CharField(source='get_statut_display', read_only=True)
    est_valide      = serializers.ReadOnlyField()
    jours_restants  = serializers.ReadOnlyField()
    expire_bientot  = serializers.ReadOnlyField()
    codes_list      = serializers.ReadOnlyField()
    wilayas_list    = serializers.ReadOnlyField()
    class Meta:
        model  = AgrementRecuperateur
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DocumentRecuperateur
        fields = '__all__'

class RecuperateurListSerializer(serializers.ModelSerializer):
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    type_display   = serializers.CharField(source='get_type_recuperateur_display', read_only=True)
    agrement_actif = serializers.SerializerMethodField()
    class Meta:
        model  = Recuperateur
        fields = ['id','numero_id','nom_raison_sociale','nom_commercial',
                  'type_recuperateur','type_display','statut','statut_display',
                  'wilaya','commune','telephone','email','created_at','agrement_actif']
    def get_agrement_actif(self, obj):
        agr = obj.agrements.filter(statut='ACTIF').first()
        if agr: return AgrementSerializer(agr).data
        return None

class RecuperateurSerializer(serializers.ModelSerializer):
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    type_display   = serializers.CharField(source='get_type_recuperateur_display', read_only=True)
    agrements      = AgrementSerializer(many=True, read_only=True)
    documents      = DocumentSerializer(many=True, read_only=True)
    class Meta:
        model  = Recuperateur
        fields = '__all__'