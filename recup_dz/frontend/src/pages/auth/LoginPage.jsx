import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Recycle, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const login    = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await login(data.username, data.password)
      navigate('/dashboard')
    } catch {
      toast.error('Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — purple gradient */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-violet-900">
        {/* Circles */}
        {[...Array(6)].map((_,i) => (
          <div key={i} className="absolute rounded-full border border-white/10"
            style={{ width: `${(i+1)*160}px`, height: `${(i+1)*160}px`,
              top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
        ))}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-xl">RECUP-DZ</span>
          </div>
          {/* Hero */}
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              République Algérienne Démocratique et Populaire
            </span>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
              Système de Gestion<br />
              <span className="text-primary-300">des Récupérateurs</span><br />
              <span className="text-primary-300">de Déchets</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-lg">
              Plateforme nationale de gestion, suivi et contrôle des récupérateurs
              de déchets conformément à la Loi n°01-19 et au Décret 06-104.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {['Loi 01-19','Décret 06-104','BSD électronique','Traçabilité nationale','Bilingue FR/AR'].map(f => (
                <span key={f} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">{f}</span>
              ))}
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[['4','Catégories','de récupérateurs'],['208','Codes','de déchets'],['BSD','Numérique','& Traçable']].map(([v,l,s]) => (
              <div key={l} className="bg-white/10 rounded-xl p-4">
                <p className="text-white font-black text-2xl">{v}</p>
                <p className="text-white/70 text-xs">{l}</p>
                <p className="text-white/40 text-[10px]">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-white dark:bg-[#0F172A]">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <Recycle className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl text-slate-900">RECUP-DZ</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Bienvenue</h2>
            <p className="text-slate-500 mt-1 text-sm">Connectez-vous à votre espace</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nom d'utilisateur</label>
              <input {...register('username', { required: true })}
                className={`input ${errors.username ? 'border-red-400' : ''}`}
                placeholder="admin" autoComplete="username" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input {...register('password', { required: true })}
                  type={showPwd ? 'text' : 'password'}
                  className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion...
                  </span>
                : <span className="flex items-center gap-2">
                    Se connecter <ArrowRight className="w-4 h-4" />
                  </span>
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                Créer votre compte gratuitement
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-[0.625rem] text-slate-400">
            Conforme à la Loi n°01-19 et au Décret exécutif n°06-104
          </p>
        </div>
      </div>
    </div>
  )
}
