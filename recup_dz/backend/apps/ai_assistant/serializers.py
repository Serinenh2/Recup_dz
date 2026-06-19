from rest_framework import serializers
from .models import AIAlert, AIConversation, AIMessage, AIRecommendation, KnowledgeBase, User


class UserMinimalSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display']


class AIMessageSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    conversation_titre = serializers.CharField(source='conversation.titre', read_only=True)
    conversation_contexte = serializers.CharField(source='conversation.contexte', read_only=True)
    conversation_contexte_display = serializers.CharField(source='conversation.get_contexte_display', read_only=True)

    class Meta:
        model = AIMessage
        fields = [
            'id', 'conversation', 'conversation_titre', 'conversation_contexte',
            'conversation_contexte_display', 'role', 'role_display', 'message',
            'contexte_json', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AIConversationSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    messages = AIMessageSerializer(many=True, read_only=True)
    contexte_display = serializers.CharField(source='get_contexte_display', read_only=True)

    class Meta:
        model = AIConversation
        fields = [
            'id', 'user', 'contexte', 'contexte_display', 'entite_id', 'titre',
            'created_at', 'updated_at', 'last_message_at', 'messages'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_message_at']


class AIAlertSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    type_alerte_display = serializers.CharField(source='get_type_alerte_display', read_only=True)
    niveau_display = serializers.CharField(source='get_niveau_display', read_only=True)

    class Meta:
        model = AIAlert
        fields = [
            'id', 'type_alerte', 'type_alerte_display', 'niveau', 'niveau_display',
            'description', 'user', 'entite_type', 'entite_id', 'lien', 'est_lue', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)

    class Meta:
        model = KnowledgeBase
        fields = [
            'id', 'categorie', 'categorie_display', 'titre', 'contenu',
            'reference_reglementaire', 'langue', 'tags', 'date_mise_a_jour', 'est_active'
        ]
        read_only_fields = ['id', 'date_mise_a_jour']


class AIRecommendationSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    type_recommandation_display = serializers.CharField(source='get_type_recommandation_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = AIRecommendation
        fields = [
            'id', 'user', 'type_recommandation', 'type_recommandation_display',
            'recommandation', 'contexte_json', 'statut', 'statut_display',
            'created_at', 'updated_at', 'date_echeance'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AIConversationListSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    contexte_display = serializers.CharField(source='get_contexte_display', read_only=True)
    messages_count = serializers.SerializerMethodField()

    class Meta:
        model = AIConversation
        fields = [
            'id', 'user', 'contexte', 'contexte_display', 'entite_id', 'titre',
            'created_at', 'updated_at', 'last_message_at', 'messages_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_message_at']

    def get_messages_count(self, obj):
        if hasattr(obj, '_messages_count'):
            return obj._messages_count
        return obj.messages.count()


class AIConversationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConversation
        fields = ['id', 'contexte', 'entite_id', 'titre', 'created_at']
        read_only_fields = ['id', 'created_at']


class AIMessageCreateSerializer(serializers.Serializer):
    message = serializers.CharField()
    contexte_supplementaire = serializers.JSONField(required=False, default=dict)


class KnowledgeBaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeBase
        fields = '__all__'
        read_only_fields = ['id', 'date_mise_a_jour']


class AIStatisticsSerializer(serializers.Serializer):
    questions_posees = serializers.IntegerField()
    alertes_detectees = serializers.IntegerField()
    bsd_analyses = serializers.IntegerField()
    agrements_verifies = serializers.IntegerField()
    rapports_generes = serializers.IntegerField()
    conversations_total = serializers.IntegerField()
    alertes_non_lues = serializers.IntegerField()
