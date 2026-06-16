"""
Système d'alertes réglementaires pour les récupérateurs de déchets.
Conforme à la Loi n°01-19 et au Décret exécutif n°06-104.
"""
from datetime import date, timedelta
from .models import Recuperateur, AgrementRecuperateur

# Types de déchets SD et S (nécessitent agrément)
CLASSES_AGREMENT_REQUIS = {'S', 'SD'}


def check_droit_recuperation(recuperateur_id, code_dechet, classe_dechet):
    """
    Vérifie si un récupérateur a le droit de collecter un déchet donné.
    Retourne {'autorise': bool, 'alerte': dict | None}
    """
    try:
        rec = Recuperateur.objects.get(id=recuperateur_id)
    except Recuperateur.DoesNotExist:
        return {'autorise': False, 'alerte': {'type': 'ERREUR', 'severity': 'critical',
            'message': "Récupérateur introuvable."}}

    today = date.today()

    # ── Cas 1 : Déchet ne nécessite pas d'agrément (MA / I) ───────────────────
    if classe_dechet not in CLASSES_AGREMENT_REQUIS:
        return {'autorise': True, 'alerte': None}

    # ── Cas 2 : Récupérateur SANS agrément tente de collecter SD/S ───────────
    agrement_actif = rec.agrements.filter(
        type_agrement='AVEC_AGREMENT', statut='ACTIF'
    ).first()

    if not agrement_actif:
        # Chercher si agrément expiré existe
        agrement_expire = rec.agrements.filter(type_agrement='AVEC_AGREMENT').first()
        if agrement_expire and agrement_expire.date_fin and agrement_expire.date_fin < today:
            return {
                'autorise': False,
                'alerte': {
                    'type': 'AGREMENT_EXPIRE',
                    'severity': 'critical',
                    'titre': "Agrément expiré — Collecte non autorisée",
                    'message': (
                        f"Vous n'avez pas le droit de récupérer ce déchet "
                        f"(classe {classe_dechet} — code {code_dechet}). "
                        f"Votre agrément n° {agrement_expire.numero_agrement} a expiré "
                        f"le {agrement_expire.date_fin.strftime('%d/%m/%Y')}. "
                        f"Veuillez procéder au renouvellement de votre agrément "
                        f"auprès de l'autorité compétente avant toute opération."
                    ),
                    'action_requise': 'RENOUVELLEMENT_AGREMENT',
                    'code_dechet': code_dechet,
                    'classe_dechet': classe_dechet,
                }
            }
        return {
            'autorise': False,
            'alerte': {
                'type': 'SANS_AGREMENT_DSD',
                'severity': 'critical',
                'titre': "Agrément requis — Collecte non autorisée",
                'message': (
                    f"Vous n'avez pas le droit de récupérer ce déchet "
                    f"(classe {classe_dechet} — code {code_dechet}). "
                    f"La récupération des déchets spéciaux et spéciaux dangereux "
                    f"exige un agrément délivré par l'autorité compétente "
                    f"conformément au Décret exécutif n°06-104. "
                    f"Veuillez soumettre une demande d'agrément."
                ),
                'action_requise': 'DEMANDE_AGREMENT',
                'code_dechet': code_dechet,
                'classe_dechet': classe_dechet,
            }
        }

    # ── Cas 3 : Agrément actif mais code déchet non couvert ──────────────────
    if agrement_actif.codes_dechets:
        codes_autorises = [c.strip() for c in agrement_actif.codes_dechets.split(',') if c.strip()]
        if codes_autorises and code_dechet not in codes_autorises:
            return {
                'autorise': False,
                'alerte': {
                    'type': 'CODE_NON_AUTORISE',
                    'severity': 'critical',
                    'titre': "Code déchet non couvert par votre agrément",
                    'message': (
                        f"Le déchet {code_dechet} (classe {classe_dechet}) ne figure pas "
                        f"dans les codes autorisés par votre agrément "
                        f"n° {agrement_actif.numero_agrement}. "
                        f"Codes autorisés : {', '.join(codes_autorises[:10])}{'...' if len(codes_autorises) > 10 else ''}. "
                        f"Veuillez contacter l'autorité compétente pour une extension de votre agrément."
                    ),
                    'action_requise': 'EXTENSION_AGREMENT',
                    'code_dechet': code_dechet,
                    'classe_dechet': classe_dechet,
                    'codes_autorises': codes_autorises,
                }
            }

    # ── Autorisé ──────────────────────────────────────────────────────────────
    return {'autorise': True, 'alerte': None}


