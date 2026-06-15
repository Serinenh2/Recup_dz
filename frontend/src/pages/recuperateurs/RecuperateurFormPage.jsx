import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { recuperateursAPI } from '../../api'
import { WILAYAS, getCommunesByWilaya } from '../../utils/algeria_geo'
import DateInput from '../../components/common/DateInput'
import toast from 'react-hot-toast'

export default function RecuperateurFormPage() {
  const { id }   = useParams()
  const isEdit   = !!id
  const navigate = useNavigate()
  const [saving,   setSaving]   = useState(false)
  const [communes, setCommunes] = useState([])

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm()

  const selectedWilaya = watch('wilaya')

  useEffect(() => {
    if (selectedWilaya) {
      setCommunes(getCommunesByWilaya(selectedWilaya))
      if (!isEdit) setValue('commune', '')
    } else {
      setCommunes([])
    }
  }, [selectedWilaya])

  useEffect(() => {
    if (isEdit) {
      recuperateursAPI.get(id).then(r => {
        reset(r.data)
        if (r.data.wilaya) setCommunes(getCommunesByWilaya(r.data.wilaya))
      }).catch(() => toast.error('Erreur chargement'))
    }
  }, [id])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (isEdit) {
        await recuperateursAPI.update(id, data)
        toast.success('Récupérateur mis à jour')
        navigate(`/recuperateurs/${id}`)
      } else {
        const res = await recuperateursAPI.create(data)
        toast.success('Récupérateur créé')
        navigate(`/recuperateurs/${res.data.id}`)
      }
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, required, error, children }) => (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error.message || 'Champ requis'}</p>}
    </div>
  )

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-secondary btn-sm">
          <ArrowLeft size={14} /> Retour
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isEdit ? 'Modifier le récupérateur' : 'Nouveau récupérateur'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Catégorie */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white border-b border-[#E2E8F0] pb-3">
            Catégorie et statut juridique
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Catégorie de récupérateur" required error={errors.type_recuperateur}>
              <select {...register('type_recuperateur', { required: true })} className="input">
                <option value="">-- Sélectionner --</option>
                <option value="CAT1">Catégorie 1 — Sans agrément (MA/I)</option>
                <option value="CAT2">Catégorie 2 — Déchets Spéciaux</option>
                <option value="CAT3">Catégorie 3 — Déchets Spéciaux Dangereux</option>
                <option value="CAT4">Catégorie 4 — Carte professionnelle</option>
              </select>
            </Field>
            <Field label="Statut juridique">
              <select {...register('statut_juridique')} className="input">
                <option value="">-- Sélectionner --</option>
                {['EURL','SARL','SPA','SNC','PHYSIQUE','AUTRE'].map(s =>
                  <option key={s} value={s}>{s}</option>
                )}
              </select>
            </Field>
          </div>
        </div>

        {/* Identification */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white border-b border-[#E2E8F0] pb-3">
            Identification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nom / Raison sociale" required error={errors.nom_raison_sociale}>
              <input {...register('nom_raison_sociale', { required: true })}
                className="input" placeholder="SARL EcoRecup..." />
            </Field>
            <Field label="Nom commercial">
              <input {...register('nom_commercial')} className="input" placeholder="Nom commercial..." />
            </Field>
            <Field label="Responsable" required error={errors.responsable}>
              <input {...register('responsable', { required: true })}
                className="input" placeholder="Nom du responsable" />
            </Field>
            <Field label="Registre de Commerce">
              <input {...register('registre_commerce')} className="input" placeholder="RC/16/B/..." />
            </Field>
            <Field label="NIF">
              <input {...register('nif')} className="input" placeholder="Numéro d'identification fiscal" />
            </Field>
            <Field label="NIS">
              <input {...register('nis')} className="input" placeholder="N° identification statistique" />
            </Field>
          </div>
        </div>

        {/* Agrément */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white border-b border-[#E2E8F0] pb-3">
            Agrément / Carte professionnelle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="N° Agrément">
              <input {...register('num_agrement')} className="input" placeholder="AGR-16-REC-2024-001" />
            </Field>
            <Field label="N° Carte professionnelle">
              <input {...register('num_carte_pro')} className="input" placeholder="CP-..." />
            </Field>
            <Field label="Date de délivrance">
              <DateInput value={watch('date_agrement')||''} onChange={v=>setValue('date_agrement',v)} />
            </Field>
            <Field label="Date d'expiration">
              <DateInput value={watch('date_expiration')||''} onChange={v=>setValue('date_expiration',v)} />
            </Field>
          </div>
        </div>

        {/* Localisation */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white border-b border-[#E2E8F0] pb-3">
            Localisation
          </h2>
          <Field label="Adresse">
            <textarea {...register('adresse')} className="input" rows={2}
              placeholder="Adresse complète" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Wilaya">
              <select {...register('wilaya')} className="input">
                <option value="">-- Sélectionner une wilaya --</option>
                {WILAYAS.map(w => (
                  <option key={w.code} value={w.code}>{w.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Commune">
              <select {...register('commune')} className="input"
                disabled={!selectedWilaya || communes.length === 0}>
                <option value="">-- Sélectionner une commune --</option>
                {communes.map(c => (
                  <option key={c.code} value={c.label}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Code postal">
              <input {...register('code_postal')} className="input" placeholder="16000" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Latitude GPS">
              <input {...register('latitude')} type="number" step="0.0000001"
                className="input" placeholder="36.7538" />
            </Field>
            <Field label="Longitude GPS">
              <input {...register('longitude')} type="number" step="0.0000001"
                className="input" placeholder="3.0588" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Téléphone">
              <input {...register('telephone')} className="input" placeholder="+213 XX XX XX XX" />
            </Field>
            <Field label="Email">
              <input {...register('email')} type="email" className="input" placeholder="contact@..." />
            </Field>
            <Field label="Site web">
              <input {...register('site_web')} type="url" className="input" placeholder="https://..." />
            </Field>
          </div>
        </div>

        {/* Statut */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white border-b border-[#E2E8F0] pb-3">
            Statut
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Statut">
              <select {...register('statut')} className="input">
                <option value="EN_ATTENTE">En attente de validation</option>
                <option value="ACTIF">Actif</option>
                <option value="SUSPENDU">Suspendu</option>
                <option value="EXPIRE">Expiré</option>
                <option value="ARCHIVE">Archivé</option>
              </select>
            </Field>
            <Field label="Date de création de l'entreprise">
              <DateInput value={watch('date_creation')||''} onChange={v=>setValue('date_creation',v)} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea {...register('notes')} className="input" rows={3}
              placeholder="Notes internes..." />
          </Field>
        </div>

        {/* Submit */}
        <div className="card p-5">
          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={15} />
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le récupérateur'}
          </button>
        </div>

      </form>
    </div>
  )
}
