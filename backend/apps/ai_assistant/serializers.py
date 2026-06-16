from rest_framework import serializers
from .models import AIConversation, AIMessage, AIAlert, KnowledgeBase, AIRecommendation
from apps.accounts.serializers import UserSerializer


class AIConversationSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source='utilisateur.get_full_name', read_only=True)
    utilisateur_role = serializers.CharField(source='utilisateur.role', read_only=True)
    dernier_message = serializers.SerializerMethodField()
    nb_messages = serializers.SerializerMethodField()

    class Meta:
        model = AIConversation
        fields = [
            'id', 'utilisateur', 'utilisateur_nom', 'utilisateur_role',
            'contexte', 'entite_id', 'titre',
            'date_creation', 'date_derniere_activite',
            'dernier_message', 'nb_messages'
        ]
        read_only_fields = ['id', 'date_creation', 'date_derniere_activite']

    def get_dernier_message(self, obj):
        dernier = obj.messages.order_by('-date_creation').first()
        return dernier.message[:200] if dernier else ''

    def get_nb_messages(self, obj):
        return obj.messages.count()


class AIConversationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConversation
        fields = ['contexte', 'entite_id', 'titre']


class AIMessageSerializer(serializers.ModelSerializer):
    conversation_titre = serializers.CharField(source='conversation.titre', read_only=True)

    class Meta:
        model = AIMessage
        fields = [
            'id', 'conversation', 'conversation_titre',
            'role', 'message', 'contexte_json', 'date_creation'
        ]
        read_only_fields = ['id', 'date_creation']


class AIMessageCreateSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=5000)
    contexte_supplementaire = serializers.JSONField(required=False)


class AIAlertSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source='utilisateur.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_type_alerte_display', read_only=True)
    niveau_display = serializers.CharField(source='get_niveau_display', read_only=True)

    class Meta:
        model = AIAlert
        fields = [
            'id', 'type_alerte', 'type_display', 'niveau', 'niveau_display',
            'description', 'utilisateur', 'utilisateur_nom',
            'entite_type', 'entite_id', 'lien', 'est_lue',
            'date_creation'
        ]
        read_only_fields = ['id', 'date_creation']


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)

    class Meta:
        model = KnowledgeBase
        fields = [
            'id', 'categorie', 'categorie_display', 'titre', 'contenu',
            'reference_reglementaire', 'langue', 'tags',
            'date_mise_a_jour', 'est_active'
        ]
        read_only_fields = ['id', 'date_mise_a_jour']


class KnowledgeBaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeBase
        fields = [
            'categorie', 'titre', 'contenu',
            'reference_reglementaire', 'langue', 'tags', 'est_active'
        ]


class AIRecommendationSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source='utilisateur.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_type_recommandation_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = AIRecommendation
        fields = [
            'id', 'utilisateur', 'utilisateur_nom',
            'type_recommandation', 'type_display', 'recommandation',
            'contexte_json', 'statut', 'statut_display',
            'date_creation', 'date_traitement'
        ]
        read_only_fields = ['id', 'date_creation']


class AIStatisticsSerializer(serializers.Serializer):
    questions_posees = serializers.IntegerField()
    alertes_detectees = serializers.IntegerField()
    bsd_analyses = serializers.IntegerField()
    agrements_verifies = serializers.IntegerField()
    rapports_generes = serializers.IntegerField()
    conversations_total = serializers.IntegerField()
    alertes_non_lues = serializers.IntegerField()
