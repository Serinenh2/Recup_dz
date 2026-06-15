import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Shield, Save, Building2, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../../store'
import api from '../../api'
import { WILAYAS, getCommunesByWilaya } from '../../utils/algeria_geo'
import toast from 'react-hot-toast'

export default function ProfilPage() {
  const { user, loadUser } = useAuthStore()
  const [recup,      setRecup]      = useState(null)
  const [communes,   setCommunes]   = useState([])
  const [savingUser, setSavingUser] = useState(false)
  const [savingRec,  setSavingRec]  = useState(false)

  const isRecuperateur = !!(user?.role === 'RECUPERATEUR' || user?.recuperateur_id)

  const userForm = useForm({ defaultValues: user || {} })
  const recForm  = useForm({})

  useEffect(() => {
    if (isRecuperateur) {
      api.get('/accounts/mon-recuperateur/')
        .then(r => {
          setRecup(r.data)
          recForm.reset(r.data)
          if (r.data.wilaya) setCommunes(getCommunesByWilaya(r.data.wilaya))
        }).catch(() => {})
    }
  }, [isRecuperateur])

  const wilaya = recForm.watch('wilaya')
  useEffect(() => {
    if (wilaya) setCommunes(getCommunesByWilaya(wilaya))
    else setCommunes([])
  }, [wilaya])

  const onSaveUser = async (data) => {
    setSavingUser(true)
    try {
      await api.patch('/accounts/me/', {
        first_name: data.first_name, last_name: data.last_name,
        email: data.email, phone: data.phone,
      })
      await loadUser()
      toast.success('Profil mis à jour')
    } catch { toast.error('Erreur') }
    finally { setSavingUser(false) }
  }

  const onSaveRec = async (data) => {
    setSavingRec(true)
    try {
      await api.patch('/accounts/mon-recuperateur/', data)
      toast.success('Fiche récupérateur mise à jour')
      const r = await api.get('/accounts/mon-recuperateur/')
      setRecup(r.data)
      recForm.reset(r.data)
    } catch { toast.error('Erreur') }
    finally { setSavingRec(false) }
  }

  const initials = `${user?.first_name?.[0]||''}${user?.last_name?.[0]||''}`.toUpperCase() || 'U'
  const ROLES = { SUPERADMIN:'Super Admin', ADMIN:'Administrateur', INSPECTEUR:'Inspecteur', RECUPERATEUR:'Récupérateur', READONLY:'Lecture seule' }
  const F = ({ label, children }) => <div><label className="label">{label}</label>{children}</div>

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mon Profil</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Vos informations sont utilisées automatiquement dans toutes les opérations
        </p>
      </div>

      {/* Avatar */}
      <div className="card p-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
          <p className="text-sm text-slate-500">{ROLES[user?.role] || user?.role}</p>
          {user?.recuperateur_nom && (
            <p className="text-sm text-primary-600 font-semibold flex items-center gap-1 mt-1">
              <Shield size={12}/> {user.recuperateur_nom}
            </p>
          )}
        </div>
      </div>

      {/* User profile form */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User size={16} className="text-primary-600"/> Informations personnelles
        </h3>
        <form onSubmit={userForm.handleSubmit(onSaveUser)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <F label="Prénom"><input {...userForm.register('first_name')} className="input" placeholder="Prénom" /></F>
            <F label="Nom"><input {...userForm.register('last_name')} className="input" placeholder="Nom" /></F>
          </div>
          <F label="Email"><input {...userForm.register('email')} type="email" className="input" placeholder="email@..." /></F>
          <F label="Téléphone"><input {...userForm.register('phone')} className="input" placeholder="+213 XX XX XX XX" /></F>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
            <div>
              <label className="label text-slate-400">Nom d'utilisateur</label>
              <input value={user?.username||''} disabled className="input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label text-slate-400">Rôle</label>
              <input value={ROLES[user?.role]||''} disabled className="input opacity-60 cursor-not-allowed" />
            </div>
          </div>
          <button type="submit" disabled={savingUser} className="btn-primary">
            <Save size={15}/> {savingUser ? 'Enregistrement...' : 'Enregistrer le profil'}
          </button>
        </form>
      </div>

      {/* Recuperateur form — only if linked */}
      {isRecuperateur && recup && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 size={16} className="text-primary-600"/> Fiche récupérateur
            </h3>
            <span className="badge badge-green text-[10px] flex items-center gap-1">
              <CheckCircle2 size={9}/> Enregistrée une fois — réutilisée partout
            </span>
          </div>

          <div className="card p-3 bg-blue-50/50 border-blue-200 mb-4">
            <p className="text-xs text-blue-700">
              <strong>ℹ️</strong> Ces informations s'appliquent automatiquement à toutes vos opérations,
              agréments et déclarations. Mettez-les à jour uniquement en cas de changement.
            </p>
          </div>

          <form onSubmit={recForm.handleSubmit(onSaveRec)} className="space-y-5">

            {/* Identification */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Identification</p>
              <F label="Raison sociale">
                <input {...recForm.register('nom_raison_sociale')} className="input" />
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Responsable">
                  <input {...recForm.register('responsable')} className="input" />
                </F>
                <F label="Statut juridique">
                  <select {...recForm.register('statut_juridique')} className="input">
                    <option value="">--</option>
                    {['EURL','SARL','SPA','SNC','PHYSIQUE','AUTRE'].map(s =>
                      <option key={s} value={s}>{s}</option>
                    )}
                  </select>
                </F>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <F label="NIF"><input {...recForm.register('nif')} className="input" placeholder="NIF" /></F>
                <F label="NIS"><input {...recForm.register('nis')} className="input" placeholder="NIS" /></F>
                <F label="RC"><input {...recForm.register('registre_commerce')} className="input" placeholder="RC/..." /></F>
              </div>
            </div>

            {/* Localisation */}
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Localisation</p>
              <F label="Adresse">
                <textarea {...recForm.register('adresse')} className="input" rows={2} />
              </F>
              <div className="grid grid-cols-3 gap-3">
                <F label="Wilaya">
                  <select {...recForm.register('wilaya')} className="input">
                    <option value="">-- Wilaya --</option>
                    {WILAYAS.map(w => <option key={w.code} value={w.code}>{w.label}</option>)}
                  </select>
                </F>
                <F label="Commune">
                  <select {...recForm.register('commune')} className="input" disabled={!wilaya}>
                    <option value="">-- Commune --</option>
                    {communes.map(c => <option key={c.code} value={c.label}>{c.label}</option>)}
                  </select>
                </F>
                <F label="Code postal">
                  <input {...recForm.register('code_postal')} className="input" placeholder="35000" />
                </F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Latitude GPS"><input {...recForm.register('latitude')} type="number" step="0.0000001" className="input" /></F>
                <F label="Longitude GPS"><input {...recForm.register('longitude')} type="number" step="0.0000001" className="input" /></F>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Contact</p>
              <div className="grid grid-cols-3 gap-3">
                <F label="Téléphone"><input {...recForm.register('telephone')} className="input" placeholder="+213..." /></F>
                <F label="Email"><input {...recForm.register('email')} type="email" className="input" /></F>
                <F label="Site web"><input {...recForm.register('site_web')} type="url" className="input" /></F>
              </div>
            </div>

            <F label="Notes internes">
              <textarea {...recForm.register('notes')} className="input" rows={2} />
            </F>

            <button type="submit" disabled={savingRec} className="btn-primary">
              <Save size={15}/>
              {savingRec ? 'Enregistrement...' : 'Mettre à jour la fiche récupérateur'}
            </button>
          </form>
        </div>
      )}

      {!isRecuperateur && (
        <div className="card p-4 bg-slate-50/50">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Shield size={14} className="text-slate-400"/>
            En tant qu'administrateur, gérez les fiches récupérateurs depuis la page
            <a href="/recuperateurs" className="text-primary-600 font-semibold hover:underline">Récupérateurs</a>.
          </p>
        </div>
      )}
    </div>
  )
}
