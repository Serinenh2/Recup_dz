import { useState, useEffect } from 'react'
import { Calendar, FileText, Plus, TrendingUp, BarChart3, X, RefreshCw } from 'lucide-react'
import { aiRecommandationsAPI, aiDashboardAPI } from '../api'
import toast from 'react-hot-toast'

export default function RapportsTab() {
  const [period, setPeriod] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [recommandations, setRecommandations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newTitre, setNewTitre] = useState('')
  const [newContenu, setNewContenu] = useState('')

  const loadRecommandations = async () => {
    try {
      const res = await aiRecommandationsAPI.actives()
      setRecommandations(res.data || [])
    } catch {
      toast.error('Erreur chargement des recommandations')
    }
  }

  useEffect(() => {
    loadRecommandations()
  }, [])

  const generateReport = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success(`Rapport ${period === 'monthly' ? 'mensuel' : period === 'quarterly' ? 'trimestriel' : 'annuel'} généré`)
    }, 1000)
  }

  const handleCreateRecommandation = async (e) => {
    e.preventDefault()
    if (!newTitre.trim()) return
    try {
      await aiRecommandationsAPI.create({ titre: newTitre, contenu: newContenu, priorite: 'medium' })
      toast.success('Recommandation créée')
      setShowForm(false)
      setNewTitre('')
      setNewContenu('')
      loadRecommandations()
    } catch {
      toast.error('Erreur création recommandation')
    }
  }

  const handleStatusChange = async (id, statut) => {
    try {
      await aiRecommandationsAPI.changerStatut(id, statut)
      loadRecommandations()
    } catch {
      toast.error('Erreur modification statut')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileText size={16} className="text-primary-500" />
          Génération de rapports
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm flex items-center gap-1">
          <Plus size={14} /> Nouvelle recommandation
        </button>
      </div>

      {/* Report generation form */}
      <div className="card p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-primary-600" />
          <span className="font-semibold text-slate-900 dark:text-white">Période du rapport</span>
        </div>
        <div className="flex gap-3">
          {[
            { value: 'monthly', label: 'Mensuel' },
            { value: 'quarterly', label: 'Trimestriel' },
            { value: 'annual', label: 'Annuel' },
          ].map(p => (
            <label key={p.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="period"
                value={p.value}
                checked={period === p.value}
                onChange={e => setPeriod(e.target.value)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{p.label}</span>
            </label>
          ))}
        </div>
        <button onClick={generateReport} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <BarChart3 size={16} />}
          Générer le rapport
        </button>
      </div>

      {/* Recommandations actives */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-600" />
            Recommandations actives
          </h3>
          <span className="badge badge-blue">{recommandations.length}</span>
        </div>
        {recommandations.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucune recommandation active</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommandations.map(rec => (
              <div key={rec.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{rec.titre}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rec.contenu}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${rec.priorite === 'high' ? 'bg-red-100 text-red-700' :
                          rec.priorite === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'}`}>
                        {rec.priorite === 'high' ? 'Haute' : rec.priorite === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(rec.date_creation).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <select
                    value={rec.statut}
                    onChange={e => handleStatusChange(rec.id, e.target.value)}
                    className="input text-xs py-1 w-32"
                  >
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINEE">Terminée</option>
                    <option value="ANNULEE">Annulée</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New recommandation modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155]">
              <h3 className="font-bold text-slate-900 dark:text-white">Nouvelle recommandation</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateRecommandation} className="p-6 space-y-4">
              <div>
                <label className="label">Titre</label>
                <input
                  type="text"
                  value={newTitre}
                  onChange={e => setNewTitre(e.target.value)}
                  className="input"
                  placeholder="Titre de la recommandation"
                  required
                />
              </div>
              <div>
                <label className="label">Contenu</label>
                <textarea
                  value={newContenu}
                  onChange={e => setNewContenu(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Détails de la recommandation"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Créer</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}