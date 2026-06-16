import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import {
  Package, Plus, Search, X, Save, Edit, Trash2, Eye,
  Truck, Factory, Flame, Recycle, AlertTriangle,
  FileText, Calendar, Shield, CheckCircle2, Clock, XCircle
} from 'lucide-react'
import api from '../../api'
import { useAuthStore } from '../../store'
import { NOMENCLATURE } from '../nomenclature/nomenclatureData'
import toast from 'react-hot-toast'

const opAPI    = {
  getAll: (p)    => api.get('/operations/', { params: p }),
  create: (d)    => api.post('/operations/', d),
  update: (id,d) => api.patch(`/operations/${id}/`, d),
  delete: (id)   => api.delete(`/operations/${id}/`),
}
const recupAPI = { getAll: () => api.get('/recuperateurs/?page_size=200&statut=ACTIF') }
const opListAPI = {
  generateurs:   () => api.get('/operateurs/?type_operateur=GENERATEUR&page_size=200'),
  transporteurs: () => api.get('/operateurs/?type_operateur=TRANSPORTEUR&page_size=200'),
  valorisateurs: () => api.get('/operateurs/?type_operateur=VALORISATEUR&page_size=200'),
  eliminateurs:  () => api.get('/operateurs/?type_operateur=ELIMINATEUR&page_size=200'),
}

const STATUT_CFG = {
  EN_COURS: { label:'En cours', badge:'badge-yellow', icon:Clock },
  TERMINEE: { label:'Terminée', badge:'badge-green',  icon:CheckCircle2 },
  ANNULEE:  { label:'Annulée',  badge:'badge-red',    icon:XCircle },
}
const DEST_CFG = {
  VALORISATION: { label:'Valorisation',      color:'text-teal-600',  bg:'bg-teal-50'  },
  ELIMINATION:  { label:'Élimination (DSD)', color:'text-red-600',   bg:'bg-red-50'   },
  STOCKAGE:     { label:'Stockage temp.',    color:'text-amber-600', bg:'bg-amber-50' },
  RECYCLAGE:    { label:'Recyclage',         color:'text-blue-600',  bg:'bg-blue-50'  },
}
const CLASSES_DSD = ['S','SD']

