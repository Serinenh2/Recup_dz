"""
RECUP-DZ Setup Script
Run this once after migrations to create superuser and import nomenclature.
Usage: python setup.py
"""
import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
U = get_user_model()

# ── Create superuser ──────────────────────────────────────────────────────────
if not U.objects.filter(username='admin').exists():
    admin = U.objects.create_superuser(
        username    = 'admin',
        password    = 'Admin2024!',
        email       = 'admin@recup-dz.gov.dz',
        first_name  = 'Administrateur',
        last_name   = 'Système',
        role        = 'ADMIN',
    )
    print('✅ Superuser created')
    print('   Username: admin')
    print('   Password: Admin2024!')
else:
    admin = U.objects.get(username='admin')
    print('ℹ️  Superuser already exists (admin)')

# Create inspecteur
if not U.objects.filter(username='inspecteur1').exists():
    U.objects.create_user(
        username   = 'inspecteur1',
        password   = 'Inspect2024!',
        email      = 'inspecteur@env.dz',
        first_name = 'Ahmed',
        last_name  = 'Bensalem',
        role       = 'INSPECTEUR',
        wilaya     = '16',
    )
    print('✅ Inspecteur created: inspecteur1 / Inspect2024!')

# ── Import nomenclature ───────────────────────────────────────────────────────
from apps.nomenclature.models import Nomenclature

NOMENCLATURE = [
    # MA — Ménagers et Assimilés
    ('20.01.01','20','20.01','Papier et carton','ورق وكرتون','MA',False,False),
    ('20.01.02','20','20.01','Verre','زجاج','MA',False,False),
    ('20.01.08','20','20.01','Déchets de cuisine et de table biodégradables','نفايات المطبخ القابلة للتحلل','MA',False,False),
    ('20.01.10','20','20.01','Vêtements','ملابس','MA',False,False),
    ('20.01.11','20','20.01','Textiles','نسيج','MA',False,False),
    ('20.01.36','20','20.01','Équipements électriques et électroniques mis au rebut','معدات كهربائية مهملة','MA',False,False),
    ('20.02.01','20','20.02','Déchets biodégradables','نفايات قابلة للتحلل','MA',False,False),
    ('20.03.01','20','20.03','Déchets municipaux en mélange','نفايات بلدية مختلطة','MA',False,False),
    # I — Inertes
    ('17.01.01','17','17.01','Béton','خرسانة','I',False,False),
    ('17.01.02','17','17.01','Briques','طوب','I',False,False),
    ('17.01.07','17','17.01','Mélanges de béton, briques, tuiles','خليط خرسانة وطوب','I',False,False),
    ('17.02.01','17','17.02','Bois','خشب','I',False,False),
    ('17.02.02','17','17.02','Verre (inerte)','زجاج خامل','I',False,False),
    ('17.02.03','17','17.02','Matières plastiques','مواد بلاستيكية','I',False,False),
    ('17.04.01','17','17.04','Cuivre, bronze, laiton','نحاس وبرونز ونحاس أصفر','I',False,False),
    ('17.04.02','17','17.04','Aluminium','ألمنيوم','I',False,False),
    ('17.04.05','17','17.04','Fer et acier','حديد وفولاذ','I',False,False),
    ('17.04.07','17','17.04','Métaux en mélange','معادن مختلطة','I',False,False),
    # S — Spéciaux
    ('13.01.01','13','13.01','Huiles hydrauliques chlorées','زيوت هيدروليكية مكلورة','S',False,True),
    ('13.02.01','13','13.02','Huiles moteur, de boîte de vitesses et de lubrification usagées','زيوت المحرك المستعملة','S',False,True),
    ('16.01.03','16','16.01','Pneus hors d\'usage','إطارات خارج الخدمة','S',False,True),
    ('16.06.01','16','16.06','Batteries au plomb','بطاريات الرصاص','S',False,True),
    ('16.06.02','16','16.06','Batteries Ni-Cd','بطاريات نيكل كادميوم','S',False,True),
    # SD — Spéciaux Dangereux
    ('13.01.09','13','13.01','Huiles hydrauliques minérales chlorées','زيوت هيدروليكية معدنية مكلورة','SD',True,True),
    ('13.03.01','13','13.03','Huiles isolantes et fluides caloporteurs contenant des PCB','زيوت عازلة تحتوي على PCB','SD',True,True),
    ('07.01.01','07','07.01','Eaux de nettoyage et lessives aqueuses','مياه التنظيف والمحاليل القلوية','SD',True,True),
    ('07.01.03','07','07.01','Solvants halogénés organiques','مذيبات هالوجينية عضوية','SD',True,True),
    ('07.01.04','07','07.01','Autres solvants organiques','مذيبات عضوية أخرى','SD',True,True),
    ('08.01.11','08','08.01','Déchets de peintures et vernis contenant des solvants organiques','نفايات دهانات تحتوي على مذيبات','SD',True,True),
    ('14.06.01','14','14.06','Chlorofluorocarbures (CFC, HCFC, HFC)','كلوروفلوروكربون','SD',True,True),
    ('16.05.04','16','16.05','Produits chimiques dangereux (dont périmés)','مواد كيميائية خطرة','SD',True,True),
    ('18.01.03','18','18.01','Déchets dont la collecte et l\'élimination font l\'objet de prescriptions','نفايات طبية معدية','SD',True,True),
    ('19.08.07','19','19.08','Solutions et boues provenant de la régénération des échangeurs','محاليل وحمأة معالجة','SD',True,True),
]

