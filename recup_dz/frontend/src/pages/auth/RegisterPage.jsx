import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Recycle, ArrowRight, Building2, User, Mail,
  Lock, Eye, EyeOff, CheckCircle2, Copy,
  AlertTriangle, Hash
} from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await api.post('/accounts/register/', {
        nom_entreprise:    data.nom_entreprise,
        nif:               data.nif || '',
        nis:               data.nis || '',
        registre_commerce: data.registre_commerce || '',
        username:          data.username   || '',
        password:          data.password   || '',
        email:             data.email      || '',
        first_name:        data.first_name || '',
        last_name:         data.last_name  || '',
      })
      setResult(res.data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié !')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-violet-900">
        {[...Array(5)].map((_,i) => (
          <div key={i} className="absolute rounded-full border border-white/10"
            style={{ width:`${(i+1)*180}px`, height:`${(i+1)*180}px`,
              top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
        ))}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-xl">RECUP-DZ</span>
          </div>
          <div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Gérez vos déchets<br />
              <span className="text-primary-300">intelligemment</span>
            </h1>
            <p className="text-white/60 leading-relaxed mb-8">
              Plateforme nationale de gestion et traçabilité des déchets.
              Créez votre espace en quelques secondes.
            </p>
            <div className="space-y-3">
              {[
                { icon:'🏢', label:"Nom de l'entreprise" },
                { icon:'🔢', label:'NIF / NIS / RC' },
                { icon:'✅', label:'Complétez votre profil après connexion' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-white/80 text-sm font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/30">
            Système de gestion des récupérateurs — Loi n°01-19
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-white dark:bg-[#0F172A] overflow-y-auto">
        <div className="w-full max-w-[420px] py-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <Recycle className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl text-slate-900">RECUP-DZ</span>
          </div>

          {/* ── FORM ── */}
          {!result ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Créer votre compte</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Remplissez les informations principales. Vous pourrez compléter votre profil après connexion.
                </p>
              </div>

              {/* Entreprise */}
              <div className="card p-4 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Building2 size={11} /> Informations de l'entreprise
                </p>
                <div>
                  <label className="label">Nom de l'entreprise <span className="text-red-500">*</span></label>
                  <input
                    {...register('nom_entreprise', { required:"Champ obligatoire", minLength:{value:2,message:"Min 2 caractères"} })}
                    className={`input ${errors.nom_entreprise ? 'border-red-400' : ''}`}
                    placeholder="SARL Gold Environment Service"
                    autoFocus
                  />
                  {errors.nom_entreprise && <p className="text-xs text-red-500 mt-1">{errors.nom_entreprise.message}</p>}
                </div>
                <div>
                  <label className="label">NIF <span className="text-red-500">*</span> <span className="font-normal text-slate-400 text-xs">— Numéro d'Identification Fiscale</span></label>
                  <div className="relative">
                    <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('nif', { required:"NIF obligatoire" })}
                      className={`input pl-8 ${errors.nif ? 'border-red-400' : ''}`}
                      placeholder="001234567890123"
                    />
                  </div>
                  {errors.nif && <p className="text-xs text-red-500 mt-1">{errors.nif.message}</p>}
                </div>
                <div>
                  <label className="label">NIS <span className="text-red-500">*</span> <span className="font-normal text-slate-400 text-xs">— Numéro d'Identification Statistique</span></label>
                  <div className="relative">
                    <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('nis', { required:"NIS obligatoire" })}
                      className={`input pl-8 ${errors.nis ? 'border-red-400' : ''}`}
                      placeholder="098765432100000"
                    />
                  </div>
                  {errors.nis && <p className="text-xs text-red-500 mt-1">{errors.nis.message}</p>}
                </div>
                <div>
                  <label className="label">Registre de Commerce <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('registre_commerce', { required:"RC obligatoire" })}
                      className={`input pl-8 ${errors.registre_commerce ? 'border-red-400' : ''}`}
                      placeholder="RC/16/B/001234"
                    />
                  </div>
                  {errors.registre_commerce && <p className="text-xs text-red-500 mt-1">{errors.registre_commerce.message}</p>}
                </div>
              </div>

              {/* Identifiants */}
              <div className="card p-4 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <User size={11} /> Identifiants de connexion
                  <span className="font-normal text-slate-400 ml-1">(optionnels — générés auto)</span>
                </p>
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
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('email')} type="email" className="input pl-8" placeholder="contact@entreprise.dz" />
                  </div>
                </div>
                <div>
                  <label className="label">Nom d'utilisateur <span className="text-slate-400 font-normal text-xs">(généré si vide)</span></label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('username')} className="input pl-8" placeholder="admin_gold" />
                  </div>
                </div>
                <div>
                  <label className="label">Mot de passe <span className="text-slate-400 font-normal text-xs">(généré si vide)</span></label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register('password', { validate: v => !v || v.length >= 8 || 'Min 8 caractères' })}
                      type={showPwd ? 'text' : 'password'}
                      className={`input pl-8 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                      placeholder="Min 8 caractères"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Création en cours...
                    </span>
                  : <span className="flex items-center justify-center gap-2">
                      Créer mon compte <ArrowRight className="w-4 h-4" />
                    </span>
                }
              </button>

              <p className="text-center text-sm text-slate-500">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                  Se connecter
                </Link>
              </p>
            </form>

          ) : (
          /* ── SUCCESS ── */
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Compte créé !</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Votre espace <span className="font-semibold text-slate-700">{result.tenant}</span> est prêt
                </p>
              </div>

              <div className="card p-5 space-y-3 border-2 border-emerald-200 bg-emerald-50/30">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Vos identifiants de connexion</p>
                {[
                  { label:"Nom d'utilisateur", value: result.username },
                  { label:"Mot de passe",       value: result.password },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 border border-emerald-200">
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="font-mono font-bold text-slate-900">{value}</p>
                    </div>
                    <button onClick={() => copy(value)}
                      className="text-slate-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex items-start gap-2">
                  <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Notez ces identifiants. Vous pourrez changer le mot de passe dans votre profil.
                  </p>
                </div>
              </div>

              <div className="card p-4 flex items-center gap-3 bg-blue-50/50 border-blue-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800 text-sm">Complétez votre profil</p>
                  <p className="text-xs text-blue-600">Après connexion → Mon Profil → adresse, wilaya, téléphone...</p>
                </div>
              </div>

              <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">
                Se connecter maintenant <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
