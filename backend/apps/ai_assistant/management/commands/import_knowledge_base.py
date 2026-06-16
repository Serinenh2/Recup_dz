from django.core.management.base import BaseCommand
from apps.ai_assistant.knowledge_base_data import importer_connaissances


class Command(BaseCommand):
    help = "Importe la base de connaissances réglementaire (Loi 01-19, Décret 06-104, etc.)"

    def handle(self, *args, **options):
        self.stdout.write("Importation de la base de connaissances réglementaire...")
        resultat = importer_connaissances()
        self.stdout.write(
            self.style.SUCCESS(
                f"Base de connaissances importée avec succès: "
                f"{resultat['creees']} nouvelles entrées, "
                f"{resultat['mises_a_jour']} entrées mises à jour."
            )
        )
