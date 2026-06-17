"""
Génération du PDF BSD — Bordereau Numérique de Suivi des Déchets
Conforme au Décret exécutif n°06-104 du 28 février 2006
PDF pleine page A4 — 2 pages
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                Table, TableStyle, HRFlowable, PageBreak)
from reportlab.platypus import Image as RLImage
from reportlab.lib.enums import TA_CENTER
import qrcode, tempfile, io


def generate_bsd_pdf(data: dict) -> bytes:
    buffer = io.BytesIO()

    W, H   = A4
    BLACK  = colors.black
    DBLUE  = colors.HexColor('#1a3a5c')
    LBLUE  = colors.HexColor('#dde8f0')
    GRAY   = colors.HexColor('#cccccc')
    LGRAY  = colors.HexColor('#f5f5f5')
    WHITE  = colors.white
    RED    = colors.HexColor('#cc2200')
    GREEN  = colors.HexColor('#1a6e3c')
    CYAN   = colors.HexColor('#4dd8f0')

    # Marges serrées pour remplir toute la page A4
    ML = 1.5*cm; MR = 1.5*cm; MT = 1.0*cm; MB = 1.0*cm
    COL = W - ML - MR

    def ps(n, **k): return ParagraphStyle(n, **k)

    T   = ps('T',  fontName='Helvetica-Bold', fontSize=12, alignment=TA_CENTER, textColor=WHITE,  leading=15)
    SH  = ps('SH', fontName='Helvetica-Bold', fontSize=9,  textColor=WHITE,  leading=12)
    LB  = ps('LB', fontName='Helvetica-Bold', fontSize=8,  textColor=DBLUE,  leading=11)
    VL  = ps('VL', fontName='Helvetica',      fontSize=8,  textColor=BLACK,  leading=11)
    SM  = ps('SM', fontName='Helvetica',       fontSize=7.5,textColor=BLACK,  leading=10)
    HD  = ps('HD', fontName='Helvetica-Bold', fontSize=8,  textColor=WHITE,  alignment=TA_CENTER, leading=11)
    BG  = ps('BG', fontName='Helvetica-Bold', fontSize=20, textColor=WHITE,  alignment=TA_CENTER)
    FT  = ps('FT', fontName='Helvetica',       fontSize=6.5,textColor=GRAY,   alignment=TA_CENTER, leading=9)

    def qr_img(text, sz=3.0*cm):
        q = qrcode.QRCode(version=1, box_size=5, border=2,
            error_correction=qrcode.constants.ERROR_CORRECT_M)
        q.add_data(text); q.make(fit=True)
        img = q.make_image(fill_color='black', back_color='white')
        tmp = tempfile.mktemp(suffix='.png'); img.save(tmp)
        return RLImage(tmp, width=sz, height=sz)

    def sec(num, txt):
        t = Table([[Paragraph(f'  {num}  |  {txt}', SH)]], colWidths=[COL])
        t.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,-1), DBLUE),
            ('TOPPADDING',    (0,0),(-1,-1), 7),
            ('BOTTOMPADDING', (0,0),(-1,-1), 7),
        ]))
        return t

    def fr(lb, val, h=5):
        t = Table([[Paragraph(lb, LB), Paragraph(val or '', VL)]],
                  colWidths=[5.5*cm, COL-5.5*cm])
        t.setStyle(TableStyle([
            ('LINEBELOW',     (0,0),(-1,-1), 0.3, GRAY),
            ('TOPPADDING',    (0,0),(-1,-1), h),
            ('BOTTOMPADDING', (0,0),(-1,-1), h),
            ('LEFTPADDING',   (0,0),(-1,-1), 8),
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ]))
        return t

    def dr(l1, v1, l2, v2):
        hw = COL / 2
        t = Table([[Paragraph(l1,LB), Paragraph(v1 or '',VL),
                    Paragraph(l2,LB), Paragraph(v2 or '',VL)]],
                  colWidths=[4*cm, hw-4*cm, 4*cm, hw-4*cm])
        t.setStyle(TableStyle([
            ('LINEBELOW',  (0,0),(-1,-1), 0.3, GRAY),
            ('LINEAFTER',  (1,0),(1,-1),  0.4, GRAY),
            ('TOPPADDING', (0,0),(-1,-1), 5),
            ('BOTTOMPADDING',(0,0),(-1,-1),5),
            ('LEFTPADDING',(0,0),(-1,-1), 8),
            ('VALIGN',     (0,0),(-1,-1), 'TOP'),
        ]))
        return t

    def box(rows):
        t = Table([[r] for r in rows], colWidths=[COL])
        t.setStyle(TableStyle([
            ('BOX',           (0,0),(-1,-1), 0.7, DBLUE),
            ('TOPPADDING',    (0,0),(-1,-1), 0),
            ('BOTTOMPADDING', (0,0),(-1,-1), 0),
            ('LEFTPADDING',   (0,0),(-1,-1), 0),
            ('RIGHTPADDING',  (0,0),(-1,-1), 0),
        ]))
        return t

    numero  = data.get('numero', 'BSD-XXXXXXXX')
    statut  = data.get('statut', 'EMIS')
    ST      = ['BROUILLON','EMIS','EN_TRANSIT','RECEPTIONNE','SIGNE','ARCHIVE']
    SL      = ['Brouillon','Émis','En Transit','Réceptionné','Signé','Archivé']
    cur     = ST.index(statut) if statut in ST else 1

    doc = SimpleDocTemplate(buffer, pagesize=A4,
        topMargin=MT, bottomMargin=MB,
        leftMargin=ML, rightMargin=MR)
    story = []

    # ════ PAGE 1 ══════════════════════════════════════════════════════════════

    # Header banner
    hdr = Table([[
        Table([[
            Paragraph('RECUP', ps('r1', fontName='Helvetica-Bold', fontSize=24, textColor=WHITE, leading=26)),
            Paragraph('DZ',    ps('r2', fontName='Helvetica-Bold', fontSize=24, textColor=CYAN,  leading=26)),
            Paragraph('Plateforme Nationale de Gestion des Déchets',
                ps('r3', fontName='Helvetica', fontSize=7, textColor=colors.HexColor('#aaccee'), leading=9)),
        ]], colWidths=[5*cm]),
        Table([[
            Paragraph('BORDEREAU NUMÉRIQUE DE SUIVI DES DÉCHETS',
                ps('bt', fontName='Helvetica-Bold', fontSize=13, textColor=WHITE, alignment=TA_CENTER, leading=16)),
            Paragraph('BSD — Conforme au Décret exécutif n°06-104 du 28 février 2006',
                ps('bs', fontName='Helvetica', fontSize=7.5, textColor=colors.HexColor('#aaccee'), alignment=TA_CENTER, leading=10)),
        ]], colWidths=[9*cm]),
        qr_img(f"BSD:{numero}", 3.2*cm),
    ]], colWidths=[5*cm, 9*cm, COL-14*cm])
    hdr.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), DBLUE),
        ('TOPPADDING',    (0,0),(-1,-1), 12),
        ('BOTTOMPADDING', (0,0),(-1,-1), 12),
        ('LEFTPADDING',   (0,0),(-1,-1), 12),
        ('RIGHTPADDING',  (0,0),(-1,-1), 8),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ('ALIGN',         (2,0),(2,0),   'CENTER'),
    ]))
    story.append(hdr)

    # Status pipeline
    sc = [Paragraph(
        f'{"✓ " if i<cur else "▶ " if i==cur else ""}{l}',
        ps(f'sc{i}', fontName='Helvetica-Bold' if i==cur else 'Helvetica',
           fontSize=7.5, textColor=WHITE, alignment=TA_CENTER))
        for i,(st_,l) in enumerate(zip(ST,SL))]
    sb = Table([sc], colWidths=[COL/6]*6)
    sb.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), colors.HexColor('#2a4a6c')),
        ('BACKGROUND',    (cur,0),(cur,0), GREEN),
        ('TOPPADDING',    (0,0),(-1,-1), 6),
        ('BOTTOMPADDING', (0,0),(-1,-1), 6),
        ('INNERGRID',     (0,0),(-1,-1), 0.3, colors.HexColor('#3a6a8c')),
        ('LINEBELOW',     (0,0),(-1,-1), 3, GREEN),
    ]))
    story.append(sb)

    # Meta bar
    meta = Table([[
        Paragraph(f'N° BSD : <b>{numero}</b>', VL),
        Paragraph(f'Date de création : <b>{data.get("date_emission","")}</b>', VL),
        Paragraph(f'Statut : <b>{SL[cur]}</b>', VL),
    ]], colWidths=[COL/3]*3)
    meta.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), LBLUE),
        ('BOX',           (0,0),(-1,-1), 0.5, DBLUE),
        ('INNERGRID',     (0,0),(-1,-1), 0.3, GRAY),
        ('TOPPADDING',    (0,0),(-1,-1), 5),
        ('BOTTOMPADDING', (0,0),(-1,-1), 5),
        ('LEFTPADDING',   (0,0),(-1,-1), 10),
    ]))
    story.append(meta)
    story.append(Spacer(1, 5))

    # Section 1 — Générateur
    story.append(sec('1', 'GÉNÉRATEUR DES DÉCHETS'))
    story.append(box([
        fr('Raison sociale :',   data.get('generateur_nom',''), h=6),
        dr('NIF :',data.get('generateur_nif',''), 'NIS :',data.get('generateur_nis','')),
        fr('Adresse :',          data.get('generateur_adresse',''), h=6),
        fr('Responsable :',      data.get('generateur_responsable',''), h=6),
    ]))
    story.append(Spacer(1, 5))

    # Section 2 — Déchet
    story.append(sec('2', 'IDENTIFICATION DU DÉCHET'))
    classe  = data.get('classe', '')
    cl_col  = RED if classe=='SD' else colors.HexColor('#b45309')
    badge_t = Table([[Paragraph(f'CLASSE {classe}',
        ps('cl', fontName='Helvetica-Bold', fontSize=11, textColor=cl_col, alignment=TA_CENTER))]],
        colWidths=[3.5*cm])
    badge_t.setStyle(TableStyle([
        ('BOX',           (0,0),(-1,-1), 2, cl_col),
        ('BACKGROUND',    (0,0),(-1,-1), colors.HexColor('#fff0f0') if classe=='SD' else colors.HexColor('#fffbea')),
        ('TOPPADDING',    (0,0),(-1,-1), 6),
        ('BOTTOMPADDING', (0,0),(-1,-1), 6),
    ]))
    code_row = Table([[
        Paragraph('Code déchet :', LB),
        Paragraph(data.get('code_dechet',''), VL),
        badge_t,
    ]], colWidths=[3.5*cm, COL-7*cm-0.5*cm, 3.5*cm])
    code_row.setStyle(TableStyle([
        ('LINEBELOW',     (0,0),(-1,-1), 0.3, GRAY),
        ('TOPPADDING',    (0,0),(-1,-1), 6),
        ('BOTTOMPADDING', (0,0),(-1,-1), 6),
        ('LEFTPADDING',   (0,0),(-1,-1), 8),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
    ]))
    story.append(box([
        code_row,
        fr('Désignation :',  data.get('designation',''), h=6),
        fr('Dangerosité :',  data.get('dangerosite',''), h=6),
    ]))
    story.append(Spacer(1, 5))

    # Section 3 — Quantité
    story.append(sec('3', 'QUANTITÉ ET CONDITIONNEMENT'))
    qty = Table([[
        Table([[
            Paragraph('QUANTITÉ', HD),
            Paragraph(str(data.get('quantite','')), BG),
            Paragraph(data.get('unite',''),
                ps('un', fontName='Helvetica-Bold', fontSize=12, textColor=WHITE, alignment=TA_CENTER)),
        ]], colWidths=[5.5*cm]),
        fr('Emballage / Conditionnement :', data.get('emballage',''), h=10),
    ]], colWidths=[5.5*cm, COL-5.5*cm])
    qty.setStyle(TableStyle([
        ('BOX',           (0,0),(-1,-1), 0.7, DBLUE),
        ('LINEAFTER',     (0,0),(0,-1),  0.5, GRAY),
        ('BACKGROUND',    (0,0),(0,-1),  DBLUE),
        ('TOPPADDING',    (0,0),(-1,-1), 10),
        ('BOTTOMPADDING', (0,0),(-1,-1), 10),
        ('LEFTPADDING',   (0,0),(-1,-1), 8),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ('ALIGN',         (0,0),(0,-1),  'CENTER'),
    ]))
    story.append(qty)
    story.append(Spacer(1, 5))

    # Section 4 — Transporteur
    story.append(sec('4', 'TRANSPORTEUR — RECUP DZ'))
    story.append(box([
        fr('Société :',                  data.get('transporteur_nom',''),      h=6),
        fr('Agrément :',                 data.get('transporteur_agrement',''), h=6),
        fr('Véhicule :',                 data.get('transporteur_vehicule',''), h=6),
        fr('Date de prise en charge :',  data.get('date_prise_charge',''),     h=6),
    ]))
    story.append(Spacer(1, 5))

    # Section 5 — Destination
    story.append(sec('5', 'DESTINATION FINALE'))
    story.append(box([
        fr('Installation :',      data.get('destination_nom',''),  h=6),
        fr('Type de traitement :', data.get('type_traitement',''), h=6),
        fr('Date de réception :', data.get('date_reception',''),   h=6),
    ]))

    # ════ PAGE 2 ══════════════════════════════════════════════════════════════
    story.append(PageBreak())

    h2 = Table([[Paragraph(
        'BORDEREAU NUMÉRIQUE DE SUIVI DES DÉCHETS — SECTION 6 : VALIDATION ÉLECTRONIQUE', T)]],
        colWidths=[COL])
    h2.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), DBLUE),
        ('TOPPADDING',    (0,0),(-1,-1), 12),
        ('BOTTOMPADDING', (0,0),(-1,-1), 12),
    ]))
    story.append(h2)
    story.append(Spacer(1, 8))

    rc = Table([[
        Paragraph(f'BSD : <b>{numero}</b>', VL),
        Paragraph(f'Code : <b>{data.get("code_dechet","")}</b>', VL),
        Paragraph(f'Classe : <b>{classe}</b>', VL),
        Paragraph(f'Quantité : <b>{data.get("quantite","")} {data.get("unite","")}</b>', VL),
    ]], colWidths=[COL/4]*4)
    rc.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), LBLUE),
        ('BOX',           (0,0),(-1,-1), 0.7, DBLUE),
        ('INNERGRID',     (0,0),(-1,-1), 0.3, GRAY),
        ('TOPPADDING',    (0,0),(-1,-1), 6),
        ('BOTTOMPADDING', (0,0),(-1,-1), 6),
        ('LEFTPADDING',   (0,0),(-1,-1), 10),
    ]))
    story.append(rc)
    story.append(Spacer(1, 14))

    def sig_block(num, title, nom, dlbl, dval, col):
        head = Table([[
            Paragraph(str(num), ps('x', fontName='Helvetica-Bold', fontSize=26,
                textColor=WHITE, alignment=TA_CENTER)),
            Paragraph(f'<b>{title}</b><br/><font size="9" color="#cce0f0">{nom}</font>',
                ps('y', fontName='Helvetica-Bold', fontSize=12, textColor=WHITE, leading=15)),
        ]], colWidths=[3*cm, COL-3*cm])
        head.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,-1), col),
            ('TOPPADDING',    (0,0),(-1,-1), 10),
            ('BOTTOMPADDING', (0,0),(-1,-1), 10),
            ('LEFTPADDING',   (0,0),(-1,-1), 10),
            ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ]))
        body = Table([[
            Table([[
                Paragraph('Nom et qualité :', LB),
                Paragraph(nom, VL),
                Spacer(1, 4),
                Paragraph(f'{dlbl} :', LB),
                Paragraph(f'<b>{dval}</b>', VL),
            ]], colWidths=[8*cm]),
            Table([[
                Paragraph('Signature et cachet :', LB),
                Spacer(1, 45),
                HRFlowable(width=7.5*cm, thickness=0.5, color=GRAY),
                Paragraph('Signature originale ou électronique', SM),
            ]], colWidths=[COL-8*cm]),
        ]], colWidths=[8*cm, COL-8*cm])
        body.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,-1), LGRAY),
            ('LINEAFTER',     (0,0),(0,-1),  0.3, GRAY),
            ('TOPPADDING',    (0,0),(-1,-1), 10),
            ('BOTTOMPADDING', (0,0),(-1,-1), 10),
            ('LEFTPADDING',   (0,0),(-1,-1), 12),
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ]))
        wrap = Table([[head],[body]], colWidths=[COL])
        wrap.setStyle(TableStyle([
            ('BOX',           (0,0),(-1,-1), 1.2, col),
            ('TOPPADDING',    (0,0),(-1,-1), 0),
            ('BOTTOMPADDING', (0,0),(-1,-1), 0),
            ('LEFTPADDING',   (0,0),(-1,-1), 0),
            ('RIGHTPADDING',  (0,0),(-1,-1), 0),
        ]))
        return wrap

    story.append(sig_block(1, 'GÉNÉRATEUR DES DÉCHETS',
        data.get('generateur_nom',''), 'Date de remise', data.get('date_emission',''), DBLUE))
    story.append(Spacer(1, 12))
    story.append(sig_block(2, 'TRANSPORTEUR — RECUP DZ',
        data.get('transporteur_nom',''), 'Date de prise en charge', data.get('date_prise_charge',''), GREEN))
    story.append(Spacer(1, 12))
    story.append(sig_block(3, 'DESTINATAIRE / RÉCEPTEUR',
        data.get('destination_nom',''), 'Date de réception', data.get('date_reception',''),
        colors.HexColor('#5c1a1a')))
    story.append(Spacer(1, 14))

    final = Table([[
        qr_img(f"BSD:{numero}|{data.get('code_dechet','')}|{data.get('quantite','')}{data.get('unite','')}", 3.2*cm),
        Table([[
            Paragraph('DOCUMENT OFFICIEL — RECUP-DZ',
                ps('of', fontName='Helvetica-Bold', fontSize=10, textColor=DBLUE)),
            Spacer(1, 3),
            Paragraph(f'N° BSD : {numero}  |  Code : {data.get("code_dechet","")}  |  Classe : {classe}', SM),
            Paragraph(f'Quantité : {data.get("quantite","")} {data.get("unite","")}  |  Générateur : {data.get("generateur_nom","")}', SM),
            Paragraph(f'Transporteur : {data.get("transporteur_nom","")}', SM),
            Paragraph(f'Destination : {data.get("destination_nom","")}', SM),
        ]], colWidths=[COL-3.2*cm-0.5*cm]),
    ]], colWidths=[3.2*cm, COL-3.2*cm-0.5*cm])
    final.setStyle(TableStyle([
        ('BOX',           (0,0),(-1,-1), 0.7, DBLUE),
        ('BACKGROUND',    (0,0),(-1,-1), LBLUE),
        ('TOPPADDING',    (0,0),(-1,-1), 10),
        ('BOTTOMPADDING', (0,0),(-1,-1), 10),
        ('LEFTPADDING',   (0,0),(-1,-1), 10),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
    ]))
    story.append(final)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width='100%', thickness=0.5, color=DBLUE))
    story.append(Paragraph(
        'RECUP-DZ — BSD conforme au Décret exécutif n°06-104 du 28 février 2006 — '
        'Loi n°01-19 du 12 décembre 2001 relative à la gestion, au contrôle et à l\'élimination des déchets.',
        FT))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()