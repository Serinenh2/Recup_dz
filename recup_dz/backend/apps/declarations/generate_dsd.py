"""
Génération du PDF DSD — Déclaration des Déchets Spéciaux Dangereux
Conforme au Décret exécutif n°05-315 du 10 septembre 2005
PDF pleine page A4 — 2 pages
"""
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
    W, H   = A4
    BLACK  = colors.black
    DBLUE  = colors.HexColor('#1a3a5c')
    LBLUE  = colors.HexColor('#dde8f0')
    GRAY   = colors.HexColor('#cccccc')
    LGRAY  = colors.HexColor('#f5f5f5')
    WHITE  = colors.white
    RED    = colors.HexColor('#cc2200')
    ML = 1.5*cm; MR = 1.5*cm; MT = 1.0*cm; MB = 1.0*cm
    COL = W - ML - MR

    def ps(n, **k): return ParagraphStyle(n, **k)
    T2 = ps('T2',fontName='Helvetica-Bold',fontSize=10,alignment=TA_CENTER,textColor=DBLUE,leading=13)
    SH = ps('SH',fontName='Helvetica-Bold',fontSize=8.5,textColor=WHITE,leading=11)
    LB = ps('LB',fontName='Helvetica-Bold',fontSize=8,textColor=DBLUE,leading=11)
    VL = ps('VL',fontName='Helvetica',fontSize=8,textColor=BLACK,leading=11)
    SM = ps('SM',fontName='Helvetica',fontSize=7,textColor=BLACK,leading=9)
    HD = ps('HD',fontName='Helvetica-Bold',fontSize=8,textColor=WHITE,alignment=TA_CENTER,leading=11)
    BN = ps('BN',fontName='Helvetica-Bold',fontSize=20,textColor=DBLUE,alignment=TA_CENTER)
    RD = ps('RD',fontName='Helvetica-Bold',fontSize=8,textColor=RED,leading=11)
    FT = ps('FT',fontName='Helvetica',fontSize=6.5,textColor=GRAY,alignment=TA_CENTER,leading=9)

    def sec_hdr(txt):
        t = Table([[Paragraph(f'  {txt}',SH)]],colWidths=[COL])
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),DBLUE),
            ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
        return t

    def sub_hdr(txt):
        t = Table([[Paragraph(f'  {txt}',LB)]],colWidths=[COL])
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),LBLUE),
            ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
        return t

    def fr(lb,val,h=5):
        t = Table([[Paragraph(lb,LB),Paragraph(val or '',VL)]],
                  colWidths=[5.5*cm,COL-5.5*cm])
        t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),0.3,GRAY),
            ('TOPPADDING',(0,0),(-1,-1),h),('BOTTOMPADDING',(0,0),(-1,-1),h),
            ('LEFTPADDING',(0,0),(-1,-1),8),('VALIGN',(0,0),(-1,-1),'TOP')]))
        return t

    def dr(l1,v1,l2,v2):
        hw=COL/2
        t=Table([[Paragraph(l1,LB),Paragraph(v1 or '',VL),
                  Paragraph(l2,LB),Paragraph(v2 or '',VL)]],
                colWidths=[4*cm,hw-4*cm,4*cm,hw-4*cm])
        t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),0.3,GRAY),
            ('LINEAFTER',(1,0),(1,-1),0.4,GRAY),
            ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
            ('LEFTPADDING',(0,0),(-1,-1),8),('VALIGN',(0,0),(-1,-1),'TOP')]))
        return t

    def box(rows):
        t=Table([[r] for r in rows],colWidths=[COL])
        t.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.7,DBLUE),
            ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0),
            ('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0)]))
        return t

    doc=SimpleDocTemplate(buffer,pagesize=A4,topMargin=MT,bottomMargin=MB,leftMargin=ML,rightMargin=MR)
    s=[]

    # PAGE 1
    nh=Table([[Paragraph('REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE',
        ps('T',fontName='Helvetica-Bold',fontSize=13,alignment=TA_CENTER,textColor=DBLUE,leading=16))]],colWidths=[COL])
    nh.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),3,DBLUE),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    s.append(nh); s.append(Spacer(1,3))
    s.append(Paragraph('DÉCLARATION DES DÉCHETS SPÉCIAUX DANGEREUX',T2))
    s.append(Paragraph('Décret exécutif n°05-315 du 10 septembre 2005 — Journal Officiel n°62',
        ps('ref',fontName='Helvetica',fontSize=7.5,alignment=TA_CENTER,textColor=GRAY,spaceAfter=5)))
    yd=Table([[Paragraph(f'Année : <b>{data.get("annee","")}</b>',VL),
               Paragraph(f'Date de transmission : <b>{data.get("date_transmission","")}</b>',VL)]],
             colWidths=[COL/2]*2)
    yd.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.7,DBLUE),('BACKGROUND',(0,0),(-1,-1),LBLUE),
        ('LINEAFTER',(0,0),(0,-1),0.4,GRAY),('TOPPADDING',(0,0),(-1,-1),6),
        ('BOTTOMPADDING',(0,0),(-1,-1),6),('LEFTPADDING',(0,0),(-1,-1),14)]))
    s.append(yd); s.append(Spacer(1,5))

    s.append(sec_hdr('IDENTIFICATION DU GÉNÉRATEUR ET/OU DU DÉTENTEUR'))
    s.append(box([dr('Statut :',data.get('statut',''),'Dénomination :',data.get('denomination','')),
        fr('Siège social :',data.get('siege_social',''),h=6),
        fr("Domaine d'activité :",data.get('domaine_activite',''),h=6),
        fr('Certification :',data.get('certification',''),h=6),
        fr('Responsable déchets :',data.get('responsable_dechets',''),h=6)]))
    s.append(Spacer(1,5))

    s.append(sec_hdr('A — NATURE, QUANTITÉ ET CARACTÉRISTIQUES DES DÉCHETS SPÉCIAUX DANGEREUX GÉNÉRÉS'))
    s.append(Spacer(1,1))
    s.append(sub_hdr('1 — Nature des déchets spéciaux dangereux générés'))
    s.append(box([fr('Matière première :',data.get('matiere_premiere',''),h=6),
        fr('Dénomination du déchet :',data.get('denomination_dechet',''),h=6),
        dr('Code du déchet :',data.get('code_dechet',''),'Consistance :',data.get('consistance','')),
        fr('Précisions / Mélanges :',data.get('autres_precisions',''),h=6)]))
    s.append(Spacer(1,4))

    s.append(sub_hdr('2 — Quantité & 3 — Caractéristiques'))
    qc=Table([[
        Table([[Paragraph('QUANTITÉ GÉNÉRÉE',HD),
                Paragraph(str(data.get('quantite_generee','...')),BN),
                Paragraph('tonnes / an',ps('u',fontName='Helvetica-Bold',fontSize=9,textColor=DBLUE,alignment=TA_CENTER))]],
               colWidths=[5.5*cm]),
        Table([[Paragraph('Composition chimique :',LB),Paragraph(data.get('composition_chimique',''),VL),
                Spacer(1,4),
                Paragraph('Critère de dangerosité :',LB),Paragraph(data.get('critere_dangerosite',''),RD)]],
               colWidths=[5*cm,COL-10.5*cm-0.5*cm]),
    ]],colWidths=[5.5*cm,COL-5.5*cm])
    qc.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.7,DBLUE),('LINEAFTER',(0,0),(0,-1),0.5,GRAY),
        ('BACKGROUND',(0,0),(0,-1),DBLUE),('INNERGRID',(1,0),(1,-1),0.2,GRAY),
        ('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),
        ('LEFTPADDING',(0,0),(-1,-1),8),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('ALIGN',(0,0),(0,-1),'CENTER')]))
    s.append(qc); s.append(Spacer(1,4))

    s.append(sub_hdr('4 — Stockage des déchets spéciaux dangereux'))
    stq=Table([[
        Paragraph('STOCKAGE TEMPORAIRE',HD),
        Paragraph(f'{data.get("stockage_temporaire_qte","0")} t/an',
            ps('sq',fontName='Helvetica-Bold',fontSize=13,textColor=DBLUE,alignment=TA_CENTER)),
        Paragraph('STOCKAGE PERMANENT',HD),
        Paragraph(f'{data.get("stockage_permanent_qte","0")} t/an',
            ps('sq2',fontName='Helvetica-Bold',fontSize=13,textColor=GRAY,alignment=TA_CENTER)),
    ]],colWidths=[COL/4]*4)
    stq.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.7,DBLUE),('INNERGRID',(0,0),(-1,-1),0.3,GRAY),
        ('BACKGROUND',(0,0),(1,-1),DBLUE),('BACKGROUND',(2,0),(-1,-1),LGRAY),
        ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LEFTPADDING',(0,0),(-1,-1),6)]))
    s.append(stq)
    s.append(box([fr('Modalités de stockage :',data.get('modalites_stockage',''),h=6)]))

    # PAGE 2
    s.append(PageBreak())
    nh2=Table([[Paragraph('DÉCLARATION DES DÉCHETS SPÉCIAUX DANGEREUX — SUITE (Page 2/2)',T2)]],colWidths=[COL])
    nh2.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),3,DBLUE),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    s.append(nh2); s.append(Spacer(1,5))

    s.append(sec_hdr('B — MODES DE TRAITEMENT'))
    s.append(box([dr('Modalités de gestion :',data.get('modalites_gestion',''),
                     'Modalités de contrôle :',data.get('modalites_controle','')),
        fr("Modalités d'élimination :",data.get('modalites_elimination',''),h=6),
        fr("Types d'installation de traitement :",data.get('types_installation',''),h=6),
        fr('Types de traitement :',data.get('types_traitement',''),h=6),
        dr('Quantités traitées :',f'{data.get("quantites_traitees","...")} t/an',
           'Rendement :',data.get('rendement_traitement',''))]))
    s.append(Spacer(1,5))

    s.append(sec_hdr('C — MESURES PRISES ET À PRÉVOIR POUR ÉVITER LA PRODUCTION DES DÉCHETS SPÉCIAUX DANGEREUX'))
    s.append(Spacer(1,3))

    tq=Table([[
        Table([[Paragraph('RÉUTILISATION',HD)],[Paragraph(f'{data.get("reutilisation_qte","0")} t/an',ps('q1',fontName='Helvetica-Bold',fontSize=15,textColor=GRAY,alignment=TA_CENTER))]],colWidths=[COL/4]),
        Table([[Paragraph('RECYCLAGE',HD)],[Paragraph(f'{data.get("recyclage_qte","0")} t/an',ps('q2',fontName='Helvetica-Bold',fontSize=15,textColor=WHITE,alignment=TA_CENTER))]],colWidths=[COL/4]),
        Table([[Paragraph('VALORISATION',HD)],[Paragraph(f'{data.get("valorisation_qte","0")} t/an',ps('q3',fontName='Helvetica-Bold',fontSize=15,textColor=WHITE,alignment=TA_CENTER))]],colWidths=[COL/4]),
        Table([[Paragraph('ÉLIMINATION',HD)],[Paragraph(f'{data.get("elimination_qte","0")} t/an',ps('q4',fontName='Helvetica-Bold',fontSize=15,textColor=RED,alignment=TA_CENTER))]],colWidths=[COL/4]),
    ]],colWidths=[COL/4]*4)
    tq.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.7,DBLUE),('INNERGRID',(0,0),(-1,-1),0.4,GRAY),
        ('BACKGROUND',(0,0),(-1,-1),DBLUE),('TOPPADDING',(0,0),(-1,-1),7),
        ('BOTTOMPADDING',(0,0),(-1,-1),7),('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
    s.append(tq); s.append(Spacer(1,5))

    mesures=[
        ('1 — Techniques de minimisation',data.get('mesures_min_prises',''),data.get('mesures_min_envisager','')),
        ('2 — Bonnes pratiques environnementales',data.get('mesures_bpe_prises',''),data.get('mesures_bpe_envisager','')),
        ('3 — Techniques disponibles',data.get('mesures_tech_prises',''),data.get('mesures_tech_envisager','')),
        ('4 — Techniques de production plus propres',data.get('mesures_pp_prises',''),data.get('mesures_pp_envisager','')),
        ('5 — Gestion préventive et maîtrise des risques',data.get('mesures_risques_prises',''),data.get('mesures_risques_envisager','')),
    ]
    hrow=[Paragraph('',HD),Paragraph('MESURES PRISES',HD),Paragraph('MESURES À ENVISAGER',HD)]
    mrows=[hrow]+[[Paragraph(f'<b>{m[0]}</b>',LB),Paragraph(m[1],SM),Paragraph(m[2],SM)] for m in mesures]
    col_m=(COL-4.5*cm)/2
    mt=Table(mrows,colWidths=[4.5*cm,col_m,col_m],
             rowHeights=[0.7*cm,1.9*cm,1.9*cm,1.9*cm,1.9*cm,1.9*cm])
    mt.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.7,DBLUE),('INNERGRID',(0,0),(-1,-1),0.3,GRAY),
        ('BACKGROUND',(0,0),(-1,0),DBLUE),('BACKGROUND',(0,2),(-1,2),LGRAY),
        ('BACKGROUND',(0,4),(-1,4),LGRAY),('TOPPADDING',(0,0),(-1,-1),5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),('LEFTPADDING',(0,0),(-1,-1),6),
        ('VALIGN',(0,0),(-1,-1),'TOP')]))
    s.append(mt); s.append(Spacer(1,10))

    sig=Table([[
        Table([[Paragraph('Fait à :',LB),Paragraph('........................................',VL),
                Spacer(1,3),Paragraph('Date :',LB),
                Paragraph(f'<b>{data.get("date_transmission","")}</b>',VL)]],
               colWidths=[COL/2-1*cm]),
        Table([[Paragraph('Nom et qualité du signataire :',LB),
                Paragraph(f'<b>{data.get("responsable_dechets","")}</b>',VL),
                Spacer(1,3),Paragraph('Signature et cachet :',LB),
                Paragraph(' ',ps('sp',fontName='Helvetica',fontSize=25))]],
               colWidths=[COL/2-1*cm]),
    ]],colWidths=[COL/2,COL/2])
    sig.setStyle(TableStyle([('BOX',(0,0),(-1,-1),0.7,DBLUE),('LINEAFTER',(0,0),(0,-1),0.4,GRAY),
        ('BACKGROUND',(0,0),(-1,-1),LBLUE),('TOPPADDING',(0,0),(-1,-1),8),
        ('BOTTOMPADDING',(0,0),(-1,-1),8),('LEFTPADDING',(0,0),(-1,-1),12),
        ('VALIGN',(0,0),(-1,-1),'TOP')]))
    s.append(sig); s.append(Spacer(1,8))
    s.append(HRFlowable(width='100%',thickness=0.5,color=DBLUE))
    s.append(Paragraph(
        "Conformément au Décret exécutif n°05-315 du 10 septembre 2005 — "
        "Loi n°01-19 du 12 décembre 2001 — "
        "À transmettre dans un délai n'excédant pas 3 mois après la clôture de l'année considérée.",FT))

    doc.build(s)
    buffer.seek(0)
    return buffer.read()