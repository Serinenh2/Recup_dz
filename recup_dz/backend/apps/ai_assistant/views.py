from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta
from .models import AIConversation, AIMessage, AIAlert, KnowledgeBase, AIRecommendation
from .serializers import (
    AIConversationSerializer, AIConversationCreateSerializer,
    AIMessageSerializer, AIMessageCreateSerializer,
    AIAlertSerializer, KnowledgeBaseSerializer, KnowledgeBaseCreateSerializer,
    AIRecommendationSerializer, AIStatisticsSerializer
)
from apps.accounts.models import User
from apps.recuperateurs.models import Recuperateur, AgrementRecuperateur
from apps.bsd.models import BordereauSuiviDechet
from apps.operations.models import OperationRecuperation


def detecter_anomalies_bsd():
    anomalies = []
    aujourd_hui = timezone.now().date()
    bsds = BordereauSuiviDechet.objects.all()
    for bsd in bsds:
        if bsd.statut == 'BROUILLON' and bsd.date_creation:
            delta = (aujourd_hui - bsd.date_creation).days
            if delta > 7:
                anomalies.append({
                    'type': 'bsd_incomplet',
                    'niveau': 'warning',
                    'description': f'BSD #{bsd.numero} en brouillon depuis plus de 7 jours',
                    'entite_type': 'BSD',
                    'entite_id': bsd.id,
                    'lien': f'/bsd/{bsd.id}'
                })
        if bsd.date_emission and bsd.statut not in ['TERMINE', 'ANNULE', 'ARCHIVE']:
            delta = (aujourd_hui - bsd.date_emission).days
            if delta > 14:
                anomalies.append({
                    'type': 'bsd_retard',
                    'niveau': 'danger',
                    'description': f'BSD #{bsd.numero} en retard (émis le {bsd.date_emission})',
                    'entite_type': 'BSD',
                    'entite_id': bsd.id,
                    'lien': f'/bsd/{bsd.id}'
                })
    return anomalies


def detecter_anomalies_agrements():
    anomalies = []
    aujourd_hui = timezone.now().date()
    agrements = AgrementRecuperateur.objects.filter(statut='ACTIF')
    for agr in agrements:
        if agr.date_fin:
            if agr.date_fin < aujourd_hui:
                anomalies.append({
                    'type': 'agrement_expire',
                    'niveau': 'critique',
                    'description': f'Agrément #{agr.numero_agrement} expiré le {agr.date_fin}',
                    'entite_type': 'Agrement',
                    'entite_id': agr.id,
                    'lien': f'/agrements/{agr.id}'
                })
            elif agr.date_fin < aujourd_hui + timedelta(days=30):
                anomalies.append({
                    'type': 'agrement_bientot_expire',
                    'niveau': 'warning',
                    'description': f'Agrément #{agr.numero_agrement} expire bientôt le {agr.date_fin}',
                    'entite_type': 'Agrement',
                    'entite_id': agr.id,
                    'lien': f'/agrements/{agr.id}'
                })
    return anomalies


