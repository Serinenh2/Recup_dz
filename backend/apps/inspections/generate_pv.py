from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable)
from reportlab.lib.enums import TA_CENTER
import io

def generate_pv_pdf(data: dict) -> bytes:
    buffer = io.BytesIO()
    BLACK = colors.black
    DBLUE = colors.HexColor('#1a3a5c')
    LBLUE = colors.HexColor('#dde8f0')
    GRAY  = colors.HexColor('#cccccc')
    WHITE = colors.white
    COL   = 17*cm

    TYPE_MAP = {
        'ROUTINE': 'Controle de routine',
        'SURPRISE': 'Controle inopine',
        'PLAINTE': 'Suite a plainte',
        'SUIVI': 'Controle de suivi',
    }
    RESULTAT_MAP = {
        'CONFORME':     'CONFORME',
        'NON_CONFORME': 'NON CONFORME',
        'EN_COURS':     "EN COURS D'EXAMEN",
    }
    RESULTAT_COLOR = {
        'CONFORME':     colors.HexColor('#1a5c2e'),
        'NON_CONFORME': colors.HexColor('#cc2200'),
        'EN_COURS':     colors.HexColor('#5c4a1a'),
    }

    resultat  = data.get('resultat', '')
    res_label = RESULTAT_MAP.get(resultat, resultat)
    res_color = RESULTAT_COLOR.get(resultat, DBLUE)

    def st(name, **kw): return ParagraphStyle(name, **kw)
    T  = st('T',  fontName='Helvetica-Bold', fontSize=11, alignment=TA_CENTER, textColor=DBLUE, leading=14)
    T2 = st('T2', fontName='Helvetica-Bold', fontSize=9,  alignment=TA_CENTER, textColor=DBLUE, leading=12)
    SH = st('SH', fontName='Helvetica-Bold', fontSize=8,  textColor=WHITE, leading=11)
    SH2= st('SH2',fontName='Helvetica-Bold', fontSize=8,  textColor=WHITE, leading=11, alignment=TA_CENTER)
    LB = st('LB', fontName='Helvetica-Bold', fontSize=7.5, textColor=DBLUE, leading=10)
    VL = st('VL', fontName='Helvetica',      fontSize=7.5, textColor=BLACK, leading=10)
    VLH= st('VLH',fontName='Helvetica',      fontSize=7.5, textColor=BLACK, leading=20)
    FT = st('FT', fontName='Helvetica',      fontSize=6,  textColor=GRAY,  alignment=TA_CENTER, leading=8)

    def sec_hdr(txt):
        t = Table([[Paragraph(txt, SH)]], colWidths=[COL])
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),DBLUE),
            ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
            ('LEFTPADDING',(0,0),(-1,-1),10)]))
        return t

    def frow(label, value, h=4):
        val = str(value) if value is not None else ''
        t = Table([[Paragraph(label, LB), Paragraph(val, VL)]], colWidths=[5*cm, 12*cm])
        t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),0.25,GRAY),
            ('TOPPADDING',(0,0),(-1,-1),h),('BOTTOMPADDING',(0,0),(-1,-1),h),
            ('LEFTPADDING',(0,0),(-1,-1),8),('VALIGN',(0,0),(-1,-1),'TOP')]))
        return t

    def drow(l1, v1, l2, v2):
        v1 = str(v1) if v1 is not None else ''
        v2 = str(v2) if v2 is not None else ''
        t = Table([[Paragraph(l1,LB),Paragraph(v1,VL),Paragraph(l2,LB),Paragraph(v2,VL)]],
                  colWidths=[3.8*cm,4.7*cm,3.8*cm,4.7*cm])
        t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),0.25,GRAY),
            ('LINEAFTER',(1,0),(1,-1),0.4,GRAY),
            ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
            ('LEFTPADDING',(0,0),(-1,-1),8),('VALIGN',(0,0),(-1,-1),'TOP')]))
        return t

    def bbox(rows):
        t = Table([[r] for r in rows], colWidths=[COL])
        t.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.6,DBLUE),
            ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0),
            ('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0)]))
        return t

    doc = SimpleDocTemplate(buffer, pagesize=A4,
        topMargin=1.0*cm, bottomMargin=1.0*cm, leftMargin=2.0*cm, rightMargin=2.0*cm)
    story = []

    nh = Table([[Paragraph('REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE', T)]], colWidths=[COL])
    nh.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),2.5,DBLUE),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    story.append(nh)
    story.append(Spacer(1,3))
    story.append(Paragraph('PROCES-VERBAL DE CONTROLE ENVIRONNEMENTAL', T2))
    story.append(Paragraph(
        'Controle de la gestion des dechets speciaux dangereux',
        st('ref', fontName='Helvetica', fontSize=6.5, alignment=TA_CENTER, textColor=GRAY, spaceAfter=5)))

    nd = Table([[
        Paragraph(f'N° PV : <b>{data.get("pv_numero","")}</b>', VL),
        Paragraph(f'Date : <b>{data.get("date_inspection","")}</b>', VL),
        Paragraph(f'Type : <b>{TYPE_MAP.get(data.get("type_inspection",""), data.get("type_inspection",""))}</b>', VL),
    ]], colWidths=[5.67*cm]*3)
    nd.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.6,DBLUE),('BACKGROUND',(0,0),(-1,-1),LBLUE),
        ('INNERGRID',(0,0),(-1,-1),0.3,GRAY),('TOPPADDING',(0,0),(-1,-1),5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),('LEFTPADDING',(0,0),(-1,-1),12)]))
    story.append(nd)
    story.append(Spacer(1,5))

    if res_label:
        res_style = ParagraphStyle('RS', fontName='Helvetica-Bold', fontSize=14,
                                   textColor=res_color, alignment=TA_CENTER, leading=18)
        res_table = Table([[Paragraph(f'RESULTAT : {res_label}', res_style)]], colWidths=[COL])
        res_table.setStyle(TableStyle([
            ('BOX',(0,0),(-1,-1),1.5,res_color),
            ('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),
        ]))
        story.append(res_table)
        story.append(Spacer(1,5))

    recup_nom = data.get('recuperateur_nom', '')
    if not recup_nom:
        recup_raw = data.get('recuperateur', '')
        if isinstance(recup_raw, dict):
            recup_nom = recup_raw.get('nom_raison_sociale', '')
        elif recup_raw:
            recup_nom = str(recup_raw)

    delai = data.get('delai_regularisation', '')
    if delai:
        delai = str(delai)

    story.append(sec_hdr('ETABLISSEMENT CONTROLE'))
    story.append(bbox([
        frow('Recuperateur :', recup_nom, h=5),
        drow('Type de controle :', TYPE_MAP.get(data.get('type_inspection',''), data.get('type_inspection','')),
             'N° PV :', data.get('pv_numero','')),
        drow('Date du controle :', data.get('date_inspection',''),
             'Delai de regularisation :', delai),
    ]))
    story.append(Spacer(1,5))

    story.append(sec_hdr('OBSERVATIONS ET CONSTATS'))
    story.append(bbox([frow('Observations :', data.get('observations',''), h=6)]))
    story.append(Spacer(1,5))

    story.append(sec_hdr('ACTIONS CORRECTIVES'))
    story.append(bbox([frow('Actions correctives requises :', data.get('actions_correctives',''), h=6)]))
    story.append(Spacer(1,10))

    story.append(sec_hdr('SIGNATURES'))
    story.append(Spacer(1,4))
    sigs = Table([
        [Paragraph("L'INSPECTEUR", SH2), Paragraph("LE RESPONSABLE DE L'ETABLISSEMENT", SH2)],
        [Paragraph('Nom et qualite :', LB), Paragraph('Nom et qualite :', LB)],
        [Paragraph('', VLH), Paragraph('', VLH)],
        [Paragraph('Signature et cachet :', LB), Paragraph('Signature et cachet :', LB)],
        [Paragraph('', VLH), Paragraph('', VLH)],
        [Paragraph('', VLH), Paragraph('', VLH)],
    ], colWidths=[8.5*cm, 8.5*cm])
    sigs.setStyle(TableStyle([
        ('BOX',(0,0),(-1,-1),0.6,DBLUE),
        ('BACKGROUND',(0,0),(1,0),DBLUE),
        ('LINEAFTER',(0,0),(0,-1),0.4,GRAY),
        ('INNERGRID',(0,1),(-1,-1),0.2,GRAY),
        ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LEFTPADDING',(0,0),(-1,-1),8),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
    ]))
    story.append(sigs)

    story.append(Spacer(1,10))
    story.append(HRFlowable(width='100%', thickness=0.5, color=DBLUE))
    story.append(Paragraph(
        'Loi n°01-19 du 12 decembre 2001 relative a la gestion, au controle et a l\'elimination des dechets — '
        'Decret executif n°05-315 du 10 septembre 2005.',
        FT))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
