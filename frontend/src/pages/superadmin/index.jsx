import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Building2, Plus, Search, X, Save, Edit, Trash2,
  Users, Shield, Calendar, CheckCircle2, XCircle,
  Clock, AlertTriangle, Eye, Key, Crown,
  TrendingUp, Zap, Star
} from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

// ── API ───────────────────────────────────────────────────────────────────────
const tenantAPI = {
  getAll:     (p)      => api.get('/tenants/', { params: p }),
  create:     (d)      => api.post('/tenants/', d),
  update:     (id, d)  => api.patch(`/tenants/${id}/`, d),
  delete:     (id)     => api.delete(`/tenants/${id}/`),
  creerAdmin: (id, d)  => api.post(`/tenants/${id}/creer_admin/`, d),
  utilisateurs:(id)    => api.get(`/tenants/${id}/utilisateurs/`),
  stats:      ()       => api.get('/tenants/stats/'),
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PLAN_CFG = {
  STARTER:      { label: 'Starter',      color: 'bg-slate-100 text-slate-700',   border: 'border-slate-300',  icon: Zap,   maxUsers: 1,  prix: '5 000 DA/mois'  },
  PROFESSIONAL: { label: 'Professional', color: 'bg-blue-100 text-blue-700',     border: 'border-blue-400',   icon: Star,  maxUsers: 5,  prix: '15 000 DA/mois' },
  ENTERPRISE:   { label: 'Enterprise',   color: 'bg-violet-100 text-violet-700', border: 'border-violet-500', icon: Crown, maxUsers: 999, prix: '30 000 DA/mois' },
}
const STATUT_CFG = {
  ACTIF:    { label: 'Actif',       badge: 'badge-green',  icon: CheckCircle2 },
  SUSPENDU: { label: 'Suspendu',    badge: 'badge-red',    icon: XCircle      },
  EXPIRE:   { label: 'Expiré',      badge: 'badge-red',    icon: XCircle      },
  ESSAI:    { label: "Essai",       badge: 'badge-yellow', icon: Clock        },
}

function Spinner() {
  return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
}

function Modal({ open, onClose, title, children, size = 'max-w-2xl' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full ${size} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex-shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ── Tenant Form ───────────────────────────────────────────────────────────────
function TenantForm({ tenant, onSave, onClose }) {
  const isEdit = !!tenant?.id
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: tenant || { plan: 'STARTER', statut: 'ESSAI', couleur_primaire: '#4F46E5', max_users: 1 }
  })
  const [saving, setSaving] = useState(false)
  const plan = watch('plan')

  useEffect(() => { if (tenant) reset(tenant) }, [tenant])
  useEffect(() => {
    const cfg = PLAN_CFG[plan]
    if (cfg && !isEdit) setValue('max_users', cfg.maxUsers === 999 ? 100 : cfg.maxUsers)
  }, [plan])

  // Auto-generate slug from name
  const nom = watch('nom')
  useEffect(() => {
    if (!isEdit && nom) {
      const slug = nom.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50)
      setValue('slug', slug)
    }
  }, [nom])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (isEdit) { await tenantAPI.update(tenant.id, data); toast.success('Client mis à jour') }
      else        { await tenantAPI.create(data);            toast.success('Client créé') }
      onSave()
    } catch (e) {
      const err = e.response?.data
      toast.error(typeof err === 'object' ? JSON.stringify(err) : 'Erreur')
    } finally { setSaving(false) }
  }

  const F = ({ label, req, children }) => (
    <div>
      <label className="label">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Plan selector */}
      <div>
        <label className="label">Plan d'abonnement <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(PLAN_CFG).map(([k, v]) => {
            const Icon = v.icon
            return (
              <label key={k} className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${plan === k ? v.border + ' bg-slate-50' : 'border-[#E2E8F0] hover:border-slate-300'}`}>
                <input type="radio" {...register('plan')} value={k} className="sr-only" />
                <div className="flex items-center gap-2">
                  <Icon size={16} className={plan === k ? 'text-primary-600' : 'text-slate-400'} />
                  <span className={`font-bold text-sm ${plan === k ? 'text-primary-700' : 'text-slate-600'}`}>{v.label}</span>
                </div>
                <span className="text-xs text-slate-400">{v.prix}</span>
                <span className="text-xs text-slate-500">{v.maxUsers === 999 ? 'Illimité' : v.maxUsers} utilisateur(s)</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Identification */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Identification</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <F label="Nom de l'entreprise" req>
            <input {...register('nom', { required: true })} className="input" placeholder="SARL EcoRecup..." />
          </F>
          <F label="Slug (identifiant unique)" req>
            <input {...register('slug', { required: true })} className="input" placeholder="sarl-ecorecup" />
            <p className="text-[10px] text-slate-400 mt-1">Utilisé dans l'URL — lettres minuscules et tirets uniquement</p>
          </F>
          <F label="Registre de Commerce">
            <input {...register('registre_commerce')} className="input" placeholder="RC/16/B/..." />
          </F>
          <F label="NIF">
            <input {...register('nif')} className="input" placeholder="NIF..." />
          </F>
          <F label="Wilaya">
            <input {...register('wilaya')} className="input" placeholder="16" maxLength={3} />
          </F>
          <F label="Téléphone">
            <input {...register('telephone')} className="input" placeholder="+213 XX XX XX XX" />
          </F>
          <F label="Email">
            <input {...register('email')} type="email" className="input" placeholder="contact@..." />
          </F>
          <F label="Couleur principale">
            <div className="flex items-center gap-2">
              <input {...register('couleur_primaire')} type="color" className="w-10 h-10 rounded-lg border border-[#E2E8F0] cursor-pointer" />
              <input {...register('couleur_primaire')} className="input flex-1" placeholder="#4F46E5" />
            </div>
          </F>
        </div>
        <F label="Adresse">
          <textarea {...register('adresse')} className="input" rows={2} placeholder="Adresse complète..." />
        </F>
      </div>

      {/* Abonnement */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Abonnement</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <F label="Statut">
            <select {...register('statut')} className="input">
              <option value="ESSAI">Essai</option>
              <option value="ACTIF">Actif</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="EXPIRE">Expiré</option>
            </select>
          </F>
          <F label="Nb. utilisateurs max">
            <input {...register('max_users')} type="number" min={1} className="input" />
          </F>
          <F label="Date début">
            <input {...register('date_debut')} type="date" className="input" />
          </F>
          <F label="Date fin">
            <input {...register('date_fin')} type="date" className="input" />
          </F>
        </div>
        <F label="Notes internes">
          <textarea {...register('notes')} className="input" rows={2} placeholder="Notes..." />
        </F>
      </div>

      <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={15} /> {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le client'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
      </div>
    </form>
  )
}

// ── Create Admin User Modal ───────────────────────────────────────────────────
function CreateAdminModal({ tenant, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [saving, setSaving] = useState(false)
  const [done,   setDone]   = useState(null)

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const res = await tenantAPI.creerAdmin(tenant.id, data)
      setDone(res.data)
      toast.success('Utilisateur admin créé')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 bg-primary-50/50 border-primary-200">
        <p className="text-sm text-primary-800">
          Création d'un compte administrateur pour <strong>{tenant.nom}</strong>.
          Cet utilisateur aura accès à toutes les données de ce client.
        </p>
      </div>

      {done ? (
        <div className="card p-6 text-center bg-emerald-50 border-emerald-300">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500" />
          <p className="font-bold text-emerald-800 text-lg">Compte créé avec succès</p>
          <div className="mt-4 bg-white rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Entreprise</span>
              <span className="font-bold">{done.tenant}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Nom d'utilisateur</span>
              <span className="font-mono font-bold text-primary-700">{done.username}</span>
            </div>
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertTriangle size={11} /> Communiquez le mot de passe de manière sécurisée
            </p>
          </div>
          <button onClick={onClose} className="btn-primary mt-4">Fermer</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prénom</label>
              <input {...register('first_name')} className="input" placeholder="Mohamed" />
            </div>
            <div>
              <label className="label">Nom</label>
              <input {...register('last_name')} className="input" placeholder="Benali" />
            </div>
          </div>
          <div>
            <label className="label">Nom d'utilisateur <span className="text-red-500">*</span></label>
            <input {...register('username', { required: true })} className="input" placeholder="admin_ecorecup" />
          </div>
          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="admin@ecorecup.dz" />
          </div>
          <div>
            <label className="label">Mot de passe <span className="text-red-500">*</span></label>
            <input {...register('password', { required: true, minLength: 8 })}
              type="password" className="input" placeholder="Minimum 8 caractères" />
            {errors.password && <p className="text-xs text-red-500 mt-1">Minimum 8 caractères</p>}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              <Key size={15} /> {saving ? 'Création...' : 'Créer le compte admin'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}
    </div>
  )
}

// ── Tenant Card ───────────────────────────────────────────────────────────────
function TenantCard({ tenant, onEdit, onDelete, onCreateAdmin, onViewUsers }) {
  const planCfg   = PLAN_CFG[tenant.plan]    || PLAN_CFG.STARTER
  const statutCfg = STATUT_CFG[tenant.statut]|| STATUT_CFG.ESSAI
  const StatIcon  = statutCfg.icon
  const PlanIcon  = planCfg.icon

  return (
    <div className={`card p-5 border-l-4 hover:shadow-lg transition-all
      ${tenant.statut === 'ACTIF' ? 'border-emerald-400' :
        tenant.statut === 'ESSAI' ? 'border-amber-400' :
        'border-red-400'}`}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-lg"
          style={{ background: tenant.couleur_primaire || '#4F46E5' }}>
          {tenant.nom.slice(0,1).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-slate-900 dark:text-white">{tenant.nom}</p>
            <span className={`badge text-[10px] ${statutCfg.badge}`}>
              <StatIcon size={9} className="mr-0.5" />{statutCfg.label}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${planCfg.color}`}>
              <PlanIcon size={9} className="inline mr-0.5" />{planCfg.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-400">
            <span className="font-mono text-primary-600">/{tenant.slug}</span>
            {tenant.wilaya && <span>W.{tenant.wilaya}</span>}
            {tenant.email && <span>{tenant.email}</span>}
            {tenant.telephone && <span>{tenant.telephone}</span>}
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1 text-slate-500">
              <Users size={11} /> {tenant.max_users} util. max
            </span>
            {tenant.date_fin && (
              <span className={`flex items-center gap-1 font-semibold
                ${tenant.jours_restants !== null && tenant.jours_restants <= 30
                  ? 'text-red-600'
                  : tenant.jours_restants !== null && tenant.jours_restants <= 60
                    ? 'text-amber-600'
                    : 'text-slate-500'}`}>
                <Calendar size={11} />
                {tenant.jours_restants !== null && tenant.jours_restants >= 0
                  ? `${tenant.jours_restants}j restants`
                  : 'Expiré'
                } — {tenant.date_fin}
              </span>
            )}
            <span className="text-slate-400">{planCfg.prix}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button onClick={() => onCreateAdmin(tenant)}
            className="btn-primary btn-sm text-[10px]">
            <Key size={11} /> Créer admin
          </button>
          <button onClick={() => onViewUsers(tenant)}
            className="btn-secondary btn-sm text-[10px]">
            <Users size={11} /> Utilisateurs
          </button>
          <div className="flex gap-1">
            <button onClick={() => onEdit(tenant)} className="btn-ghost p-1.5 text-slate-400 hover:text-blue-600"><Edit size={13} /></button>
            <button onClick={() => onDelete(tenant.id)} className="btn-ghost p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={13} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [tenants,    setTenants]    = useState([])
  const [stats,      setStats]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [adminFor,   setAdminFor]   = useState(null)
  const [usersFor,   setUsersFor]   = useState(null)
  const [usersList,  setUsersList]  = useState(null)
  const [search,     setSearch]     = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statFilter, setStatFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const p = { page_size: 200 }
      if (search)    p.search = search
      if (planFilter)p.plan   = planFilter
      if (statFilter)p.statut = statFilter
      const [tRes, sRes] = await Promise.all([tenantAPI.getAll(p), tenantAPI.stats()])
      setTenants(tRes.data.results || tRes.data)
      setStats(sRes.data)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, planFilter, statFilter])

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client et toutes ses données ?')) return
    try { await tenantAPI.delete(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur') }
  }

  const handleSave = () => { setShowForm(false); setEditing(null); load() }

  const handleViewUsers = async (tenant) => {
    setUsersFor(tenant)
    try {
      const res = await tenantAPI.utilisateurs(tenant.id)
      setUsersList(res.data)
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Crown size={24} className="text-violet-600" /> Gestion des clients
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Plateforme RECUP-DZ — Administration centrale SaaS
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary">
          <Plus size={16} /> Nouveau client
        </button>
      </div>

      {/* Stats KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total clients',  value: stats.total,    color: 'bg-primary-500', icon: Building2  },
            { label: 'Actifs',         value: stats.actifs,   color: 'bg-emerald-500', icon: CheckCircle2},
            { label: 'En essai',       value: stats.essai,    color: 'bg-amber-500',   icon: Clock       },
            { label: 'Suspendus',      value: stats.suspendus,color: 'bg-red-500',     icon: XCircle     },
          ].map(k => (
            <div key={k.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${k.color} flex items-center justify-center flex-shrink-0`}>
                <k.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{k.value ?? '—'}</p>
                <p className="text-xs text-slate-500">{k.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setPlanFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all
            ${!planFilter ? 'bg-slate-700 text-white border-transparent' : 'border-slate-200 text-slate-600 bg-white'}`}>
          Tous ({tenants.length})
        </button>
        {Object.entries(PLAN_CFG).map(([k, v]) => {
          const count = tenants.filter(t => t.plan === k).length
          const Icon  = v.icon
          return (
            <button key={k} onClick={() => setPlanFilter(planFilter === k ? '' : k)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all
                ${planFilter === k ? `bg-primary-600 text-white border-transparent` : `border-slate-200 text-slate-600 bg-white`}`}>
              <Icon size={11} /> {v.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nom, slug, email, RC..." className="input pl-9 text-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={13} className="text-slate-400" /></button>}
        </div>
        <select value={statFilter} onChange={e => setStatFilter(e.target.value)} className="input w-36 text-sm">
          <option value="">Tous statuts</option>
          {Object.entries(STATUT_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? <Spinner /> : tenants.length === 0 ? (
        <div className="card p-16 text-center">
          <Building2 size={40} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">Aucun client enregistré</p>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary mt-4">
            <Plus size={15} /> Créer le premier client
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map(tenant => (
            <TenantCard key={tenant.id} tenant={tenant}
              onEdit={t => { setEditing(t); setShowForm(true) }}
              onDelete={handleDelete}
              onCreateAdmin={setAdminFor}
              onViewUsers={handleViewUsers}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null) }}
        title={editing ? `Modifier — ${editing.nom}` : 'Nouveau client'} size="max-w-3xl">
        <TenantForm tenant={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null) }} />
      </Modal>

      <Modal open={!!adminFor} onClose={() => setAdminFor(null)}
        title={`Créer un admin — ${adminFor?.nom}`}>
        {adminFor && <CreateAdminModal tenant={adminFor} onClose={() => setAdminFor(null)} />}
      </Modal>

      <Modal open={!!usersFor} onClose={() => { setUsersFor(null); setUsersList(null) }}
        title={`Utilisateurs — ${usersFor?.nom}`}>
        {usersList ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{usersList.total} / {usersList.max} utilisateurs</p>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-2 bg-primary-500 rounded-full"
                  style={{ width: `${Math.min(100, (usersList.total/usersList.max)*100)}%` }} />
              </div>
            </div>
            {usersList.users.length === 0 ? (
              <div className="card p-8 text-center text-slate-400">
                <Users size={28} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm">Aucun utilisateur — créez un admin d'abord</p>
              </div>
            ) : usersList.users.map(u => (
              <div key={u.id} className="card p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                  {(u.nom || u.username).slice(0,1).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{u.nom || u.username}</p>
                  <p className="text-xs text-slate-400">@{u.username} · {u.role}</p>
                </div>
                <span className={`badge text-[10px] ${u.actif ? 'badge-green' : 'badge-gray'}`}>
                  {u.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
            ))}
            <button onClick={() => setAdminFor(usersFor)} className="btn-primary btn-sm w-full justify-center">
              <Key size={13} /> Créer un autre utilisateur admin
            </button>
          </div>
        ) : <Spinner />}
      </Modal>
    </div>
  )
}