class AIConversationViewSet(viewsets.ModelViewSet):
    serializer_class = AIConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIConversation.objects.filter(utilisateur=self.request.user).prefetch_related('messages')

    def get_serializer_class(self):
        if self.action == 'create':
            return AIConversationCreateSerializer
        return AIConversationSerializer

    def perform_create(self, serializer):
        serializer.save(utilisateur=self.request.user)

    @action(detail=True, methods=['post'])
    def envoyer_message(self, request, pk=None):
        conversation = self.get_object()
        serializer = AIMessageCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        message_utilisateur = serializer.validated_data['message']
        contexte_supp = serializer.validated_data.get('contexte_supplementaire', {})

        AIMessage.objects.create(
            conversation=conversation,
            role='user',
            message=message_utilisateur,
            contexte_json=contexte_supp
        )
        conversation.date_derniere_activite = timezone.now()
        conversation.save()

        reponse_ia = self._generer_reponse_intelligente(message_utilisateur, conversation, contexte_supp)

        AIMessage.objects.create(
            conversation=conversation,
            role='assistant',
            message=reponse_ia['message'],
            contexte_json=reponse_ia.get('contexte', {})
        )

        conversation.date_derniere_activite = timezone.now()
        conversation.save()

        return Response({'reponse': reponse_ia['message'], 'contexte': reponse_ia.get('contexte', {})})

    def _generer_reponse_intelligente(self, message, conversation, contexte_supp):
        msg_lower = message.lower()
        contexte_type = conversation.contexte

        if conversation.entite_id:
            try:
                entite = None
                if contexte_type == 'bsd':
                    entite = BordereauSuiviDechet.objects.get(id=conversation.entite_id)
                    return self._analyser_bsd_contextuel(entite, message)
                elif contexte_type == 'recuperateur':
                    entite = Recuperateur.objects.get(id=conversation.entite_id)
                    return self._analyser_recuperateur_contextuel(entite, message)
                elif contexte_type == 'agrement':
                    entite = AgrementRecuperateur.objects.get(id=conversation.entite_id)
                    return self._analyser_agrement_contextuel(entite, message)
                elif contexte_type == 'operation':
                    entite = OperationRecuperation.objects.get(id=conversation.entite_id)
                    return self._analyser_operation_contextuelle(entite, message)
            except Exception:
                pass

        keywords = {
            'déchet': 'nomenclature', 'déchets': 'nomenclature', 'nomenclature': 'nomenclature',
            'code': 'nomenclature', 'classification': 'nomenclature'
        }
        if any(mot in msg_lower for mot in keywords) or 'huile' in msg_lower or 'batterie' in msg_lower or 'métal' in msg_lower:
            return self._rechercher_nomenclature(message)

        agrement_keywords = ['agrément', 'agréments', 'validité', 'expire', 'expiré']
        if any(mot in msg_lower for mot in agrement_keywords):
            return self._verifier_agrements()

        bsd_keywords = ['bsd', 'bordereau', 'bordereaux']
        if any(mot in msg_lower for mot in bsd_keywords):
            return self._analyser_bsd()

        stock_keywords = ['stock', 'stocks', 'quantité']
        if any(mot in msg_lower for mot in stock_keywords):
            return self._analyser_stocks()

        loi_keywords = ['loi', 'loi 01-19', 'décret', 'réglementation', 'loi 01-19']
        if any(mot in msg_lower for mot in loi_keywords):
            return self._recherche_reglementaire(message)

        greetings = ['bonjour', 'salut', 'hello', 'aide', 'help', 'coucou']
        if any(mot in msg_lower for mot in greetings):
            return {
                'message': """Bonjour ! Je suis l'Assistant Réglementaire Déchets de RECUP-DZ. Je peux vous aider avec :

1. **Recherche réglementaire** : Loi 01-19, Décret 06-104, procédures
2. **Identification des déchets** : Recherche par nom ou code
3. **Vérification des agréments** : Statuts et validité
4. **Analyse des BSD** : Retards, incomplets, conformité
5. **Analyse des stocks** : Dépassements et risques
6. **Alertes intelligentes** : Anomalies détectées automatiquement
7. **Rapports réglementaires** : Mensuels, trimestriels, annuels

Comment puis-je vous aider aujourd'hui ?"""
            }

        return {
            'message': f"J'ai bien reçu votre message : \"{message}\".\n\nJe suis connecté à la plateforme et peux analyser vos données. Essayez de me poser des questions sur :\n- Les agréments\n- Les BSD\n- La nomenclature des déchets\n- La réglementation algérienne\n- Les stocks"
        }

    def _rechercher_nomenclature(self, message):
        from apps.nomenclature.models import Nomenclature
        results = Nomenclature.objects.filter(
            Q(designation_fr__icontains=message) |
            Q(designation_ar__icontains=message) |
            Q(code__icontains=message) |
            Q(famille__icontains=message)
        )[:10]
        if results:
            reponse = "## Résultats de recherche dans la nomenclature :\n\n"
            for r in results:
                danger = " ⚠️ DANGEREUX" if r.dangereux else ""
                reponse += f"- **{r.code}** — {r.designation_fr}{danger}\n"
                reponse += f"  Catégorie : {r.classe} | Famille : {r.famille}\n\n"
            reponse += "\n_Source : Référentiel national des déchets, Décret exécutif n°06-104_"
            return {'message': reponse}
        return {'message': "Aucun résultat trouvé dans la nomenclature. Essayez avec un autre terme (ex: 'huile', 'batterie', 'métal')."}

    def _verifier_agrements(self):
        aujourd_hui = timezone.now().date()
        agrements = AgrementRecuperateur.objects.filter(statut='ACTIF').select_related('recuperateur')
        bientot_expires = []
        expires = []
        for agr in agrements:
            if agr.date_fin:
                if agr.date_fin < aujourd_hui:
                    expires.append(agr)
                elif agr.date_fin < aujourd_hui + timedelta(days=30):
                    bientot_expires.append(agr)

        reponse = "## État des agréments\n\n"
        reponse += f"📊 **Résumé** : {agrements.count()} agréments actifs\n\n"
        if expires:
            reponse += f"### ⚠️ Agréments expirés ({len(expires)})\n"
            for e in expires[:10]:
                reponse += f"- **{e.numero_agrement}** — {e.recuperateur.nom_raison_sociale} — Expiré le {e.date_fin}\n"
        if bientot_expires:
            reponse += f"\n### ⏳ Expirent bientôt ({len(bientot_expires)})\n"
            for b in bientot_expires[:10]:
                reponse += f"- **{b.numero_agrement}** — {b.recuperateur.nom_raison_sociale} — Expire le {b.date_fin} (dans {(b.date_fin - aujourd_hui).days} jours)\n"
        if not expires and not bientot_expires:
            reponse += "✅ Tous les agréments sont valides."
        return {'message': reponse}

    def _analyser_bsd(self):
        aujourd_hui = timezone.now().date()
        bsds = BordereauSuiviDechet.objects.all()
        retards = []
        incomplets = []
        for bsd in bsds:
            if bsd.statut == 'BROUILLON' and bsd.date_creation:
                delta = (aujourd_hui - bsd.date_creation).days
                if delta > 7:
                    incomplets.append(bsd)
            elif bsd.date_emission and bsd.statut not in ['TERMINE', 'ANNULE', 'ARCHIVE']:
                delta = (aujourd_hui - bsd.date_emission).days
                if delta > 14:
                    retards.append(bsd)

        reponse = "## Analyse des BSD\n\n"
        reponse += f"📊 Total BSD : {bsds.count()}\n\n"
        if retards:
            reponse += f"### 🔴 BSD en retard ({len(retards)})\n"
            for r in retards[:10]:
                reponse += f"- **{r.numero}** — Émis le {r.date_emission}\n"
        if incomplets:
            reponse += f"\n### 🟡 BSD incomplets ({len(incomplets)})\n"
            for i in incomplets[:10]:
                reponse += f"- **{i.numero}** — En brouillon\n"
        if not retards and not incomplets:
            reponse += "✅ Aucune anomalie détectée dans les BSD."
        return {'message': reponse}

    def _analyser_stocks(self):
        reponse = "## Analyse des stocks\n\n"
        try:
            operations = OperationRecuperation.objects.filter(statut='EN_COURS')
            reponse += f"📊 Opérations en cours : {operations.count()}\n\n"
            if operations:
                total = sum(float(op.quantite or 0) for op in operations)
                reponse += f"**Quantité totale en traitement** : {total:,.0f} kg\n"
        except Exception:
            reponse += "Module Stocks non disponible pour le moment."
        return {'message': reponse}

    def _recherche_reglementaire(self, message):
        results = KnowledgeBase.objects.filter(
            Q(titre__icontains=message) |
            Q(contenu__icontains=message),
            est_active=True
        )[:5]
        if results:
            reponse = "## Résultats réglementaires :\n\n"
            for r in results:
                reponse += f"### {r.titre}\n"
                reponse += f"**Source** : {r.reference_reglementaire}\n\n"
                contenu = r.contenu[:400] if len(r.contenu) > 400 else r.contenu
                reponse += f"{contenu}{'...' if len(r.contenu) > 400 else ''}\n\n"
            return {'message': reponse}
        return {'message': "Aucun résultat réglementaire trouvé. Contactez votre administrateur pour enrichir la base de connaissances."}

    def _analyser_bsd_contextuel(self, bsd, message):
        reponse = f"## Analyse du BSD #{bsd.numero}\n\n"
        reponse += f"**Statut** : {bsd.statut}\n"
        reponse += f"**Code déchet** : {bsd.code_dechet}\n"
        reponse += f"**Désignation** : {bsd.designation}\n"
        reponse += f"**Quantité** : {bsd.quantite} {bsd.unite}\n"
        if bsd.statut == 'BROUILLON':
            reponse += "\n⚠️ **Attention** : Ce BSD est en brouillon. Il doit être complété et émis avant toute opération."
        if bsd.date_emission:
            reponse += f"\n**Date émission** : {bsd.date_emission}"
        reponse += "\n\n✅ Analyse générée automatiquement."
        return {'message': reponse, 'contexte': {'bsd': {'id': bsd.id, 'numero': bsd.numero}}}

    def _analyser_recuperateur_contextuel(self, recuperateur, message):
        reponse = f"## Fiche récupérateur : {recuperateur.nom_raison_sociale}\n\n"
        reponse += f"**Type** : {recuperateur.type_recuperateur}\n"
        reponse += f"**Statut** : {recuperateur.statut_juridique}\n"
        reponse += f"**Wilaya** : {recuperateur.wilaya}\n"
        if recuperateur.email:
            reponse += f"**Email** : {recuperateur.email}\n"
        if recuperateur.telephone:
            reponse += f"**Téléphone** : {recuperateur.telephone}\n"

        agrements = recuperateur.agrements.filter(statut='ACTIF')
        if agrements:
            reponse += f"\n**Agréments actifs** : {agrements.count()}\n"
            for agr in agrements[:3]:
                reponse += f"- {agr.numero_agrement} (expire le {agr.date_fin})\n"

        reponse += "\n✅ Analyse générée automatiquement."
        return {'message': reponse, 'contexte': {'recuperateur': {'id': recuperateur.id}}}

    def _analyser_agrement_contextuel(self, agrement, message):
        aujourd_hui = timezone.now().date()
        est_valide = agrement.date_fin >= aujourd_hui if agrement.date_fin else False
        jours_restants = (agrement.date_fin - aujourd_hui).days if agrement.date_fin else 0
        reponse = f"## Agrément #{agrement.numero_agrement}\n\n"
        reponse += f"**Récupérateur** : {agrement.recuperateur.nom_raison_sociale}\n"
        reponse += f"**Statut** : {agrement.statut}\n"
        reponse += f"**Validité** : {'✅ Valide' if est_valide else '❌ Expiré'} (expire le {agrement.date_fin})\n"
        reponse += f"**Jours restants** : {jours_restants}\n"
        if agrement.codes_dechets:
            reponse += f"**Codes déchets autorisés** : {agrement.codes_dechets}\n"
        if not est_valide:
            reponse += "\n⚠️ Cet agrément a expiré. Une demande de renouvellement est requise conformément à la réglementation algérienne."
        elif jours_restants < 30:
            reponse += f"\n⚠️ Cet agrément expire dans {jours_restants} jours. Pensez à entamer la procédure de renouvellement."
        reponse += "\n\n_Source : Loi 01-19 relative à la gestion des déchets_"
        return {'message': reponse, 'contexte': {'agrement': {'id': agrement.id}}}

    def _analyser_operation_contextuelle(self, operation, message):
        reponse = f"## Opération #{operation.numero}\n\n"
        reponse += f"**Récupérateur** : {operation.recuperateur.nom_raison_sociale}\n"
        reponse += f"**Statut** : {operation.statut}\n"
        reponse += f"**Destination** : {operation.destination_type}\n"
        reponse += f"**Déchet** : {operation.designation_dechet} ({operation.code_dechet})\n"
        reponse += f"**Quantité** : {operation.quantite} {operation.unite}\n"
        if operation.transporteur:
            reponse += f"**Transporteur** : {operation.transporteur.nom_raison_sociale}\n"
        if operation.valorisateur:
            reponse += f"**Valorisateur** : {operation.valorisateur.nom_raison_sociale}\n"
        reponse += "\n✅ Analyse générée automatiquement."
        return {'message': reponse, 'contexte': {'operation': {'id': operation.id}}}

    @action(detail=False, methods=['post'])
    def analyse_contextuelle(self, request):
        contexte_type = request.data.get('contexte_type', 'general')
        entite_id = request.data.get('entite_id')
        question = request.data.get('question', '')

        if not question:
            return Response({'error': 'La question est requise'}, status=status.HTTP_400_BAD_REQUEST)

        conversation = AIConversation.objects.create(
            utilisateur=request.user,
            contexte=contexte_type,
            entite_id=entite_id,
            titre=f"Analyse: {contexte_type} #{entite_id or ''}"
        )
        AIMessage.objects.create(
            conversation=conversation,
            role='user',
            message=question
        )

        reponse = self._generer_reponse_intelligente(question, conversation, {})
        AIMessage.objects.create(
            conversation=conversation,
            role='assistant',
            message=reponse['message'],
            contexte_json=reponse.get('contexte', {})
        )

        return Response({'conversation_id': conversation.id, 'reponse': reponse['message']})

    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        suggestions = [
            "Quels agréments expirent bientôt ?",
            "Y a-t-il des BSD en retard ?",
            "Classifie le déchet : huile moteur usagée",
            "Quelle est la réglementation sur les déchets hospitaliers ?",
            "Analyser cet agrément",
            "Générer un rapport mensuel",
            "Vérifier la conformité d'un récupérateur",
            "Liste des déchets dangereux autorisés",
        ]
        return Response({'suggestions': suggestions})


class AIMessageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AIMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.request.query_params.get('conversation_id')
        if conversation_id:
            return AIMessage.objects.filter(conversation_id=conversation_id, conversation__utilisateur=self.request.user)
        return AIMessage.objects.filter(conversation__utilisateur=self.request.user).select_related('conversation')


class AIAlertViewSet(viewsets.ModelViewSet):
    serializer_class = AIAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = AIAlert.objects.filter(utilisateur=self.request.user)
        est_lue = self.request.query_params.get('est_lue')
        if est_lue is not None:
            qs = qs.filter(est_lue=(est_lue.lower() == 'true'))
        return qs

    @action(detail=True, methods=['post'])
    def marquer_lue(self, request, pk=None):
        alerte = self.get_object()
        alerte.est_lue = True
        alerte.save()
        return Response({'status': 'ok'})

    @action(detail=False, methods=['post'])
    def generer_alertes_auto(self, request):
        anomalies_bsd = detecter_anomalies_bsd()
        anomalies_agr = detecter_anomalies_agrements()
        toutes_anomalies = anomalies_bsd + anomalies_agr

        creees = 0
        for anomalie in toutes_anomalies:
            user = request.user
            existe = AIAlert.objects.filter(
                type_alerte=anomalie['type'],
                entite_type=anomalie['entite_type'],
                entite_id=anomalie['entite_id'],
                est_lue=False
            ).exists()
            if not existe:
                AIAlert.objects.create(
                    type_alerte=anomalie['type'],
                    niveau=anomalie['niveau'],
                    description=anomalie['description'],
                    utilisateur=user,
                    entite_type=anomalie['entite_type'],
                    entite_id=anomalie['entite_id'],
                    lien=anomalie['lien']
                )
                creees += 1

        return Response({'alertes_creees': creees, 'total_anomalies': len(toutes_anomalies)})

    @action(detail=False, methods=['get'])
    def resume_alertes(self, request):
        alertes = AIAlert.objects.filter(utilisateur=request.user)
        par_type = alertes.values('type_alerte').annotate(count=Count('id'))
        par_niveau = alertes.values('niveau').annotate(count=Count('id'))
        non_lues = alertes.filter(est_lue=False).count()
        critiques = alertes.filter(niveau='critique', est_lue=False).count()

        return Response({
            'total': alertes.count(),
            'non_lues': non_lues,
            'critiques': critiques,
            'par_type': list(par_type),
            'par_niveau': list(par_niveau),
        })


