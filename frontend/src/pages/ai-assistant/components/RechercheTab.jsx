import { useState, useEffect } from 'react'
import { Search, FileSearch, BookOpen, RefreshCw } from 'lucide-react'
import { aiConnaissancesAPI } from '../api'
import toast from 'react-hot-toast'

export default function RechercheTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    aiConnaissancesAPI.categories().then(r => setCategories(r.data)).catch(() => {})
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    setLoading(true)
    try {
      const res = await aiConnaissancesAPI.rechercher(searchTerm)
      setResults(res.data.results || res.data || [])
    } catch {
      toast.error('Erreur lors de la recherche')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const groupedResults = results.reduce((acc, item) => {
    const cat = item.categorie || 'Autre'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher dans la réglementation (ex: agrément, déchets, stockage)..."
            className="input pl-9 text-sm w-full"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary px-4">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={16} />}
        </button>
      </form>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && results.length === 0 && searchTerm && (
        <div className="card p-12 text-center">
          <FileSearch size={36} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-500">Aucun résultat trouvé</p>
          <p className="text-sm text-slate-400 mt-1">Essayez avec d'autres termes de recherche</p>
        </div>
      )}

      {!loading && Object.keys(groupedResults).length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedResults).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-primary-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">{category}</h3>
                <span className="badge badge-blue">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="card p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{item.titre}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.contenu}</p>
                        {item.reference && (
                          <p className="text-xs font-mono text-primary-600 mt-2">Réf: {item.reference}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold
                        ${item.categorie === 'Agréments' ? 'bg-blue-50 text-blue-700' :
                          item.categorie === 'Déchets' ? 'bg-red-50 text-red-700' :
                          item.categorie === 'Stockage' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-600'}`}>
                        {item.categorie}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}