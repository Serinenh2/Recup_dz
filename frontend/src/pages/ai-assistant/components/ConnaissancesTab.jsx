import { useState, useEffect } from 'react'
import { BookOpen, Search, X, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import { aiConnaissancesAPI } from '../api'
import toast from 'react-hot-toast'

export default function ConnaissancesTab() {
  const [connaissances, setConnaissances] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [expanded, setExpanded] = useState({})

  const loadConnaissances = async () => {
    setLoading(true)
    try {
      const res = await aiConnaissancesAPI.getAll()
      setConnaissances(res.data || [])
    } catch {
      toast.error('Erreur chargement de la base de connaissances')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnaissances()
    aiConnaissancesAPI.categories().then(r => setCategories(r.data || [])).catch(() => {})
  }, [])

  const filtered = connaissances.filter(c => {
    const matchSearch = !search || (
      (c.titre || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.contenu || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.reference || '').toLowerCase().includes(search.toLowerCase())
    )
    const matchCategory = !categoryFilter || c.categorie === categoryFilter
    return matchSearch && matchCategory
  })

  const toggleExpanded = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <BookOpen size={16} className="text-primary-500" />
          Base de connaissances
        </div>
        <button onClick={loadConnaissances} disabled={loading} className="btn-secondary btn-sm flex items-center gap-1">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans la base..."
            className="input pl-9 text-sm w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={13} />
            </button>
          )}
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="input w-48 text-sm"
        >
          <option value="">Toutes catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="flex gap-2 text-xs">
        <span className="badge badge-blue">{filtered.length} entrée(s)</span>
        {categoryFilter && <span className="badge badge-green">{categoryFilter}</span>}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={36} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-500">Aucune connaissance trouvée</p>
          <p className="text-sm text-slate-400 mt-1">La base est vide ou les filtres sont trop restrictifs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{item.titre}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                      ${item.categorie === 'Agréments' ? 'bg-blue-50 text-blue-700' :
                        item.categorie === 'Déchets' ? 'bg-red-50 text-red-700' :
                        item.categorie === 'Stockage' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-600'}`}>
                      {item.categorie}
                    </span>
                  </div>
                  {item.reference && (
                    <p className="text-xs font-mono text-primary-600 mb-2">Réf: {item.reference}</p>
                  )}
                  <p className={`text-xs text-slate-500 ${expanded[item.id] ? '' : 'line-clamp-2'}`}>
                    {item.contenu}
                  </p>
                  {item.contenu?.length > 150 && (
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="text-xs text-primary-600 hover:underline mt-1 flex items-center gap-1"
                    >
                      {expanded[item.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {expanded[item.id] ? 'Réduire' : 'Voir plus'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}