class KnowledgeBaseViewSet(viewsets.ModelViewSet):
    serializer_class = KnowledgeBaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = KnowledgeBase.objects.filter(est_active=True)
        categorie = self.request.query_params.get('categorie')
        if categorie:
            qs = qs.filter(categorie=categorie)
        langue = self.request.query_params.get('langue')
        if langue:
            qs = qs.filter(langue=langue)
        recherche = self.request.query_params.get('recherche')
        if recherche:
            qs = qs.filter(
                Q(titre__icontains=recherche) |
                Q(contenu__icontains=recherche) |
                Q(reference_reglementaire__icontains=recherche)
            )
        return qs

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return KnowledgeBaseCreateSerializer
        return KnowledgeBaseSerializer

    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = [{'id': c[0], 'label': c[1]} for c in KnowledgeBase.CATEGORIE_CHOICES]
        return Response({'categories': categories})

    @action(detail=False, methods=['get'])
    def rechercher_reglementaire(self, request):
        terme = request.query_params.get('terme', '')
        if not terme:
            return Response({'results': []})
        results = self.get_queryset().filter(
            Q(titre__icontains=terme) |
            Q(contenu__icontains=terme) |
            Q(reference_reglementaire__icontains=terme)
        )[:20]
        serializer = self.get_serializer(results, many=True)
        return Response({'results': serializer.data, 'terme': terme})


