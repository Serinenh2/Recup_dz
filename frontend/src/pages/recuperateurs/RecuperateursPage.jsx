import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Edit, AlertTriangle, CheckCircle2, Clock, XCircle, MapPin, Phone, Award } from 'lucide-react'
import { recuperateursAPI } from '../../api'
import toast from 'react-hot-toast'

const TYPE_LABELS = { CAT1:'Cat.1 — Sans agrément', CAT2:'Cat.2 — Spéciaux', CAT3:'Cat.3 — SD', CAT4:'Cat.4 — Carte Pro' }
const TYPE_COLORS = { CAT1:'badge-green', CAT2:'badge-yellow', CAT3:'badge-orange', CAT4:'badge-blue' }
const STATUT_CFG  = {
  ACTIF:       { cls:'badge-green',  icon: CheckCircle2 },
  SUSPENDU:    { cls:'badge-red',    icon: XCircle      },
  EXPIRE:      { cls:'badge-red',    icon: XCircle      },
  EN_ATTENTE:  { cls:'badge-yellow', icon: Clock        },
  ARCHIVE:     { cls:'badge-gray',   icon: null         },
}

function Spinner() {
  return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
}

export default function RecuperateursPage() {
  const [recs,    setRecs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [type,    setType]    = useState('')
  const [statut,  setStatut]  = useState('')
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    const p = {}
    if (search) p.search = search
    if (type)   p.type_recuperateur = type
    if (statut) p.statut = statut
    recuperateursAPI.getAll(p)
      .then(r => setRecs(r.data.results || r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, type, statut])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Récupérateurs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{recs.length} récupérateur(s) enregistré(s)</p>
        </div>
        <Link to="/recuperateurs/new" className="btn-primary">
          <Plus size={16} /> Nouveau récupérateur
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nom, N° agrément, NIF, NIS..." className="input pl-9 text-sm" />
        </div>
        <select value={type} onChange={e => setType(e.target.value)} className="input w-48 text-sm">
          <option value="">Toutes catégories</option>
          {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={statut} onChange={e => setStatut(e.target.value)} className="input w-40 text-sm">
          <option value="">Tous statuts</option>
          {['ACTIF','SUSPENDU','EXPIRE','EN_ATTENTE','ARCHIVE'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? <Spinner /> : recs.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-slate-400 font-semibold">Aucun récupérateur trouvé</p>
          <Link to="/recuperateurs/new" className="btn-primary mt-4 inline-flex">
            <Plus size={15} /> Créer le premier
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {recs.map(r => {
            const stCfg = STATUT_CFG[r.statut] || STATUT_CFG.EN_ATTENTE
            const StIcon = stCfg.icon
            return (
              <div key={r.id} className="card p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/recuperateurs/${r.id}`)}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold text-sm">
                      {r.nom_raison_sociale.slice(0,2).toUpperCase()}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 dark:text-white">{r.nom_raison_sociale}</p>
                      {r.nom_commercial && <span className="text-xs text-slate-400">({r.nom_commercial})</span>}
                      <span className={`badge ${TYPE_COLORS[r.type_recuperateur] || 'badge-gray'}`}>
                        {TYPE_LABELS[r.type_recuperateur] || r.type_recuperateur}
                      </span>
                      <span className={`badge ${stCfg.cls}`}>
                        {StIcon && <StIcon size={10} className="mr-0.5" />}
                        {r.statut_display || r.statut}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-400">
                      <span className="font-mono text-primary-600">{r.numero_id}</span>
                      {r.wilaya && <span className="flex items-center gap-1"><MapPin size={10} /> W.{r.wilaya}{r.commune ? ` — ${r.commune}` : ''}</span>}
                      {r.telephone && <span className="flex items-center gap-1"><Phone size={10} /> {r.telephone}</span>}
                      {r.num_agrement && <span className="flex items-center gap-1 text-primary-600 font-medium"><Award size={10} /> {r.num_agrement}</span>}
                    </div>
                    {/* Expiry */}
                    {r.date_expiration && (
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        {r.agrement_valide
                          ? r.jours_restants <= 60
                            ? <span className="text-amber-600 font-semibold">⚠️ Expire dans {r.jours_restants} jours ({r.date_expiration})</span>
                            : <span className="text-emerald-600">✅ Valide jusqu'au {r.date_expiration}</span>
                          : <span className="text-red-600 font-semibold">🔴 Expiré le {r.date_expiration}</span>
                        }
                      </div>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <Link to={`/recuperateurs/${r.id}`} className="btn-secondary btn-sm"><Eye size={13} /></Link>
                    <Link to={`/recuperateurs/${r.id}/edit`} className="btn-secondary btn-sm"><Edit size={13} /></Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
