import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, XCircle, Eye, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { aiAlertesAPI } from '../api'
import toast from 'react-hot-toast'

export default function AlertesTab() {
  const [alertes, setAlertes] = useState([])
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')

  const loadAlertes = async () => {
    setLoading(true)
    try {
      const res = await aiAlertesAPI.getAll()
      setAlertes(res.data || [])
    } catch {
      toast.error('Erreur chargement des alertes')
    } finally {
      setLoading(false)
    }
  }

  const loadResume = async () => {
    try {
      const res = await aiAlertesAPI.resume()
      setResume(res.data)
    } catch {
      toast.error('Erreur chargement du résumé')
    }
  }

  useEffect(() => {
    loadAlertes()
    loadResume()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadAlertes(), loadResume()])
    setRefreshing(false)
  }

  const handleMarquerLue = async (id) => {
    try {
      await aiAlertesAPI.marquerLue(id)
      loadAlertes()
    } catch {
      toast.error('Erreur marquage lu')
    }
  }

  const handleGenerer = async () => {
    const prevLoading = loading
    setLoading(true)
    try {
      await aiAlertesAPI.generer()
      toast.success('Alertes générées')
      loadAlertes()
      loadResume()
    } catch {
      toast.error('Erreur génération alertes')
    } finally {
      setLoading(false)
    }
  }

  const filtered = alertes.filter(a => !typeFilter || a.type === typeFilter)

  const uniqueTypes = [...new Set(alertes.map(a => a.type))]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Bell size={16} className="text-primary-500" />
          Alertes intelligentes
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerer} disabled={loading} className="btn-secondary btn-sm flex items-center gap-1">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Générer
          </button>
          <button onClick={handleRefresh} disabled={refreshing} className="btn-secondary btn-sm flex items-center gap-1">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {resume && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center border-l-4 border-slate-300">
            <Bell size={20} className="mx-auto mb-2 text-slate-400" />
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{resume.total || 0}</p>
          </div>
          <div className="card p-4 text-center border-l-4 border-amber-400">
            <Eye size={20} className="mx-auto mb-2 text-amber-500" />
            <p className="text-xs text-slate-500">Non lues</p>
            <p className="text-xl font-bold text-amber-600">{resume.non_lues || 0}</p>
          </div>
          <div className="card p-4 text-center border-l-4 border-red-500">
            <AlertTriangle size={20} className="mx-auto mb-2 text-red-500" />
            <p className="text-xs text-slate-500">Critiques</p>
            <p className="text-xl font-bold text-red-600">{resume.critiques || 0}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="input w-48 text-sm"
        >
          <option value="">Tous les types</option>
          {uniqueTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Alertes list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-300" />
          <p className="font-bold text-slate-500">Aucune alerte active</p>
          <p className="text-sm text-slate-400 mt-1">Toutes les données sont conformes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <div key={alert.id} className={`card p-4 border-l-4 ${
              alert.gravite === 'CRITIQUE' ? 'border-red-500' :
              alert.gravite === 'WARNING' ? 'border-amber-400' :
              'border-blue-400'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                      ${alert.gravite === 'CRITIQUE' ? 'bg-red-600 text-white' :
                        alert.gravite === 'WARNING' ? 'bg-amber-500 text-white' :
                        'bg-blue-500 text-white'}`}>
                      {alert.gravite}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{alert.titre}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    {alert.date && (
                      <span className="text-slate-400">
                        <Clock size={11} className="inline mr-1" />
                        {alert.date}
                      </span>
                    )}
                    {alert.type && (
                      <span className="badge badge-blue">{alert.type}</span>
                    )}
                  </div>
                </div>
                {!alert.lue && (
                  <button
                    onClick={() => handleMarquerLue(alert.id)}
                    className="btn-secondary btn-sm text-xs"
                  >
                    Marquer lu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}