def get_all_alerts():
    """Retourne toutes les alertes système en cours."""
    today  = date.today()
    soon60 = today + timedelta(days=60)
    soon30 = today + timedelta(days=30)
    result = []

    # Agréments expirés
    for agr in AgrementRecuperateur.objects.filter(
        statut='ACTIF', date_fin__lt=today
    ).select_related('recuperateur'):
        jours = (today - agr.date_fin).days
        result.append({
            'id':             f"agr-expire-{agr.id}",
            'type':           'AGREMENT_EXPIRE',
            'severity':       'critical',
            'titre':          "Agrément expiré",
            'message':        (
                f"L'agrément n° {agr.numero_agrement or 'N/A'} de "
                f"{agr.recuperateur.nom_raison_sociale} a expiré "
                f"le {agr.date_fin.strftime('%d/%m/%Y')} "
                f"(il y a {jours} jour{'s' if jours>1 else ''}). "
                f"Ce récupérateur n'est plus autorisé à collecter des déchets "
                f"spéciaux ou dangereux. Veuillez procéder au renouvellement."
            ),
            'action':         'Renouveler l\'agrément',
            'recuperateur':   agr.recuperateur.nom_raison_sociale,
            'recuperateur_id':agr.recuperateur.id,
            'agrement_id':    agr.id,
            'date':           str(agr.date_fin),
            'wilaya':         agr.recuperateur.wilaya,
        })

    # Agréments expirant dans 30 jours (urgent)
    for agr in AgrementRecuperateur.objects.filter(
        statut='ACTIF', date_fin__gte=today, date_fin__lte=soon30
    ).select_related('recuperateur'):
        jours = (agr.date_fin - today).days
        result.append({
            'id':             f"agr-urgent-{agr.id}",
            'type':           'AGREMENT_EXPIRATION_URGENTE',
            'severity':       'critical',
            'titre':          "Expiration imminente — Action urgente requise",
            'message':        (
                f"⚠️ URGENT — L'agrément n° {agr.numero_agrement or 'N/A'} de "
                f"{agr.recuperateur.nom_raison_sociale} expire dans "
                f"{jours} jour{'s' if jours>1 else ''} "
                f"(le {agr.date_fin.strftime('%d/%m/%Y')}). "
                f"Veuillez procéder immédiatement au renouvellement de votre agrément "
                f"auprès de l'autorité compétente pour éviter toute interruption d'activité."
            ),
            'action':         'Renouveler l\'agrément en urgence',
            'recuperateur':   agr.recuperateur.nom_raison_sociale,
            'recuperateur_id':agr.recuperateur.id,
            'agrement_id':    agr.id,
            'date':           str(agr.date_fin),
            'jours_restants': jours,
            'wilaya':         agr.recuperateur.wilaya,
        })

    # Agréments expirant dans 31-60 jours (avertissement)
    for agr in AgrementRecuperateur.objects.filter(
        statut='ACTIF', date_fin__gt=soon30, date_fin__lte=soon60
    ).select_related('recuperateur'):
        jours = (agr.date_fin - today).days
        result.append({
            'id':             f"agr-expiring-{agr.id}",
            'type':           'AGREMENT_EXPIRATION_PROCHE',
            'severity':       'warning',
            'titre':          "Agrément arrive à expiration",
            'message':        (
                f"Attention — Votre agrément n° {agr.numero_agrement or 'N/A'} "
                f"({agr.recuperateur.nom_raison_sociale}) "
                f"expire dans {jours} jours "
                f"(le {agr.date_fin.strftime('%d/%m/%Y')}). "
                f"Veuillez procéder au renouvellement de votre agrément "
                f"auprès de l'autorité compétente avant cette date."
            ),
            'action':         'Initier le renouvellement',
            'recuperateur':   agr.recuperateur.nom_raison_sociale,
            'recuperateur_id':agr.recuperateur.id,
            'agrement_id':    agr.id,
            'date':           str(agr.date_fin),
            'jours_restants': jours,
            'wilaya':         agr.recuperateur.wilaya,
        })

    # Récupérateurs AVEC_AGREMENT sans agrément enregistré
    for rec in Recuperateur.objects.filter(
        type_recuperateur='AVEC_AGREMENT', statut='ACTIF'
    ):
        if not rec.agrements.filter(type_agrement='AVEC_AGREMENT').exists():
            result.append({
                'id':             f"rec-no-agr-{rec.id}",
                'type':           'SANS_AGREMENT_ENREGISTRE',
                'severity':       'warning',
                'titre':          "Agrément non enregistré",
                'message':        (
                    f"Le récupérateur {rec.nom_raison_sociale} est de type "
                    f"'Avec agrément' mais aucun agrément n'est enregistré dans le système. "
                    f"Veuillez enregistrer l'agrément ou corriger la catégorie du récupérateur."
                ),
                'action':         'Enregistrer l\'agrément',
                'recuperateur':   rec.nom_raison_sociale,
                'recuperateur_id':rec.id,
                'wilaya':         rec.wilaya,
            })

    return result
