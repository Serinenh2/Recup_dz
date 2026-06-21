// ════════════════════════════════════════════════════════════════════════════
// Snippet à intégrer dans la page Nomenclature existante (index.jsx)
// Filtre les codes affichés selon la spécialisation du récupérateur connecté
// ════════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo } from 'react'
import api from '../../api'
import { useAuthStore } from '../../store'
import { NOMENCLATURE } from './nomenclatureData'
import { getFamillesFromSelection } from './specialisationData'

/**
 * Hook à utiliser dans NomenclaturePage (index.jsx)
 * Retourne la liste de codes filtrée selon la spécialisation du récupérateur,
 * ou la liste complète si l'utilisateur n'est pas RECUPERATEUR ou n'a pas de spécialisation.
 */
export function useNomenclatureFiltree() {
  const { user } = useAuthStore()
  const [specialisation, setSpecialisation] = useState([])
  const [loaded, setLoaded] = useState(false)

  const isRecuperateur = user?.role === 'RECUPERATEUR'

  useEffect(() => {
    if (isRecuperateur) {
      api.get('/accounts/mon-recuperateur/')
        .then(r => {
          if (r.data.specialisation) {
            setSpecialisation(r.data.specialisation.split(',').map(s => s.trim()).filter(Boolean))
          }
          setLoaded(true)
        })
        .catch(() => setLoaded(true))
    } else {
      setLoaded(true)
    }
  }, [isRecuperateur])

  const { familles, classes } = useMemo(() =>
    getFamillesFromSelection(specialisation)
  , [specialisation])

  const nomenclatureFiltree = useMemo(() => {
    // Si pas récupérateur, ou pas de spécialisation définie → liste complète
    if (!isRecuperateur || specialisation.length === 0) return NOMENCLATURE
    // Filtrer: garder les codes dont la famille ET la classe correspondent à la sélection
    return NOMENCLATURE.filter(n =>
      familles.includes(n.famille) && classes.includes(n.classe)
    )
  }, [isRecuperateur, specialisation, familles, classes])

  return {
    nomenclature: nomenclatureFiltree,
    isFiltered: isRecuperateur && specialisation.length > 0,
    specialisationCount: specialisation.length,
    loaded,
  }
}