class AIRecommendationViewSet(viewsets.ModelViewSet):
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIRecommendation.objects.filter(utilisateur=self.request.user)

    @action(detail=True, methods=['post'])
    def changer_statut(self, request, pk=None):
        recommendation = self.get_object()
        nouveau_statut = request.data.get('statut')
        if nouveau_statut not in dict(AIRecommendation.STATUT_CHOICES):
            return Response({'error': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)
        recommendation.statut = nouveau_statut
        if nouveau_statut == 'traitee':
            recommendation.date_traitement = timezone.now()
        recommendation.save()
        return Response({'statut': 'ok'})

    @action(detail=False, methods=['get'])
    def recommendations_actives(self, request):
        recommendations = AIRecommendation.objects.filter(
            utilisateur=request.user,
            statut__in=['nouvelle', 'en_cours']
        )[:10]
        serializer = self.get_serializer(recommendations, many=True)
        return Response({'recommendations': serializer.data})


class AIDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        user = request.user
        questions_posees = AIMessage.objects.filter(
            conversation__utilisateur=user, role='user'
        ).count()
        alertes_detectees = AIAlert.objects.filter(utilisateur=user).count()
        alertes_non_lues = AIAlert.objects.filter(utilisateur=user, est_lue=False).count()

        bsd_analyses = AIConversation.objects.filter(
            utilisateur=user, contexte='bsd'
        ).count()

        agrements_verifies = AIConversation.objects.filter(
            utilisateur=user, contexte='agrement'
        ).count()

        rapports_generes = AIRecommendation.objects.filter(
            utilisateur=user, type_recommandation='analyse'
        ).count()

        conversations_total = AIConversation.objects.filter(utilisateur=user).count()

        data = {
            'questions_posees': questions_posees,
            'alertes_detectees': alertes_detectees,
            'bsd_analyses': bsd_analyses,
            'agrements_verifies': agrements_verifies,
            'rapports_generes': rapports_generes,
            'conversations_total': conversations_total,
            'alertes_non_lues': alertes_non_lues,
        }
        serializer = AIStatisticsSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def alertes_recuperees(self, request):
        alertes = AIAlert.objects.filter(utilisateur=request.user, est_lue=False)[:20]
        serializer = AIAlertSerializer(alertes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def historique_recent(self, request):
        conversations = AIConversation.objects.filter(
            utilisateur=request.user
        ).order_by('-date_derniere_activite')[:10]
        serializer = AIConversationSerializer(conversations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recommandations_actives(self, request):
        recommendations = AIRecommendation.objects.filter(
            utilisateur=request.user,
            statut__in=['nouvelle', 'en_cours']
        ).order_by('-date_creation')[:10]
        serializer = AIRecommendationSerializer(recommendations, many=True)
        return Response({'recommendations': serializer.data})
