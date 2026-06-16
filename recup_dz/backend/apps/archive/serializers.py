from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    extension         = serializers.ReadOnlyField()
    taille_lisible    = serializers.ReadOnlyField()
    uploaded_by_nom   = serializers.SerializerMethodField()
    fichier_url       = serializers.SerializerMethodField()

    class Meta:
        model  = Document
        fields = '__all__'

    def get_uploaded_by_nom(self, obj):
        if obj.uploaded_by:
            return f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}".strip() or obj.uploaded_by.username
        return ''

    def get_fichier_url(self, obj):
        request = self.context.get('request')
        if obj.fichier and request:
            return request.build_absolute_uri(obj.fichier.url)
        return obj.fichier.url if obj.fichier else ''