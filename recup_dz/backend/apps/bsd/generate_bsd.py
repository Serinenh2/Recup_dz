from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable)
from reportlab.lib.enums import TA_CENTER
import io

def generate_bsd_pdf(data: dict) -> bytes:
    buffer = io.BytesIO()
    BLACK = colors.black
    DBLUE = colors.HexColor('#1a3a5c')
    LBLUE = colors.HexColor('#dde8f0')
    GRAY  = colors.HexColor('#cccccc')
    WHITE = colors.white
    COL   = 17*cm

    def st(name, **kw): return ParagraphStyle(name, **kw)
    T  = st('T',  fontName='Helvetica-Bold', fontSize=11, alignment=TA_CENTER, textColor=DBLUE, leading=14)
    T2 = st('T2', fontName='Helvetica-Bold', fontSize=9,  alignment=TA_CENTER, textColor=DBLUE, leading=12)
    SH = st('SH', fontName='Helvetica-Bold', fontSize=8,  textColor=WHITE, leading=11)
    LB = st('LB', fontName='Helvetica-Bold', fontSize=7.5, textColor=DBLUE, leading=10)
    VL = st('VL', fontName='Helvetica',      fontSize=7.5, textColor=BLACK, leading=10)
    HD = st('HD', fontName='Helvetica-Bold', fontSize=7.5, textColor=WHITE, alignment=TA_CENTER, leading=10)
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
    story.append(Paragraph('BORDEREAU DE SUIVI DES DECHETS', T2))
    story.append(Paragraph(
        'Decret executif n°06-104 — Gestion des dechets speciaux dangereux',
        st('ref', fontName='Helvetica', fontSize=6.5, alignment=TA_CENTER, textColor=GRAY, spaceAfter=5)))

    nd = Table([[
        Paragraph(f'N° BSD : <b>{data.get("numero","")}</b>', VL),
        Paragraph(f'Date d\'emission : <b>{data.get("date_emission","")}</b>', VL),
        Paragraph(f'Statut : <b>{data.get("statut","")}</b>', VL),
    ]], colWidths=[5.67*cm]*3)
    nd.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.6,DBLUE),('BACKGROUND',(0,0),(-1,-1),LBLUE),
        ('INNERGRID',(0,0),(-1,-1),0.3,GRAY),('TOPPADDING',(0,0),(-1,-1),5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),('LEFTPADDING',(0,0),(-1,-1),12)]))
    story.append(nd)
    story.append(Spacer(1,5))

    story.append(sec_hdr('IDENTIFICATION DU DECHET'))
    story.append(bbox([
        drow('Code du dechet :', data.get('code_dechet',''), 'Classe :', data.get('classe','')),
        frow('Denomination / Designation :', data.get('designation','')),
        drow('Quantite :', f'{data.get("quantite","")} {data.get("unite","")}', 'Emballage :', data.get('emballage','')),
    ]))
    story.append(Spacer(1,5))

    story.append(sec_hdr('IDENTIFICATION DES ACTEURS'))
    story.append(bbox([
        frow('Generateur / Producteur :', data.get('generateur_nom','')),
        frow('Adresse du generateur :', data.get('generateur_adresse','')),
        drow('Transporteur :', data.get('transporteur_nom',''), 'Vehicule :', data.get('transporteur_vehicule','')),
        drow('Recepteur / Destinataire :', data.get('recepteur_nom',''), 'Type de traitement :', data.get('type_traitement','')),
    ]))
    story.append(Spacer(1,5))

    story.append(sec_hdr('DATES ET TRACABILITE'))
    story.append(bbox([
        drow('Date d\'emission :', data.get('date_emission',''), 'Date de reception :', data.get('date_reception','')),
    ]))
    story.append(Spacer(1,8))

    story.append(sec_hdr('SIGNATURES'))
    story.append(Spacer(1,4))

    def sig_cell(role, nom, signed):
        mark = 'SIGNE' if signed else '........................'
        inner = Table([
            [Paragraph(role, HD)],
            [Paragraph(str(nom or '........................'), VL)],
            [Paragraph(f'Signature : {mark}', VL)],
            [Paragraph('', VL)],
        ], colWidths=[5.5*cm])
        inner.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(0,0),DBLUE),
            ('BOX',(0,0),(-1,-1),0.5,DBLUE),
            ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
            ('LEFTPADDING',(0,0),(-1,-1),8),
        ]))
        return inner

    sigs_table = Table([[
        sig_cell('GENERATEUR',  data.get('generateur_nom',''),  data.get('signature_generateur',False)),
        sig_cell('TRANSPORTEUR',data.get('transporteur_nom',''),data.get('signature_transporteur',False)),
        sig_cell('RECEPTEUR',   data.get('recepteur_nom',''),   data.get('signature_recepteur',False)),
    ]], colWidths=[5.5*cm]*3)
    sigs_table.setStyle(TableStyle([
        ('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1),3),('RIGHTPADDING',(0,0),(-1,-1),3),
        ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0),
    ]))
    story.append(sigs_table)

    if data.get('observations'):
        story.append(Spacer(1,8))
        story.append(sec_hdr('OBSERVATIONS'))
        story.append(bbox([frow('Observations :', data.get('observations',''), h=6)]))

    story.append(Spacer(1,10))
    story.append(HRFlowable(width='100%', thickness=0.5, color=DBLUE))
    story.append(Paragraph(
        'Decret executif n°06-104 du 28 fevrier 2006 — '
        'Loi n°01-19 du 12 decembre 2001 relative a la gestion, au controle et a l\'elimination des dechets.',
        FT))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