if Nomenclature.objects.count() < 10:
    Nomenclature.objects.all().delete()
    for code, famille, sf, fr, ar, classe, dangereux, agr in NOMENCLATURE:
        Nomenclature.objects.create(
            code=code, famille=famille, sous_famille=sf,
            designation_fr=fr, designation_ar=ar, classe=classe,
            bsd_obligatoire=dangereux, agrement_requis=agr,
            inflammable=(classe=='SD'), toxique=(classe=='SD'),
        )
    print(f'✅ Nomenclature imported: {Nomenclature.objects.count()} entries')
else:
    print(f'ℹ️  Nomenclature already loaded: {Nomenclature.objects.count()} entries')

# ── Create sample recuperateurs ───────────────────────────────────────────────
from apps.recuperateurs.models import Recuperateur, AgrementRecuperateur

if not Recuperateur.objects.exists():
    r = Recuperateur.objects.create(
        nom_raison_sociale = 'SARL EcoRecup Alger',
        nom_commercial     = 'EcoRecup',
        type_recuperateur  = 'AVEC_AGREMENT',
        statut_juridique   = 'SARL',
        responsable        = 'Mohamed Benali',
        wilaya             = '16',
        commune            = 'Rouiba',
        adresse            = 'Zone Industrielle Rouiba, Alger',
        telephone          = '+213 21 801 234',
        email              = 'contact@ecorecup.dz',
        statut             = 'ACTIF',
    )
    AgrementRecuperateur.objects.create(
        recuperateur    = r,
        numero_agrement = 'AGR-16-REC-2024-001',
        date_delivrance = date.today().replace(year=date.today().year - 1),
        date_fin        = date.today() + timedelta(days=400),
        codes_dechets   = '13.02.01,16.01.03',
        statut          = 'ACTIF',
    )
    print('✅ Sample recuperateur created: SARL EcoRecup Alger')

    r2 = Recuperateur.objects.create(
        user               = admin,
        nom_raison_sociale = 'SARL Gold Environment Service',
        type_recuperateur  = 'AVEC_AGREMENT',
        statut             = 'ACTIF',
        wilaya             = '35',
    )
    print('✅ Recuperateur created:', r2.nom_raison_sociale)

print()
print('=' * 50)
print('SETUP COMPLETE')
print('=' * 50)
print('Login: http://localhost:8000/admin')
print('  Username: admin')
print('  Password: Admin2024!')
print('API:   http://localhost:8000/api/')
print('Frontend: http://localhost:5173')
