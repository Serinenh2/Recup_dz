import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Layers } from 'lucide-react'
import { SPECIALISATIONS } from '../nomenclature/specialisationData'

const COLOR_MAP = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500'   },
  red:     { bg: 'bg-red-50',     border: 'border-red-300',     text: 'text-red-700',     badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500'     },
}

/**
 * SpecialisationPicker
 * value: array of selected detail IDs (strings)
 * onChange: (newArray) => void
 */
export default function SpecialisationPicker({ value = [], onChange }) {
  const [openCats, setOpenCats] = useState(() => {
    // Auto-open categories that already have a selection
    const open = {}
    SPECIALISATIONS.forEach(cat => {
      const hasSelected = cat.sousCategories.some(sc =>
        sc.details.some(d => value.includes(d.id))
      )
      if (hasSelected) open[cat.id] = true
    })
    return open
  })

  const toggleCat = (catId) => setOpenCats(prev => ({ ...prev, [catId]: !prev[catId] }))

  const toggleDetail = (detailId) => {
    const next = value.includes(detailId)
      ? value.filter(id => id !== detailId)
      : [...value, detailId]
    onChange(next)
  }

  const toggleSubCategory = (sc) => {
    const allIds = sc.details.map(d => d.id)
    const allSelected = allIds.every(id => value.includes(id))
    if (allSelected) {
      onChange(value.filter(id => !allIds.includes(id)))
    } else {
      onChange([...new Set([...value, ...allIds])])
    }
  }

  const toggleCategory = (cat) => {
    const allIds = cat.sousCategories.flatMap(sc => sc.details.map(d => d.id))
    const allSelected = allIds.every(id => value.includes(id))
    if (allSelected) {
      onChange(value.filter(id => !allIds.includes(id)))
    } else {
      onChange([...new Set([...value, ...allIds])])
    }
  }

  const countSelected = (cat) => {
    const allIds = cat.sousCategories.flatMap(sc => sc.details.map(d => d.id))
    return allIds.filter(id => value.includes(id)).length
  }

  const totalCount = useMemo(() =>
    SPECIALISATIONS.reduce((sum, cat) => sum + cat.sousCategories.flatMap(sc => sc.details).length, 0)
  , [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          <strong>{value.length}</strong> sous-type(s) sélectionné(s) sur {totalCount}
        </p>
        {value.length > 0 && (
          <button type="button" onClick={() => onChange([])}
            className="text-[11px] text-red-500 font-semibold hover:underline">
            Tout désélectionner
          </button>
        )}
      </div>

      {SPECIALISATIONS.map(cat => {
        const c = COLOR_MAP[cat.couleur]
        const isOpen = !!openCats[cat.id]
        const selCount = countSelected(cat)
        const totalCat = cat.sousCategories.flatMap(sc => sc.details).length
        const allCatSelected = selCount === totalCat && totalCat > 0

        return (
          <div key={cat.id} className={`rounded-xl border-2 overflow-hidden ${selCount > 0 ? c.border : 'border-[#E2E8F0]'}`}>
            {/* Category header */}
            <div className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${selCount > 0 ? c.bg : 'bg-slate-50 dark:bg-slate-800/40'}`}
              onClick={() => toggleCat(cat.id)}>
              <span className="text-xl flex-shrink-0">{cat.icone}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${selCount > 0 ? c.text : 'text-slate-700 dark:text-slate-200'}`}>
                  {cat.nom}
                </p>
                <p className="text-[11px] text-slate-400">
                  {selCount} / {totalCat} sous-type(s) sélectionné(s)
                </p>
              </div>
              <button type="button"
                onClick={(e) => { e.stopPropagation(); toggleCategory(cat) }}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex-shrink-0
                  ${allCatSelected ? `${c.badge} border-transparent` : 'border-slate-300 text-slate-500 hover:bg-slate-100'}`}>
                {allCatSelected ? 'Tout retirer' : 'Tout cocher'}
              </button>
              {isOpen ? <ChevronDown size={16} className="text-slate-400 flex-shrink-0"/> : <ChevronRight size={16} className="text-slate-400 flex-shrink-0"/>}
            </div>

            {/* Sub-categories */}
            {isOpen && (
              <div className="bg-white dark:bg-[#1E293B] divide-y divide-[#F1F5F9] dark:divide-[#334155]">
                {cat.sousCategories.map(sc => {
                  const scIds = sc.details.map(d => d.id)
                  const scSelCount = scIds.filter(id => value.includes(id)).length
                  const scAllSelected = scSelCount === scIds.length

                  return (
                    <div key={sc.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <Layers size={11} className="text-slate-400"/>
                          {sc.nom}
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({scSelCount}/{scIds.length})
                          </span>
                        </p>
                        <button type="button" onClick={() => toggleSubCategory(sc)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all
                            ${scAllSelected ? `${c.badge}` : 'text-primary-600 hover:underline'}`}>
                          {scAllSelected ? '✓ Tout sélectionné' : 'Tout sélectionner'}
                        </button>
                      </div>

                      {/* Detail checkboxes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-4">
                        {sc.details.map(d => {
                          const checked = value.includes(d.id)
                          return (
                            <label key={d.id}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-all
                                ${checked ? `${c.bg} ${c.text} font-semibold` : 'hover:bg-slate-50 text-slate-600 dark:text-slate-300'}`}>
                              <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all
                                ${checked ? `${c.dot} border-transparent` : 'border-slate-300'}`}>
                                {checked && <CheckCircle2 size={10} className="text-white"/>}
                              </div>
                              <input type="checkbox" className="sr-only" checked={checked}
                                onChange={() => toggleDetail(d.id)}/>
                              <span className="truncate">{d.nom}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
