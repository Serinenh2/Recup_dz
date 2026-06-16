from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                Table, TableStyle, HRFlowable, PageBreak)
from reportlab.lib.enums import TA_CENTER
import io

def generate_dsd_pdf(data: dict) -> bytes:
    buffer = io.BytesIO()

    BLACK = colors.black
    DBLUE = colors.HexColor('#1a3a5c')
    LBLUE = colors.HexColor('#dde8f0')
    GRAY  = colors.HexColor('#cccccc')
    LGRAY = colors.HexColor('#f5f5f5')
    WHITE = colors.white
    RED   = colors.HexColor('#cc2200')
    COL   = 17*cm

    def st(name, **kw): return ParagraphStyle(name, **kw)
    T  = st('T',  fontName='Helvetica-Bold', fontSize=11, alignment=TA_CENTER, textColor=DBLUE, leading=14)
    T2 = st('T2', fontName='Helvetica-Bold', fontSize=9,  alignment=TA_CENTER, textColor=DBLUE, leading=12, spaceAfter=1)
    SH = st('SH', fontName='Helvetica-Bold', fontSize=8,  textColor=WHITE,  leading=11)
    LB = st('LB', fontName='Helvetica-Bold', fontSize=7.5,textColor=DBLUE, leading=10)
    VL = st('VL', fontName='Helvetica',      fontSize=7.5,textColor=BLACK,  leading=10)
    SM = st('SM', fontName='Helvetica',      fontSize=7,  textColor=BLACK,  leading=9)
    HD = st('HD', fontName='Helvetica-Bold', fontSize=7.5,textColor=WHITE,  alignment=TA_CENTER, leading=10)
    BN = st('BN', fontName='Helvetica-Bold', fontSize=13, textColor=DBLUE,  alignment=TA_CENTER, leading=16)
    RD = st('RD', fontName='Helvetica-Bold', fontSize=7.5,textColor=RED,    leading=10)
    FT = st('FT', fontName='Helvetica',      fontSize=6,  textColor=GRAY,   alignment=TA_CENTER, leading=8)

    def sec_hdr(txt):
        t = Table([[Paragraph(txt, SH)]], colWidths=[COL])
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),DBLUE),
            ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
            ('LEFTPADDING',(0,0),(-1,-1),10)]))
        return t

    def sub_hdr(txt):
        t = Table([[Paragraph(f'  {txt}', LB)]], colWidths=[COL])
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),LBLUE),
            ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
            ('LEFTPADDING',(0,0),(-1,-1),8)]))
        return t

    def frow(label, value, h=4):
        t = Table([[Paragraph(label,LB), Paragraph(value or '',VL)]],
                  colWidths=[5*cm, 12*cm])
        t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),0.25,GRAY),
            ('TOPPADDING',(0,0),(-1,-1),h),('BOTTOMPADDING',(0,0),(-1,-1),h),
            ('LEFTPADDING',(0,0),(-1,-1),8),('VALIGN',(0,0),(-1,-1),'TOP')]))
        return t

    def drow(l1, v1, l2, v2):
        t = Table([[Paragraph(l1,LB),Paragraph(v1 or '',VL),
                    Paragraph(l2,LB),Paragraph(v2 or '',VL)]],
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
        topMargin=1.0*cm, bottomMargin=1.0*cm,
        leftMargin=2.0*cm, rightMargin=2.0*cm)
    story = []

    # ── PAGE 1 ──────────────────────────────────────────────
    nh = Table([[Paragraph('REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE', T)]], colWidths=[COL])
    nh.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),2.5,DBLUE),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    story.append(nh)
    story.append(Spacer(1,3))
    story.append(Paragraph('DECLARATION DES DECHETS SPECIAUX DANGEREUX', T2))
    story.append(Paragraph('Decret executif n°05-315 du 10 septembre 2005 — Journal Officiel n°62',
        st('ref',fontName='Helvetica',fontSize=6.5,alignment=TA_CENTER,textColor=GRAY,spaceAfter=5)))

    yd = Table([[
        Paragraph(f'Annee : <b>{data.get("annee","")}</b>', VL),
        Paragraph(f'Date de transmission : <b>{data.get("date_transmission","")}</b>', VL),
    ]], colWidths=[8.5*cm,8.5*cm])
    yd.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.6,DBLUE),('BACKGROUND',(0,0),(-1,-1),LBLUE),
        ('LINEAFTER',(0,0),(0,-1),0.4,GRAY),('TOPPADDING',(0,0),(-1,-1),5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),('LEFTPADDING',(0,0),(-1,-1),12)]))
    story.append(yd)
    story.append(Spacer(1,4))

    story.append(sec_hdr('IDENTIFICATION DU GENERATEUR ET/OU DU DETENTEUR'))
    story.append(bbox([
        drow('Statut :',data.get('statut',''),'Denomination :',data.get('denomination','')),
        frow('Siege social :',data.get('siege_social','')),
        frow('Domaine d activite :',data.get('domaine_activite','')),
        frow('Certification :',data.get('certification','')),
        frow('Responsable dechets :',data.get('responsable_dechets','')),
    ]))
    story.append(Spacer(1,4))

    story.append(sec_hdr('A  —  NATURE, QUANTITE ET CARACTERISTIQUES DES DECHETS SPECIAUX DANGEREUX GENERES'))
    story.append(Spacer(1,1))
    story.append(sub_hdr('1 — Nature des dechets speciaux dangereux generes'))
    story.append(bbox([
        frow('Matiere premiere :',data.get('matiere_premiere','')),
        frow('Denomination du dechet :',data.get('denomination_dechet','')),
        drow('Code du dechet :',data.get('code_dechet',''),'Consistance :',data.get('consistance','')),
        frow('Precisions / Melanges :',data.get('autres_precisions','')),
    ]))
    story.append(Spacer(1,3))

    story.append(sub_hdr('2 — Quantite & 3 — Caracteristiques'))
    qc = Table([[
        Table([[Paragraph('Quantite generee',HD),
                Paragraph(f'{data.get("quantite_generee","...")}',BN),
                Paragraph('tonnes / an',st('u',fontName='Helvetica',fontSize=8,textColor=WHITE,alignment=TA_CENTER))]],
               colWidths=[5*cm]),
        Table([[Paragraph('Composition chimique :',LB), Paragraph(data.get('composition_chimique',''),VL)],
               [Paragraph('Critere de dangerosite :',LB), Paragraph(data.get('critere_dangerosite',''),RD)]],
              colWidths=[4.5*cm,7.5*cm]),
    ]], colWidths=[5*cm,12*cm])
    qc.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.6,DBLUE),('LINEAFTER',(0,0),(0,-1),0.5,GRAY),
        ('BACKGROUND',(0,0),(0,-1),DBLUE),('INNERGRID',(1,0),(1,-1),0.2,GRAY),
        ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
        ('LEFTPADDING',(0,0),(-1,-1),8),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('ALIGN',(0,0),(0,-1),'CENTER')]))
    story.append(qc)
    story.append(Spacer(1,3))

    story.append(sub_hdr('4 — Stockage des dechets speciaux dangereux'))
    stq = Table([[
        Paragraph('STOCKAGE TEMPORAIRE',HD),
        Paragraph(f'{data.get("stockage_temporaire_qte","0")} t/an',st('sq',fontName='Helvetica-Bold',fontSize=12,textColor=DBLUE,alignment=TA_CENTER)),
        Paragraph('STOCKAGE PERMANENT',HD),
        Paragraph(f'{data.get("stockage_permanent_qte","0")} t/an',st('sq2',fontName='Helvetica-Bold',fontSize=12,textColor=GRAY,alignment=TA_CENTER)),
    ]], colWidths=[4.25*cm]*4)
    stq.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.6,DBLUE),('INNERGRID',(0,0),(-1,-1),0.3,GRAY),
        ('BACKGROUND',(0,0),(1,-1),DBLUE),('BACKGROUND',(2,0),(-1,-1),LGRAY),
        ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('LEFTPADDING',(0,0),(-1,-1),6)]))
    story.append(stq)
    story.append(bbox([frow('Modalites de stockage :',data.get('modalites_stockage',''),h=5)]))

    # ── PAGE 2 ──────────────────────────────────────────────
    story.append(PageBreak())
    nh2 = Table([[Paragraph('DECLARATION DES DECHETS SPECIAUX DANGEREUX  —  SUITE (Page 2/2)',T2)]],colWidths=[COL])
    nh2.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),2.5,DBLUE),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story.append(nh2)
    story.append(Spacer(1,5))

    story.append(sec_hdr('B  —  MODES DE TRAITEMENT'))
    story.append(bbox([
        drow('Modalites de gestion :',data.get('modalites_gestion',''),'Modalites de controle :',data.get('modalites_controle','')),
        frow('Modalites d elimination :',data.get('modalites_elimination','')),
        frow('Types d installation de traitement :',data.get('types_installation','')),
        frow('Types de traitement :',data.get('types_traitement','')),
        drow('Quantites traitees :',f'{data.get("quantites_traitees","...")} t/an','Rendement :',data.get('rendement_traitement','')),
    ]))
    story.append(Spacer(1,5))

    story.append(sec_hdr('C  —  MESURES PRISES ET A PREVOIR POUR EVITER LA PRODUCTION DES DECHETS SPECIAUX DANGEREUX'))
    story.append(Spacer(1,3))

    qty_row = [[
        Table([[Paragraph('REUTILISATION',HD)],[Paragraph(f'{data.get("reutilisation_qte","0")} t/an',st('q1',fontName='Helvetica-Bold',fontSize=14,textColor=GRAY,alignment=TA_CENTER))]],colWidths=[4.25*cm]),
        Table([[Paragraph('RECYCLAGE',HD)],[Paragraph(f'{data.get("recyclage_qte","0")} t/an',st('q2',fontName='Helvetica-Bold',fontSize=14,textColor=WHITE,alignment=TA_CENTER))]],colWidths=[4.25*cm]),
        Table([[Paragraph('VALORISATION',HD)],[Paragraph(f'{data.get("valorisation_qte","0")} t/an',st('q3',fontName='Helvetica-Bold',fontSize=14,textColor=WHITE,alignment=TA_CENTER))]],colWidths=[4.25*cm]),
        Table([[Paragraph('ELIMINATION',HD)],[Paragraph(f'{data.get("elimination_qte","0")} t/an',st('q4',fontName='Helvetica-Bold',fontSize=14,textColor=RED,alignment=TA_CENTER))]],colWidths=[4.25*cm]),
    ]]
    tq = Table(qty_row, colWidths=[4.25*cm]*4)
    tq.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.6,DBLUE),('INNERGRID',(0,0),(-1,-1),0.4,GRAY),
        ('BACKGROUND',(0,0),(-1,-1),DBLUE),('TOPPADDING',(0,0),(-1,-1),5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
    story.append(tq)
    story.append(Spacer(1,4))

    mesures = [
        ('1 — Techniques de minimisation',             data.get('mesures_min_prises',''),   data.get('mesures_min_envisager','')),
        ('2 — Bonnes pratiques environnementales',     data.get('mesures_bpe_prises',''),   data.get('mesures_bpe_envisager','')),
        ('3 — Techniques disponibles',                 data.get('mesures_tech_prises',''),  data.get('mesures_tech_envisager','')),
        ('4 — Techniques de production plus propres',  data.get('mesures_pp_prises',''),    data.get('mesures_pp_envisager','')),
        ('5 — Gestion preventive et maitrise des risques', data.get('mesures_risques_prises',''), data.get('mesures_risques_envisager','')),
    ]
    hrow = [Paragraph('',HD), Paragraph('MESURES PRISES',HD), Paragraph('MESURES A ENVISAGER',HD)]
    mrows = [hrow] + [[Paragraph(m[0],LB), Paragraph(m[1],SM), Paragraph(m[2],SM)] for m in mesures]
    mt = Table(mrows, colWidths=[4.5*cm,6.25*cm,6.25*cm],
               rowHeights=[0.6*cm,1.85*cm,1.85*cm,1.85*cm,1.85*cm,1.85*cm])
    mt.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.7,DBLUE),('INNERGRID',(0,0),(-1,-1),0.3,GRAY),
        ('BACKGROUND',(0,0),(-1,0),DBLUE),('BACKGROUND',(0,2),(-1,2),LGRAY),
        ('BACKGROUND',(0,4),(-1,4),LGRAY),('TOPPADDING',(0,0),(-1,-1),4),
        ('BOTTOMPADDING',(0,0),(-1,-1),4),('LEFTPADDING',(0,0),(-1,-1),6),
        ('VALIGN',(0,0),(-1,-1),'TOP')]))
    story.append(mt)
    story.append(Spacer(1,8))

    sig = Table([[
        Table([[Paragraph('Fait a :',LB),Paragraph('........................................',VL)],
               [Paragraph('Date :',LB),Paragraph(f'<b>{data.get("date_transmission","")}</b>',VL)]],
              colWidths=[2.5*cm,5.5*cm]),
        Table([[Paragraph('Nom et qualite du signataire :',LB),Paragraph(f'<b>{data.get("responsable_dechets","")}</b>',VL)],
               [Paragraph('Signature et cachet :',LB),Paragraph('',VL)]],
              colWidths=[5*cm,3.5*cm]),
    ]], colWidths=[8.5*cm,8.5*cm])
    sig.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.7,DBLUE),('LINEAFTER',(0,0),(0,-1),0.4,GRAY),
        ('BACKGROUND',(0,0),(-1,-1),LBLUE),('TOPPADDING',(0,0),(-1,-1),6),
        ('BOTTOMPADDING',(0,0),(-1,-1),6),('LEFTPADDING',(0,0),(-1,-1),10),
        ('VALIGN',(0,0),(-1,-1),'TOP')]))
    story.append(sig)
    story.append(Spacer(1,6))
    story.append(HRFlowable(width='100%', thickness=0.5, color=DBLUE))
    story.append(Paragraph(
        'Conformement au Decret executif n°05-315 du 10 septembre 2005 — '
        'Loi n°01-19 du 12 decembre 2001 — '
        'A transmettre dans un delai n excedant pas 3 mois apres la cloture de l annee consideree.',
        FT))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()