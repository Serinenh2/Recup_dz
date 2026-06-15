import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Award, Plus, Search, X, Save, AlertTriangle,
  CheckCircle2, Clock, XCircle, ChevronDown, ChevronRight,
  Shield, Ban, FileText, MapPin, Edit
} from 'lucide-react'
import api from '../../api'
import { useAuthStore } from '../../store'
import { WILAYAS } from '../../utils/algeria_geo'
import { NOMENCLATURE } from '../nomenclature/nomenclatureData'
import DateInput from '../../components/common/DateInput'
import toast from 'react-hot-toast'

// ── API ───────────────────────────────────────────────────────────────────────
const agrAPI = {
  getAll:  (p)    => api.get('/recuperateurs/agrements/', { params: p }),
  get:     (id)   => api.get(`/recuperateurs/agrements/${id}/`),
  create:  (d)    => api.post('/recuperateurs/agrements/', d),
  update:  (id,d) => api.patch(`/recuperateurs/agrements/${id}/`, d),
  delete:  (id)   => api.delete(`/recuperateurs/agrements/${id}/`),
  alerts:  ()     => api.get('/recuperateurs/agrements/alerts/'),
  stats:   ()     => api.get('/recuperateurs/agrements/stats/'),
}
const recupAPI = {
  getAll: () => api.get('/recuperateurs/?page_size=200'),
}

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPE_CFG = {
  AVEC_AGREMENT: { label: 'Avec agrément',             badge: 'badge-blue',   icon: Shield     },
  SANS_AGREMENT: { label: 'Sans agrément',              badge: 'badge-green',  icon: CheckCircle2},
  AUTRE:         { label: 'Autre',                      badge: 'badge-gray',   icon: FileText   },
}
const STATUT_CFG = {
  ACTIF:    { label: 'Actif',    badge: 'badge-green',  icon: CheckCircle2 },
  EXPIRE:   { label: 'Expiré',   badge: 'badge-red',    icon: XCircle      },
  SUSPENDU: { label: 'Suspendu', badge: 'badge-yellow', icon: Ban          },
  REVOQUE:  { label: 'Révoqué',  badge: 'badge-red',    icon: XCircle      },
}
const ETENDUE_CFG = {
  NATIONALE: { label: 'Nationale',    icon: '🇩🇿' },
  WILAYA:    { label: 'Par wilaya',   icon: '📍'  },
  WILAYAS:   { label: 'Multi-wilayas',icon: '🗺️'  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Modal({ open, onClose, title, children, size = 'max-w-2xl' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full ${size} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] sticky top-0 bg-white dark:bg-[#1E293B] z-10">
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Code Déchets Picker ───────────────────────────────────────────────────────
function CodesPicker({ value, onChange }) {
  const [search, setSearch]     = useState('')
  const [open,   setOpen]       = useState(false)
  const selected = value ? value.split(',').map(s => s.trim()).filter(Boolean) : []

  const filtered = NOMENCLATURE.filter(n =>
    n.code.includes(search) ||
    n.nom_fr.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50)

  const toggle = (code) => {
    const next = selected.includes(code)
      ? selected.filter(c => c !== code)
      : [...selected, code]
    onChange(next.join(', '))
  }

  return (
    <div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(c => {
            const nom = NOMENCLATURE.find(n => n.code === c)
            return (
              <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold
                bg-primary-50 text-primary-700 border border-primary-200">
                <span className="font-mono font-bold">{c}</span>
                {nom && <span className="text-primary-500 max-w-[120px] truncate">— {nom.nom_fr.slice(0,30)}</span>}
                <button type="button" onClick={() => toggle(c)}
                  className="ml-1 text-primary-400 hover:text-red-500">
                  <X size={10} />
                </button>
              </span>
            )
          })}
        </div>
      )}

      <button type="button" onClick={() => setOpen(!open)}
        className="btn-secondary btn-sm w-full justify-between">
        <span className="flex items-center gap-2">
          <Plus size={13} /> Sélectionner des codes déchets
        </span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>

      {open && (
        <div className="mt-2 border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="p-2 border-b border-[#E2E8F0]">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher code ou désignation..." className="input text-xs" autoFocus />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map(n => {
              const checked = selected.includes(n.code)
              return (
                <button key={n.code} type="button"
                  onClick={() => toggle(n.code)}
                  className={`w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-slate-50 text-xs
                    ${checked ? 'bg-primary-50' : ''}`}>
                  <div className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center
                    ${checked ? 'bg-primary-600 border-primary-600' : 'border-slate-300'}`}>
                    {checked && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono font-bold text-primary-700">{n.code}</span>
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold
                      ${n.classe === 'SD' ? 'bg-red-100 text-red-700' :
                        n.classe === 'S'  ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'}`}>
                      {n.classe}
                    </span>
                    <p className="text-slate-500 mt-0.5 truncate">{n.nom_fr}</p>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && <p className="text-center py-4 text-slate-400 text-xs">Aucun résultat</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Agrement Form ─────────────────────────────────────────────────────────────
function AgrementForm({ agrement, currentUser, onSave, onClose }) {
  const isEdit = !!agrement?.id
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: agrement || {
      type_agrement: 'AVEC_AGREMENT', etendue_geo: 'WILAYA', statut: 'ACTIF',
      recuperateur: currentUser?.recuperateur_id || '',
    }
  })
  const [saving,       setSaving]       = useState(false)
  const [codesValue,   setCodesValue]   = useState(agrement?.codes_dechets || '')
  const [wilayasValue, setWilayasValue] = useState(agrement?.wilayas_couvertes || '')

  const typeAgrement = watch('type_agrement')
  const etendueGeo   = watch('etendue_geo')
  const duree        = watch('duree_validite_ans')
  const dateDebut    = watch('date_debut')

  // Auto-calculate date_fin
  useEffect(() => {
    if (dateDebut && duree) {
      const d = new Date(dateDebut)
      d.setFullYear(d.getFullYear() + parseInt(duree))
      setValue('date_fin', d.toISOString().split('T')[0])
    }
  }, [dateDebut, duree])

  const onSubmit = async (data) => {
    data.recuperateur = currentUser?.recuperateur_id
    setSaving(true)
    data.codes_dechets     = codesValue
    data.wilayas_couvertes = wilayasValue
    try {
      if (isEdit) {
        await agrAPI.update(agrement.id, data)
        toast.success('Agrément mis à jour')
      } else {
        await agrAPI.create(data)
        toast.success('Agrément créé')
      }
      onSave()
    } catch (e) {
      const msg = e?.response?.data
      console.error('Agrement save error:', msg || e)
      const detail = msg && typeof msg === 'object'
        ? Object.entries(msg).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join(' | ')
        : (msg || e.message)
      toast.error(`Erreur: ${detail || 'sauvegarde impossible'}`)
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, required, error, children, col }) => (
    <div className={col}>
      <label className="label">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error.message || 'Requis'}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Type d'agrément */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Type d'agrément" required error={errors.type_agrement} col="">
          <select {...register('type_agrement', { required: true })} className="input">
            <option value="AVEC_AGREMENT">Avec agrément</option>
            <option value="SANS_AGREMENT">Sans agrément</option>
            <option value="AUTRE">Autre</option>
          </select>
        </Field>
      </div>

      {/* Fields shown only for AVEC_AGREMENT */}
      {typeAgrement === 'AVEC_AGREMENT' && (
        <>
          {/* Numéro + Autorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Numéro d'agrément" required error={errors.numero_agrement} col="">
              <input {...register('numero_agrement', { required: typeAgrement === 'AVEC_AGREMENT' })}
                className="input" placeholder="AGR-16-REC-2024-001" />
            </Field>
            <Field label="Autorité de délivrance" col="">
              <input {...register('autorite_delivrance')} className="input"
                placeholder="Direction de l'Environnement, Ministère..." />
            </Field>
          </div>

          {/* Dates */}
          <div className="card p-4 space-y-3 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Validité</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Date de délivrance" col="">
                <DateInput value={watch('date_delivrance')||''} onChange={v=>setValue('date_delivrance',v)} />
              </Field>
              <Field label="Durée (années)" col="">
                <select {...register('duree_validite_ans')} className="input">
                  <option value="">—</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} an{n>1?'s':''}</option>)}
                </select>
              </Field>
              <Field label="Date début" col="">
                <DateInput value={watch('date_debut')||''} onChange={v=>setValue('date_debut',v)} />
              </Field>
              <Field label="Date fin" col="">
                <DateInput value={watch('date_fin')||''} onChange={v=>setValue('date_fin',v)} />
              </Field>
            </div>
          </div>

          {/* Étendue géographique */}
          <div className="card p-4 space-y-3 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Étendue géographique</p>
            <div className="flex gap-3">
              {Object.entries(ETENDUE_CFG).map(([k, v]) => (
                <label key={k} className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${etendueGeo === k
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-[#E2E8F0] hover:border-primary-200'}`}>
                  <input type="radio" {...register('etendue_geo')} value={k} className="sr-only" />
                  <span className="text-xl">{v.icon}</span>
                  <span className={`text-sm font-semibold ${etendueGeo === k ? 'text-primary-700' : 'text-slate-600'}`}>
                    {v.label}
                  </span>
                </label>
              ))}
            </div>

            {(etendueGeo === 'WILAYA' || etendueGeo === 'WILAYAS') && (
              <div>
                <label className="label">Wilaya(s) couverte(s)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {wilayasValue && wilayasValue.split(',').map(s => s.trim()).filter(Boolean).map(code => {
                    const w = WILAYAS.find(x => x.code === code)
                    return (
                      <span key={code} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                        bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        W.{code} {w?.nom}
                        <button type="button" onClick={() => {
                          const next = wilayasValue.split(',').map(s=>s.trim()).filter(s=>s && s!==code)
                          setWilayasValue(next.join(', '))
                        }}><X size={10} /></button>
                      </span>
                    )
                  })}
                </div>
                <select className="input"
                  onChange={e => {
                    if (!e.target.value) return
                    const cur = wilayasValue ? wilayasValue.split(',').map(s=>s.trim()).filter(Boolean) : []
                    if (!cur.includes(e.target.value)) {
                      setWilayasValue([...cur, e.target.value].join(', '))
                    }
                    e.target.value = ''
                  }}>
                  <option value="">+ Ajouter une wilaya...</option>
                  {WILAYAS.map(w => <option key={w.code} value={w.code}>{w.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Codes déchets */}
          <div className="card p-4 space-y-2 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Codes déchets autorisés par l'agrément
            </p>
            <CodesPicker value={codesValue} onChange={setCodesValue} />
            {codesValue && (
              <p className="text-xs text-slate-400 mt-1">
                {codesValue.split(',').filter(s=>s.trim()).length} code(s) sélectionné(s)
              </p>
            )}
          </div>
        </>
      )}

      {/* Statut + Observations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Statut" col="">
          <select {...register('statut')} className="input">
            <option value="ACTIF">Actif</option>
            <option value="EXPIRE">Expiré</option>
            <option value="SUSPENDU">Suspendu</option>
            <option value="REVOQUE">Révoqué</option>
          </select>
        </Field>
      </div>
      <Field label="Observations" col="">
        <textarea {...register('observations')} className="input" rows={2} placeholder="Observations..." />
      </Field>

      <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={15} /> {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'agrément'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
      </div>
    </form>
  )
}

// ── Agrement Card ─────────────────────────────────────────────────────────────
function AgrementCard({ agr, onEdit, onDelete }) {
  const typeCfg   = TYPE_CFG[agr.type_agrement]   || TYPE_CFG.AUTRE
  const statutCfg = STATUT_CFG[agr.statut]        || STATUT_CFG.EXPIRE
  const etCfg     = ETENDUE_CFG[agr.etendue_geo]  || {}
  const TypeIcon  = typeCfg.icon
  const StIcon    = statutCfg.icon

  return (
    <div className={`card p-4 transition-all hover:shadow-lg
      ${agr.est_valide === false ? 'border-l-4 border-red-400' :
        agr.expire_bientot ? 'border-l-4 border-amber-400' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <TypeIcon size={20} className="text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {agr.numero_agrement && (
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {agr.numero_agrement}
              </span>
            )}
            <span className={`badge ${typeCfg.badge}`}>{typeCfg.label}</span>
            <span className={`badge ${statutCfg.badge}`}>
              <StIcon size={10} className="mr-0.5" />{statutCfg.label}
            </span>
          </div>

          {/* Récupérateur */}
          <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
            <Shield size={12} className="text-primary-400" />
            {agr.recuperateur_nom || `Récupérateur #${agr.recuperateur}`}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
            {agr.date_delivrance && (
              <div>
                <p className="text-slate-400">Délivrance</p>
                <p className="font-semibold">{agr.date_delivrance}</p>
              </div>
            )}
            {agr.date_debut && (
              <div>
                <p className="text-slate-400">Début</p>
                <p className="font-semibold">{agr.date_debut}</p>
              </div>
            )}
            {agr.date_fin && (
              <div>
                <p className="text-slate-400">Fin</p>
                <p className={`font-semibold ${agr.jours_restants < 0 ? 'text-red-600' : agr.expire_bientot ? 'text-amber-600' : ''}`}>
                  {agr.date_fin}
                  {agr.jours_restants !== null && agr.jours_restants >= 0 && (
                    <span className="ml-1 text-slate-400">({agr.jours_restants}j)</span>
                  )}
                </p>
              </div>
            )}
            {agr.etendue_geo && (
              <div>
                <p className="text-slate-400">Étendue</p>
                <p className="font-semibold">{etCfg.icon} {etCfg.label}</p>
              </div>
            )}
          </div>

          {/* Wilayas */}
          {agr.wilayas_list?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {agr.wilayas_list.map(w => (
                <span key={w} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  W.{w}
                </span>
              ))}
            </div>
          )}

          {/* Codes déchets */}
          {agr.codes_list?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {agr.codes_list.slice(0, 8).map(c => {
                const nom = NOMENCLATURE.find(n => n.code === c)
                return (
                  <span key={c} title={nom?.nom_fr || ''}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold
                      ${nom?.classe === 'SD' ? 'bg-red-50 text-red-700 border border-red-200' :
                        nom?.classe === 'S'  ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600'}`}>
                    {c}
                  </span>
                )
              })}
              {agr.codes_list.length > 8 && (
                <span className="text-[10px] text-slate-400">+{agr.codes_list.length - 8}</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={() => onEdit(agr)} className="btn-ghost p-2" title="Modifier">
            <Edit size={14} />
          </button>
          <button onClick={() => onDelete(agr.id)} className="btn-ghost p-2 text-red-400 hover:bg-red-50" title="Supprimer">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AgrementPage() {
  const { user } = useAuthStore()
  const [agrements,     setAgrements]     = useState([])
  const [recuperateurs, setRecuperateurs] = useState([])
  const [alerts,        setAlerts]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [showForm,      setShowForm]      = useState(false)
  const [editing,       setEditing]       = useState(null)
  const [typeFilter,    setTypeFilter]    = useState('')
  const [statutFilter,  setStatutFilter]  = useState('')
  const [search,        setSearch]        = useState('')
  const [tab,           setTab]           = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const [agrRes, recRes, alertRes] = await Promise.all([
        agrAPI.getAll({ page_size: 200 }),
        recupAPI.getAll(),
        agrAPI.alerts(),
      ])
      const agrData  = agrRes.data.results  || agrRes.data
      const recData  = recRes.data.results  || recRes.data

      // Enrich with recuperateur name
      const recMap = {}
      recData.forEach(r => { recMap[r.id] = r.nom_raison_sociale })
      const enriched = agrData.map(a => ({ ...a, recuperateur_nom: recMap[a.recuperateur] || '' }))

      setAgrements(enriched)
      setRecuperateurs(recData)
      setAlerts(alertRes.data.alerts || [])
    } catch {
      toast.error('Erreur chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet agrément ?')) return
    try {
      await agrAPI.delete(id)
      toast.success('Agrément supprimé')
      load()
    } catch { toast.error('Erreur suppression') }
  }

  const handleEdit = (agr) => {
    setEditing(agr)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleSave = () => {
    handleCloseForm()
    load()
  }

  // Filtering
  const filtered = agrements.filter(a => {
    const matchType   = !typeFilter   || a.type_agrement === typeFilter
    const matchStatut = !statutFilter || a.statut        === statutFilter
    const matchSearch = !search || (
      (a.numero_agrement || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.recuperateur_nom || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.codes_dechets || '').includes(search)
    )
    const matchTab = tab === 'all' ? true :
      tab === 'avec'   ? a.type_agrement === 'AVEC_AGREMENT' :
      tab === 'sans'   ? a.type_agrement === 'SANS_AGREMENT' :
      tab === 'autre'  ? a.type_agrement === 'AUTRE' :
      tab === 'alerts' ? (!a.est_valide || a.expire_bientot) : true
    return matchType && matchStatut && matchSearch && matchTab
  })

  const criticalCount = alerts.filter(a => a.severity === 'critical').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award size={24} className="text-primary-600" /> Agréments
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gestion des agréments des récupérateurs de déchets
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary">
          <Plus size={16} /> Nouvel agrément
        </button>
      </div>

      {/* Alert banner */}
      {criticalCount > 0 && (
        <div className="card border-l-4 border-red-500 bg-red-50/40 p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">
              {criticalCount} agrément(s) expiré(s) — action requise
            </p>
            <p className="text-xs text-red-600 mt-0.5">{alerts[0]?.message}</p>
          </div>
          <button onClick={() => setTab('alerts')} className="btn-danger btn-sm flex-shrink-0">
            Voir →
          </button>
        </div>
      )}

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key:'all',    label:`Tous (${agrements.length})`,                                          color:'bg-slate-100 text-slate-600' },
          { key:'avec',   label:`Avec agrément (${agrements.filter(a=>a.type_agrement==='AVEC_AGREMENT').length})`, color:'bg-blue-100 text-blue-700'   },
          { key:'sans',   label:`Sans agrément (${agrements.filter(a=>a.type_agrement==='SANS_AGREMENT').length})`, color:'bg-green-100 text-green-700' },
          { key:'autre',  label:`Autre (${agrements.filter(a=>a.type_agrement==='AUTRE').length})`,    color:'bg-gray-100 text-gray-600'   },
          { key:'alerts', label:`⚠️ Alertes (${alerts.length})`,                                       color:'bg-red-100 text-red-700'     },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border-2
              ${tab === t.key
                ? 'border-primary-500 bg-primary-600 text-white'
                : `border-transparent ${t.color} hover:border-slate-300`}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="N° agrément, récupérateur, code déchet..."
            className="input pl-9 text-sm" />
        </div>
        <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)} className="input w-40 text-sm">
          <option value="">Tous statuts</option>
          {Object.entries(STATUT_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Award size={36} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">Aucun agrément trouvé</p>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary mt-4">
            <Plus size={15} /> Créer le premier agrément
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(agr => (
            <AgrementCard key={agr.id} agr={agr} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Form modal */}
      <Modal
        open={showForm}
        onClose={handleCloseForm}
        title={editing ? 'Modifier l\'agrément' : 'Nouvel agrément'}
        size="max-w-3xl"
      >
        <AgrementForm
          agrement={editing}
          currentUser={user}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      </Modal>
    </div>
  )
}

