// ════════════════════════════════════════════════════════════════════════════
// Hiérarchie de spécialisation des récupérateurs
// 3 grandes catégories → sous-catégories → sous-sous-catégories (détails)
// Chaque sous-sous-catégorie référence les familles/classes de la nomenclature
// ════════════════════════════════════════════════════════════════════════════

export const SPECIALISATIONS = [
  {
    id: 'menager',
    nom: 'Déchets ménagers et assimilés',
    icone: '🏠',
    couleur: 'emerald',
    classes: ['MA'], // correspond à classe MA dans NOMENCLATURE
    sousCategories: [
      {
        id: 'menager_organique',
        nom: 'Déchets organiques',
        details: [
          { id: 'organique_alimentaire', nom: 'Déchets alimentaires / putrescibles', familles: ['2'] },
          { id: 'organique_vegetal',     nom: 'Déchets végétaux / verts',            familles: ['2','3'] },
        ],
      },
      {
        id: 'menager_emballage',
        nom: "Déchets d'emballage",
        details: [
          { id: 'emb_plastique_pet',  nom: 'Plastique — PET (bouteilles, bocaux)',        familles: ['7'] },
          { id: 'emb_plastique_pehd', nom: 'Plastique — PEHD (flacons, bidons)',           familles: ['7'] },
          { id: 'emb_plastique_pp',   nom: 'Plastique — PP (polypropylène)',               familles: ['7'] },
          { id: 'emb_plastique_film', nom: 'Plastique — Films et sacs',                    familles: ['7'] },
          { id: 'emb_papier_carton',  nom: 'Papier et carton',                             familles: ['3'] },
          { id: 'emb_verre',          nom: 'Verre (bouteilles, bocaux)',                   familles: ['10'] },
          { id: 'emb_metal_alu',      nom: 'Métaux — Aluminium (cannettes)',                familles: ['12'] },
          { id: 'emb_metal_acier',    nom: 'Métaux — Acier / Fer blanc',                    familles: ['12'] },
        ],
      },
      {
        id: 'menager_textile',
        nom: 'Textiles et cuirs',
        details: [
          { id: 'textile_vetements', nom: 'Vêtements et textiles usagés', familles: ['4'] },
          { id: 'textile_cuir',      nom: 'Cuir et fourrure',             familles: ['4'] },
        ],
      },
      {
        id: 'menager_encombrants',
        nom: 'Encombrants ménagers',
        details: [
          { id: 'encombrant_mobilier', nom: 'Mobilier et ameublement', familles: ['16'] },
          { id: 'encombrant_divers',   nom: 'Encombrants divers',      familles: ['16','20'] },
        ],
      },
    ],
  },
  {
    id: 'inertes',
    nom: 'Déchets inertes',
    icone: '🧱',
    couleur: 'amber',
    classes: ['I'],
    sousCategories: [
      {
        id: 'inerte_construction',
        nom: 'Déchets de construction et démolition',
        details: [
          { id: 'inerte_beton',      nom: 'Béton et déchets de béton',          familles: ['10'] },
          { id: 'inerte_brique',     nom: 'Briques, tuiles et céramiques',      familles: ['10'] },
          { id: 'inerte_gravats',    nom: 'Gravats et débris de pierres',       familles: ['1'] },
          { id: 'inerte_sable',      nom: "Sable, terre et argile d'excavation", familles: ['1'] },
          { id: 'inerte_demolition', nom: 'Déchets mélangés de démolition',     familles: ['17'] },
        ],
      },
      {
        id: 'inerte_minier',
        nom: 'Déchets miniers et de forage',
        details: [
          { id: 'inerte_forage', nom: "Boues et déchets de forage (eau douce)", familles: ['1'] },
          { id: 'inerte_pierre', nom: 'Taille et sciage des pierres',           familles: ['1'] },
        ],
      },
    ],
  },
  {
    id: 'speciaux',
    nom: 'Déchets spéciaux et spéciaux dangereux',
    icone: '⚠️',
    couleur: 'red',
    classes: ['S', 'SD'],
    sousCategories: [
      {
        id: 'speciaux_industriels',
        nom: 'Déchets industriels spéciaux',
        details: [
          { id: 'sp_chimique',     nom: 'Déchets chimiques (acides, bases)',        familles: ['6'] },
          { id: 'sp_solvants',     nom: 'Solvants organiques usagés',               familles: ['14'] },
          { id: 'sp_peinture',     nom: 'Peintures, vernis et résines',             familles: ['8'] },
          { id: 'sp_traitement',   nom: 'Déchets de traitement de surface',         familles: ['11'] },
        ],
      },
      {
        id: 'speciaux_hydrocarbures',
        nom: 'Hydrocarbures et dérivés pétroliers',
        details: [
          { id: 'sp_huiles',       nom: 'Huiles usagées',                            familles: ['13'] },
          { id: 'sp_boues_petro',  nom: 'Boues pétrolières et de raffinage',          familles: ['5'] },
          { id: 'sp_hydrocarbure', nom: 'Hydrocarbures accidentellement répandus',    familles: ['1','5'] },
        ],
      },
      {
        id: 'speciaux_medical',
        nom: 'Déchets médicaux et infectieux',
        details: [
          { id: 'sp_medical',      nom: 'Déchets de soins médicaux',                 familles: ['18'] },
          { id: 'sp_pharma',       nom: 'Produits pharmaceutiques périmés',          familles: ['18'] },
        ],
      },
      {
        id: 'speciaux_electronique',
        nom: 'Déchets électroniques et batteries',
        details: [
          { id: 'sp_deee',         nom: 'Déchets électriques et électroniques (DEEE)', familles: ['16'] },
          { id: 'sp_batteries',    nom: 'Batteries et piles usagées',                familles: ['16'] },
        ],
      },
      {
        id: 'speciaux_pneus',
        nom: 'Pneumatiques et caoutchouc',
        details: [
          { id: 'sp_pneus',        nom: "Pneumatiques hors d'usage",                 familles: ['16'] },
        ],
      },
    ],
  },
]

// Helper: get all detail IDs (flat list)
export const ALL_DETAIL_IDS = SPECIALISATIONS.flatMap(cat =>
  cat.sousCategories.flatMap(sc => sc.details.map(d => d.id))
)

// Helper: find which familles + classes correspond to a list of selected detail IDs
export function getFamillesFromSelection(selectedIds = []) {
  const familles = new Set()
  const classes  = new Set()
  SPECIALISATIONS.forEach(cat => {
    cat.sousCategories.forEach(sc => {
      sc.details.forEach(d => {
        if (selectedIds.includes(d.id)) {
          d.familles.forEach(f => familles.add(f))
          cat.classes.forEach(c => classes.add(c))
        }
      })
    })
  })
  return { familles: [...familles], classes: [...classes] }
}

// Helper: find parent category + subcategory of a detail id
export function findDetailContext(detailId) {
  for (const cat of SPECIALISATIONS) {
    for (const sc of cat.sousCategories) {
      const detail = sc.details.find(d => d.id === detailId)
      if (detail) return { categorie: cat, sousCategorie: sc, detail }
    }
  }
  return null
}