function Spinner() {
  return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex-shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function CodeDechetPicker({ onChange }) {
  const [search, setSearch] = useState('')
  const [open,   setOpen]   = useState(false)
  const [label,  setLabel]  = useState('')

  const filtered = useMemo(() =>
    NOMENCLATURE.filter(n =>
      n.code.includes(search) || n.nom_fr.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 40)
  , [search])

  const select = (n) => {
    setLabel(`${n.code} — ${n.nom_fr.slice(0,60)}`)
    setSearch('')
    setOpen(false)
    onChange(n.code, n.nom_fr, n.classe)
  }

  return (
    <div className="relative">
      <input value={label || search}
        onChange={e => { setSearch(e.target.value); setLabel(''); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Rechercher un code déchet (ex: 13.02.01)..."
        className="input" />
      {open && (search || !label) && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] rounded-xl shadow-xl max-h-52 overflow-y-auto">
          {filtered.map(n => (
            <button key={n.code} type="button" onClick={() => select(n)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-xs">
              <span className="font-mono font-bold text-primary-700 flex-shrink-0 w-16">{n.code}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0 ${n.classe==='SD'?'bg-red-100 text-red-700':n.classe==='S'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}>{n.classe}</span>
              <span className="text-slate-600 truncate">{n.nom_fr}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-center py-4 text-slate-400 text-xs">Aucun résultat</p>}
        </div>
      )}
    </div>
  )
}

function OperationForm({ operation, lists, currentUser, onSave, onClose }) {
  const isEdit = !!operation?.id
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: operation || {
      statut: 'EN_COURS', unite: 'KG',
      destination_type: 'VALORISATION',
      date_recuperation: new Date().toISOString().split('T')[0],
      // Auto-set recuperateur if user is RECUPERATEUR role
      recuperateur: currentUser?.recuperateur_id || '',
    }
  })
  const [saving,  setSaving]  = useState(false)
  const [code,    setCode]    = useState(operation?.code_dechet || '')
  const [classe,  setClasse]  = useState(operation?.classe_dechet || '')
  const [alertes, setAlertes] = useState([])

  const isRecuperateur = currentUser?.role === 'RECUPERATEUR'
  const recupId = isRecuperateur ? currentUser?.recuperateur_id : watch('recuperateur')
  const dest    = watch('destination_type')
  const needsBSD= CLASSES_DSD.includes(classe) || dest === 'ELIMINATION'

  useEffect(() => { if (operation) reset(operation) }, [operation])

  useEffect(() => {
    if (!recupId || !code || !classe) { setAlertes([]); return }
    api.post('/operateurs/verifier_compatibilite/', {
      recuperateur_id: recupId, operateur_id: 0,
      code_dechet: code, classe_dechet: classe
    }).then(r => setAlertes(r.data.compatible ? [] : (r.data.alertes || [])))
      .catch(() => {})
  }, [recupId, code, classe])

  const onSubmit = async (data) => {
    setSaving(true)
    // Auto-assign recuperateur if role is RECUPERATEUR
    if (isRecuperateur && currentUser?.recuperateur_id) {
      data.recuperateur = currentUser.recuperateur_id
    }
    data.code_dechet   = code
    data.classe_dechet = classe
    try {
      if (isEdit) { await opAPI.update(operation.id, data); toast.success('Mis à jour') }
      else        { await opAPI.create(data);               toast.success('Opération créée') }
      onSave()
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  const F = ({ label, req, children }) => (
    <div>
      <label className="label">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {alertes.map((a,i) => (
        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-300">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{a.message}</p>
        </div>
      ))}

      {/* Récupérateur — show only if ADMIN */}
      {!isRecuperateur && (
        <div className="card p-4 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Récupérateur</p>
          <F label="Récupérateur" req>
            <select {...register('recuperateur', { required: !isRecuperateur })} className="input">
              <option value="">-- Sélectionner --</option>
              {lists.recuperateurs.map(r => <option key={r.id} value={r.id}>{r.nom_raison_sociale} ({r.numero_id})</option>)}
            </select>
          </F>
        </div>
      )}

      {/* Si RECUPERATEUR — afficher son nom */}
      {isRecuperateur && currentUser?.recuperateur_nom && (
        <div className="card p-3 bg-primary-50 border-primary-200 flex items-center gap-3">
          <Shield size={16} className="text-primary-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-primary-500">Récupérateur (vous)</p>
            <p className="font-semibold text-primary-800 text-sm">{currentUser.recuperateur_nom}</p>
          </div>
        </div>
      )}

      {/* Générateur */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Factory size={11}/> Générateur des déchets</p>
        <F label="Générateur" req>
          <select {...register('generateur', { required: true })} className="input">
            <option value="">-- Sélectionner un générateur --</option>
            {lists.generateurs.map(g => <option key={g.id} value={g.id}>{g.raison_sociale} — W.{g.wilaya||'?'}</option>)}
          </select>
        </F>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <F label="Bon de livraison"><input {...register('bon_livraison')} className="input" placeholder="BL-..." /></F>
          <F label="Date livraison"><input {...register('date_livraison')} type="date" className="input" /></F>
          <F label="Bon de commande n°"><input {...register('bon_commande')} className="input" placeholder="BC-..." /></F>
          <F label="Date commande"><input {...register('date_commande')} type="date" className="input" /></F>
        </div>
        <F label="Commande client"><input {...register('commande_client')} className="input" placeholder="Référence..." /></F>
      </div>

      {/* Déchets */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Package size={11}/> Déchets</p>
        <F label="Code déchet" req>
          <CodeDechetPicker onChange={(c,nom,cl) => {
            setCode(c); setClasse(cl)
            setValue('designation_dechet',nom)
            setValue('classe_dechet',cl)
          }} />
          {classe && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border
                ${classe==='SD'?'bg-red-50 text-red-700 border-red-200':
                  classe==='S'?'bg-amber-50 text-amber-700 border-amber-200':
                  'bg-slate-50 text-slate-600 border-slate-200'}`}>Classe {classe}</span>
              {needsBSD && <span className="text-xs text-red-600 font-bold flex items-center gap-1"><AlertTriangle size={11}/> BSD obligatoire</span>}
            </div>
          )}
        </F>
        <input type="hidden" {...register('designation_dechet')} />
        <input type="hidden" {...register('classe_dechet')} />
        <div className="grid grid-cols-2 gap-3">
          <F label="Unité" req>
            <select {...register('unite',{required:true})} className="input">
              <option value="KG">Kilogramme (kg)</option>
              <option value="TONNE">Tonne (t)</option>
              <option value="M3">Mètre cube (m³)</option>
              <option value="LITRE">Litre (L)</option>
              <option value="UNITE">Unité</option>
            </select>
          </F>
          <F label="Quantité" req>
            <input {...register('quantite',{required:true,min:0.001})} type="number" step="0.001" className="input" placeholder="0.000" />
          </F>
        </div>
      </div>

      {/* Transporteur */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Truck size={11}/> Transporteur</p>
        <F label="Transporteur">
          <select {...register('transporteur')} className="input"
            onChange={e => {
              setValue('transporteur', e.target.value)
              const t = lists.transporteurs.find(x => String(x.id) === e.target.value)
              if (t?.nom_conducteur)  setValue('chauffeur', t.nom_conducteur)
              if (t?.immatriculation) setValue('immatriculation', t.immatriculation)
            }}>
            <option value="">-- Sélectionner --</option>
            {lists.transporteurs.map(t => <option key={t.id} value={t.id}>{t.raison_sociale}</option>)}
          </select>
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="Chauffeur"><input {...register('chauffeur')} className="input" placeholder="Nom du chauffeur" /></F>
          <F label="Immatriculation"><input {...register('immatriculation')} className="input" placeholder="16-XXXXX-16" /></F>
        </div>
      </div>

      {/* Date récupération */}
      <div className="card p-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1"><Calendar size={11}/> Date de récupération</p>
        <F label="Date de récupération" req>
          <input {...register('date_recuperation',{required:true})} type="date" className="input" />
        </F>
      </div>

      {/* Destination */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Destination</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(DEST_CFG).map(([k,v]) => (
            <label key={k} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all
              ${dest===k?`border-primary-500 ${v.bg}`:'border-[#E2E8F0] hover:border-slate-300'}`}>
              <input type="radio" {...register('destination_type')} value={k} className="sr-only" />
              <span className={`text-xs font-semibold ${dest===k?v.color:'text-slate-500'}`}>{v.label}</span>
            </label>
          ))}
        </div>
        {(dest==='VALORISATION'||dest==='RECYCLAGE') && (
          <F label="Valorisateur">
            <select {...register('valorisateur')} className="input">
              <option value="">-- Sélectionner --</option>
              {lists.valorisateurs.map(v => <option key={v.id} value={v.id}>{v.raison_sociale}</option>)}
            </select>
          </F>
        )}
        {dest==='ELIMINATION' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-red-700">Élimination DSD — BSD obligatoire</p>
            </div>
            <F label="Éliminateur" req>
              <select {...register('eliminateur',{required:dest==='ELIMINATION'})} className="input">
                <option value="">-- Sélectionner --</option>
                {lists.eliminateurs.map(e => <option key={e.id} value={e.id}>{e.raison_sociale}</option>)}
              </select>
            </F>
            <F label="N° BSD">
              <input {...register('bsd_numero')} className="input" placeholder="BSD-2024-XXXXXX" />
            </F>
          </div>
        )}
      </div>

      {/* Statut + Obs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <F label="Statut">
          <select {...register('statut')} className="input">
            <option value="EN_COURS">En cours</option>
            <option value="TERMINEE">Terminée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </F>
        <F label="Observations">
          <textarea {...register('observations')} className="input" rows={2} placeholder="Observations..." />
        </F>
      </div>

      <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
        <button type="submit" disabled={saving||alertes.length>0} className="btn-primary">
          <Save size={15}/> {saving?'Enregistrement...':isEdit?'Mettre à jour':'Créer l\'opération'}
        </button>
        {alertes.length>0 && <span className="text-xs text-red-600 self-center font-semibold">Corrigez les alertes</span>}
        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
      </div>
    </form>
  )
}

function OperationCard({ op, onEdit, onDelete, onView }) {
  const st   = STATUT_CFG[op.statut]         || STATUT_CFG.EN_COURS
  const dst  = DEST_CFG[op.destination_type] || DEST_CFG.VALORISATION
  const Icon = st.icon
  return (
    <div className="card p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => onView(op)}>
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Package size={20} className="text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-primary-700 text-sm">{op.numero}</span>
            <span className={`badge ${st.badge} text-[10px]`}><Icon size={9} className="mr-0.5"/>{st.label}</span>
            {op.classe_dechet && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
              ${op.classe_dechet==='SD'?'bg-red-50 text-red-700 border-red-200':
                op.classe_dechet==='S'?'bg-amber-50 text-amber-700 border-amber-200':
                'bg-slate-50 text-slate-600 border-slate-200'}`}>Cl.{op.classe_dechet}</span>}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dst.bg} ${dst.color}`}>{dst.label}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">
            <span className="font-mono text-xs text-slate-400 mr-2">{op.code_dechet}</span>
            {op.designation_dechet?.slice(0,60)}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-200">{op.quantite} {op.unite_display||op.unite}</span>
            {op.generateur_nom && <span className="flex items-center gap-1"><Factory size={10}/>{op.generateur_nom}</span>}
            {op.transporteur_nom && <span className="flex items-center gap-1"><Truck size={10}/>{op.transporteur_nom}</span>}
            {op.chauffeur && <span>Chauf: {op.chauffeur}</span>}
            {op.immatriculation && <span>{op.immatriculation}</span>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Calendar size={10}/>Récup: <span className="font-semibold text-slate-600 ml-1">{op.date_recuperation}</span></span>
            {op.bon_livraison && <span>BL: {op.bon_livraison}</span>}
            {op.bon_commande && <span>BC: {op.bon_commande}</span>}
            {op.bsd_numero && <span className="text-red-600 font-semibold flex items-center gap-1"><FileText size={10}/>BSD: {op.bsd_numero}</span>}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => onView(op)}    className="btn-ghost p-2 text-slate-400 hover:text-primary-600"><Eye size={14}/></button>
          <button onClick={() => onEdit(op)}    className="btn-ghost p-2 text-slate-400 hover:text-blue-600"><Edit size={14}/></button>
          <button onClick={() => onDelete(op.id)} className="btn-ghost p-2 text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
        </div>
      </div>
    </div>
  )
}

export default function OperationsPage() {
  const { user } = useAuthStore()
  const [operations, setOperations] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [viewing,    setViewing]    = useState(null)
  const [search,     setSearch]     = useState('')
  const [statut,     setStatut]     = useState('')
  const [lists,      setLists]      = useState({
    recuperateurs:[], generateurs:[], transporteurs:[], valorisateurs:[], eliminateurs:[]
  })

  const isRecuperateur = user?.role === 'RECUPERATEUR'

  const loadLists = async () => {
    try {
      const [r,g,t,v,e] = await Promise.all([
        recupAPI.getAll(),
        opListAPI.generateurs(),
        opListAPI.transporteurs(),
        opListAPI.valorisateurs(),
        opListAPI.eliminateurs(),
      ])
      setLists({
        recuperateurs: r.data.results||r.data,
        generateurs:   g.data.results||g.data,
        transporteurs: t.data.results||t.data,
        valorisateurs: v.data.results||v.data,
        eliminateurs:  e.data.results||e.data,
      })
    } catch {}
  }

  const load = async () => {
    setLoading(true)
    try {
      const p = { page_size:100 }
      if (search) p.search = search
      if (statut) p.statut = statut
      // If recuperateur role, filter only their operations
      if (isRecuperateur && user?.recuperateur_id) {
        p.recuperateur = user.recuperateur_id
      }
      const res = await opAPI.getAll(p)
      setOperations(res.data.results || res.data)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadLists() }, [])
  useEffect(() => { load() }, [search, statut])

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ?')) return
    try { await opAPI.delete(id); toast.success('Supprimée'); load() } catch { toast.error('Erreur') }
  }
  const handleSave = () => { setShowForm(false); setEditing(null); load() }
  const handleEdit = (op) => { setEditing(op); setViewing(null); setShowForm(true) }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package size={24} className="text-primary-600"/>Opérations de récupération
          </h1>
          {isRecuperateur && user?.recuperateur_nom && (
            <p className="text-primary-600 text-sm font-semibold mt-0.5 flex items-center gap-1">
              <Shield size={13}/> {user.recuperateur_nom}
            </p>
          )}
          <p className="text-slate-500 text-sm mt-0.5">{operations.length} opération(s)</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary">
          <Plus size={16}/>Nouvelle opération
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {l:'Total',     v:operations.length,                                 c:'bg-primary-500',i:Package},
          {l:'En cours',  v:operations.filter(o=>o.statut==='EN_COURS').length,c:'bg-amber-500',  i:Clock},
          {l:'Terminées', v:operations.filter(o=>o.statut==='TERMINEE').length,c:'bg-emerald-500',i:CheckCircle2},
        ].map(k=>(
          <div key={k.l} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.c} flex items-center justify-center flex-shrink-0`}><k.i size={18} className="text-white"/></div>
            <div><p className="text-xl font-black text-slate-900 dark:text-white">{k.v}</p><p className="text-xs text-slate-500">{k.l}</p></div>
          </div>
        ))}
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="N° opération, code déchet, BL, BC..." className="input pl-9 text-sm"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={13} className="text-slate-400"/></button>}
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {[{k:'',l:'Tous'},{k:'EN_COURS',l:'En cours'},{k:'TERMINEE',l:'Terminées'},{k:'ANNULEE',l:'Annulées'}].map(t=>(
            <button key={t.k} onClick={()=>setStatut(t.k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statut===t.k?'bg-white dark:bg-slate-700 text-slate-900 shadow-sm':'text-slate-500'}`}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner/> : operations.length===0 ? (
        <div className="card p-16 text-center">
          <Package size={40} className="mx-auto mb-3 text-slate-200"/>
          <p className="font-semibold text-slate-400">Aucune opération</p>
          <button onClick={()=>{setEditing(null);setShowForm(true)}} className="btn-primary mt-4"><Plus size={15}/>Créer la première</button>
        </div>
      ) : (
        <div className="space-y-2">
          {operations.map(op=><OperationCard key={op.id} op={op} onEdit={handleEdit} onDelete={handleDelete} onView={setViewing}/>)}
        </div>
      )}

      <Modal open={showForm} onClose={()=>{setShowForm(false);setEditing(null)}}
        title={editing?`Modifier — ${editing.numero}`:'Nouvelle opération'}>
        <OperationForm operation={editing} lists={lists} currentUser={user}
          onSave={handleSave} onClose={()=>{setShowForm(false);setEditing(null)}}/>
      </Modal>

      {viewing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30" onClick={()=>setViewing(null)}/>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1E293B] h-full overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-bold font-mono text-primary-700 text-lg">{viewing.numero}</p>
                <div className="flex gap-2 mt-1">
                  {(()=>{const st=STATUT_CFG[viewing.statut]||STATUT_CFG.EN_COURS;return <span className={`badge ${st.badge} text-[10px]`}>{st.label}</span>})()}
                  {viewing.destination_type&&(()=>{const d=DEST_CFG[viewing.destination_type];return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${d.bg} ${d.color}`}>{d.label}</span>})()}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{handleEdit(viewing);setViewing(null)}} className="btn-secondary btn-sm"><Edit size={13}/></button>
                <button onClick={()=>setViewing(null)} className="btn-ghost p-2"><X size={16}/></button>
              </div>
            </div>
            {[
              ['Récupérateur',viewing.recuperateur_nom],['Générateur',viewing.generateur_nom],
              ['Bon de livraison',viewing.bon_livraison],['Date livraison',viewing.date_livraison],
              ['Bon de commande',viewing.bon_commande],['Date commande',viewing.date_commande],
              ['Commande client',viewing.commande_client],
              ['Code déchet',viewing.code_dechet],['Désignation',viewing.designation_dechet],
              ['Quantité',`${viewing.quantite} ${viewing.unite_display||viewing.unite}`],
              ['Classe',viewing.classe_dechet],['Date récupération',viewing.date_recuperation],
              ['Transporteur',viewing.transporteur_nom],['Chauffeur',viewing.chauffeur],
              ['Immatriculation',viewing.immatriculation],
              ['Valorisateur',viewing.valorisateur_nom],['Éliminateur',viewing.eliminateur_nom],
              ['N° BSD',viewing.bsd_numero],['Observations',viewing.observations],
            ].filter(([,v])=>v).map(([l,v])=>(
              <div key={l} className="flex gap-3 text-sm py-1.5 border-b border-slate-50 dark:border-slate-700 last:border-0">
                <span className="w-36 text-slate-400 flex-shrink-0">{l}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
