import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Landmark, Building2, Recycle, Plus, Search, X,
  Save, Edit, Trash2, Eye, Phone, Mail, Globe,
  MapPin, User, ChevronDown, ChevronRight
} from 'lucide-react'
import api from '../../api'
import { WILAYAS, getCommunesByWilaya } from '../../utils/algeria_geo'
import toast from 'react-hot-toast'

// ── API ───────────────────────────────────────────────────────────────────────
const adminAPI = {
  getAll:  (p)    => api.get('/administration/', { params: p }),
  get:     (id)   => api.get(`/administration/${id}/`),
  create:  (d)    => api.post('/administration/', d),
  update:  (id,d) => api.patch(`/administration/${id}/`, d),
  delete:  (id)   => api.delete(`/administration/${id}/`),
}

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CFG = {
  MINISTERE:  {
    label:    "Ministère de l'Environnement et de la Qualité de la Vie",
    short:    'Ministère',
    icon:     Landmark,
    color:    'bg-violet-600',
    light:    'bg-violet-50 text-violet-700 border-violet-200',
    border:   'border-violet-500',
    gradient: 'from-violet-600 to-violet-800',
  },
  DIR_WILAYA: {
    label:    "Direction de l'Environnement de Wilaya",
    short:    'Direction Wilaya',
    icon:     Building2,
    color:    'bg-blue-600',
    light:    'bg-blue-50 text-blue-700 border-blue-200',
    border:   'border-blue-500',
    gradient: 'from-blue-600 to-blue-800',
  },
  AND: {
    label:    "Agence Nationale des Déchets (AND)",
    short:    'AND',
    icon:     Recycle,
    color:    'bg-emerald-600',
    light:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    border:   'border-emerald-500',
    gradient: 'from-emerald-600 to-emerald-800',
  },
}

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex-shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ── Form ──────────────────────────────────────────────────────────────────────
function AdminForm({ item, onSave, onClose }) {
  const isEdit = !!item?.id
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: item || { type_administration: 'MINISTERE', statut: 'ACTIF' }
  })
  const [saving,   setSaving]   = useState(false)
  const [communes, setCommunes] = useState([])

  const type   = watch('type_administration')
  const wilaya = watch('wilaya')

  useEffect(() => {
    if (wilaya) setCommunes(getCommunesByWilaya(wilaya))
    else        setCommunes([])
  }, [wilaya])

  useEffect(() => {
    if (item) {
      reset(item)
      if (item.wilaya) setCommunes(getCommunesByWilaya(item.wilaya))
    }
  }, [item])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (isEdit) { await adminAPI.update(item.id, data); toast.success('Mis à jour') }
      else        { await adminAPI.create(data);           toast.success('Créé')       }
      onSave()
    } catch { toast.error('Erreur sauvegarde') }
    finally  { setSaving(false) }
  }

  const F = ({ label, req, children }) => (
    <div>
      <label className="label">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Type selector */}
      <div>
        <label className="label">Type d'institution <span className="text-red-500">*</span></label>
        <div className="space-y-2">
          {Object.entries(TYPE_CFG).map(([k, v]) => {
            const Icon = v.icon
            return (
              <label key={k} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                ${type === k ? `${v.border} ${v.light}` : 'border-[#E2E8F0] hover:border-slate-300'}`}>
                <input type="radio" {...register('type_administration')} value={k} className="sr-only" />
                <div className={`w-9 h-9 rounded-xl ${v.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${type === k ? '' : 'text-slate-600'}`}>{v.short}</p>
                  <p className="text-xs text-slate-400">{v.label}</p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Identification */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Identification</p>
        <F label="Dénomination officielle" req>
          <input {...register('denomination', { required: true })} className="input"
            placeholder={
              type === 'MINISTERE'  ? "Ministère de l'Environnement et de la Qualité de la Vie" :
              type === 'DIR_WILAYA' ? "Direction de l'Environnement de la Wilaya d'Alger" :
              "Agence Nationale des Déchets"
            } />
        </F>
        {type === 'AND' && (
          <F label="N° Agrément délivré (référence interne)">
            <input {...register('numero_agrement_delivre')} className="input" placeholder="AND-2024-001" />
          </F>
        )}
      </div>

      {/* Responsable */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Responsable / Directeur</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <F label="Nom et prénom">
            <input {...register('nom_directeur')} className="input" placeholder="M. Ahmed Bensalem" />
          </F>
          <F label="Téléphone direct">
            <input {...register('telephone_directeur')} className="input" placeholder="+213 XX XX XX XX" />
          </F>
          <F label="Email direct">
            <input {...register('email_directeur')} type="email" className="input" placeholder="directeur@..." />
          </F>
        </div>
      </div>

      {/* Localisation */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Localisation & Contact</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {type === 'DIR_WILAYA' && (
            <F label="Wilaya">
              <select {...register('wilaya')} className="input">
                <option value="">-- Sélectionner une wilaya --</option>
                {WILAYAS.map(w => <option key={w.code} value={w.code}>{w.label}</option>)}
              </select>
            </F>
          )}
          <F label="Commune">
            <select {...register('commune')} className="input" disabled={type === 'DIR_WILAYA' && !wilaya}>
              <option value="">-- Commune --</option>
              {communes.map(c => <option key={c.code} value={c.label}>{c.label}</option>)}
            </select>
          </F>
        </div>
        <F label="Adresse">
          <textarea {...register('adresse')} className="input" rows={2} placeholder="Adresse complète..." />
        </F>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <F label="Téléphone">
            <input {...register('telephone')} className="input" placeholder="+213 XX XX XX XX" />
          </F>
          <F label="Fax">
            <input {...register('fax')} className="input" placeholder="+213 XX XX XX XX" />
          </F>
          <F label="Email">
            <input {...register('email')} type="email" className="input" placeholder="contact@..." />
          </F>
        </div>
        <F label="Site web">
          <input {...register('site_web')} type="url" className="input" placeholder="https://..." />
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="Latitude GPS">
            <input {...register('latitude')} type="number" step="0.0000001" className="input" placeholder="36.7538" />
          </F>
          <F label="Longitude GPS">
            <input {...register('longitude')} type="number" step="0.0000001" className="input" placeholder="3.0588" />
          </F>
        </div>
      </div>

      {/* Statut + Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <F label="Statut">
          <select {...register('statut')} className="input">
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
            <option value="SUSPENDU">Suspendu</option>
          </select>
        </F>
        <F label="Notes">
          <textarea {...register('notes')} className="input" rows={2} placeholder="Notes internes..." />
        </F>
      </div>

      <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={15} /> {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
      </div>
    </form>
  )
}

// ── Institution Card ──────────────────────────────────────────────────────────
function InstitutionCard({ item, onEdit, onDelete, onView }) {
  const cfg  = TYPE_CFG[item.type_administration] || TYPE_CFG.MINISTERE
  const Icon = cfg.icon

  return (
    <div className={`card overflow-hidden hover:shadow-lg transition-all cursor-pointer`}
      onClick={() => onView(item)}>
      <div className={`h-1.5 bg-gradient-to-r ${cfg.gradient}`} />
      <div className="p-4 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${cfg.color} flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                {item.denomination}
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 border ${cfg.light}`}>
                {cfg.short}
              </span>
            </div>
            <span className={`badge text-[10px] flex-shrink-0
              ${item.statut === 'ACTIF' ? 'badge-green' : item.statut === 'INACTIF' ? 'badge-gray' : 'badge-red'}`}>
              {item.statut_display || item.statut}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-slate-400">
            {item.wilaya && (
              <span className="flex items-center gap-1">
                <MapPin size={10} /> W.{item.wilaya}{item.commune ? ` — ${item.commune}` : ''}
              </span>
            )}
            {item.telephone && <span className="flex items-center gap-1"><Phone size={10} /> {item.telephone}</span>}
            {item.email && <span className="flex items-center gap-1"><Mail size={10} /> {item.email}</span>}
            {item.nom_directeur && (
              <span className="flex items-center gap-1 text-slate-500">
                <User size={10} /> {item.nom_directeur}
              </span>
            )}
          </div>

          {item.site_web && (
            <a href={item.site_web} target="_blank" rel="noopener noreferrer"
              className="text-[10px] text-primary-600 hover:underline flex items-center gap-1 mt-1"
              onClick={e => e.stopPropagation()}>
              <Globe size={10} /> {item.site_web}
            </a>
          )}
        </div>

        <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => onView(item)} className="btn-ghost p-2 text-slate-400 hover:text-primary-600"><Eye size={14} /></button>
          <button onClick={() => onEdit(item)} className="btn-ghost p-2 text-slate-400 hover:text-blue-600"><Edit size={14} /></button>
          <button onClick={() => onDelete(item.id)} className="btn-ghost p-2 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({ item, onClose, onEdit }) {
  if (!item) return null
  const cfg  = TYPE_CFG[item.type_administration] || TYPE_CFG.MINISTERE
  const Icon = cfg.icon

  const Row = ({ label, value }) => value ? (
    <div className="flex gap-3 text-sm py-1.5 border-b border-slate-50 dark:border-slate-700 last:border-0">
      <span className="w-36 text-slate-400 flex-shrink-0">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  ) : null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1E293B] h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className={`px-6 py-5 bg-gradient-to-r ${cfg.gradient} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">{item.denomination}</p>
              <p className="text-white/70 text-xs mt-0.5">{cfg.label}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(item)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white">
              <Edit size={14} />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Responsable */}
          {item.nom_directeur && (
            <div className="card p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Responsable</p>
              <Row label="Nom / Prénom"  value={item.nom_directeur} />
              <Row label="Téléphone"     value={item.telephone_directeur} />
              <Row label="Email"         value={item.email_directeur} />
            </div>
          )}

          {/* AND specific */}
          {item.type_administration === 'AND' && item.numero_agrement_delivre && (
            <div className="card p-4 bg-emerald-50/30 border-emerald-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Référence</p>
              <Row label="N° Agrément délivré" value={item.numero_agrement_delivre} />
            </div>
          )}

          {/* Contact */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Localisation & Contact</p>
            <Row label="Wilaya"    value={item.wilaya ? `W.${item.wilaya}` : null} />
            <Row label="Commune"   value={item.commune} />
            <Row label="Adresse"   value={item.adresse} />
            <Row label="Téléphone" value={item.telephone} />
            <Row label="Fax"       value={item.fax} />
            <Row label="Email"     value={item.email} />
            {item.site_web && (
              <div className="flex gap-3 text-sm py-1.5">
                <span className="w-36 text-slate-400 flex-shrink-0">Site web</span>
                <a href={item.site_web} target="_blank" rel="noopener noreferrer"
                  className="text-primary-600 hover:underline font-medium">{item.site_web}</a>
              </div>
            )}
            {item.latitude && <Row label="GPS" value={`${item.latitude}, ${item.longitude}`} />}
          </div>

          {item.notes && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">{item.notes}</p>
            </div>
          )}

          <div className="text-xs text-slate-400 border-t border-[#E2E8F0] dark:border-[#334155] pt-3">
            <p>Créé le : {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-DZ') : '—'}</p>
            <p>Mis à jour : {item.updated_at ? new Date(item.updated_at).toLocaleDateString('fr-DZ') : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdministrationPage() {
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [viewing,    setViewing]    = useState(null)
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const p = { page_size: 200 }
      if (search)     p.search              = search
      if (typeFilter) p.type_administration = typeFilter
      const res = await adminAPI.getAll(p)
      setItems(res.data.results || res.data)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, typeFilter])

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette institution ?')) return
    try { await adminAPI.delete(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur') }
  }
  const handleSave = () => { setShowForm(false); setEditing(null); load() }
  const handleEdit = (item) => { setEditing(item); setViewing(null); setShowForm(true) }

  // Counts
  const counts = items.reduce((acc, i) => {
    acc[i.type_administration] = (acc[i.type_administration] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark size={24} className="text-violet-600" />
            Administration de l'Environnement
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Institutions publiques de gestion environnementale — {items.length} enregistrée(s)
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary">
          <Plus size={16} /> Nouvelle institution
        </button>
      </div>

      {/* Type chips */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* All */}
        <button onClick={() => setTypeFilter('')}
          className={`card p-4 flex items-center gap-3 border-2 transition-all text-left
            ${!typeFilter ? 'border-slate-400 bg-slate-50' : 'border-transparent hover:border-slate-200'}`}>
          <div className="w-10 h-10 rounded-xl bg-slate-500 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{items.length}</p>
            <p className="text-xs text-slate-500">Toutes institutions</p>
          </div>
        </button>
        {Object.entries(TYPE_CFG).map(([k, v]) => {
          const Icon  = v.icon
          const count = counts[k] || 0
          return (
            <button key={k} onClick={() => setTypeFilter(typeFilter === k ? '' : k)}
              className={`card p-4 flex items-center gap-3 border-2 transition-all text-left
                ${typeFilter === k ? `${v.border} ${v.light}` : 'border-transparent hover:border-slate-200'}`}>
              <div className={`w-10 h-10 rounded-xl ${v.color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white">{count}</p>
                <p className="text-xs text-slate-500 leading-tight">{v.short}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par dénomination, directeur, email..."
            className="input pl-9 text-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={13} className="text-slate-400" /></button>}
        </div>
        <span className="text-xs text-slate-400 self-center">{items.length} résultat(s)</span>
      </div>

      {/* List */}
      {loading ? <Spinner /> : items.length === 0 ? (
        <div className="card p-16 text-center">
          <Landmark size={40} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">Aucune institution enregistrée</p>
          <p className="text-sm text-slate-300 mt-1">
            Ajoutez le Ministère, les Directions de Wilaya et l'AND.
          </p>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary mt-4">
            <Plus size={15} /> Ajouter
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(TYPE_CFG).map(([type, cfg]) => {
            const typeItems = items.filter(i => i.type_administration === type)
            if (typeItems.length === 0) return null
            const Icon = cfg.icon
            return (
              <div key={type}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-xl ${cfg.color} flex items-center justify-center`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">{cfg.label}</h3>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    {typeItems.length}
                  </span>
                </div>
                <div className="space-y-2 pl-5 border-l-2 border-slate-100 dark:border-slate-700">
                  {typeItems.map(item => (
                    <InstitutionCard key={item.id} item={item}
                      onEdit={handleEdit} onDelete={handleDelete} onView={setViewing} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null) }}
        title={editing ? `Modifier — ${editing.denomination}` : 'Nouvelle institution'}>
        <AdminForm item={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null) }} />
      </Modal>

      {viewing && <DetailPanel item={viewing} onClose={() => setViewing(null)} onEdit={handleEdit} />}
    </div>
  )
}
