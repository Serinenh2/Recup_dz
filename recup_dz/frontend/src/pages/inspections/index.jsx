import { Plus } from 'lucide-react'
export default function Page() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Module</h1>
        <button className="btn-primary"><Plus size={16} /> Nouveau</button>
      </div>
      <div className="card p-12 text-center text-slate-400">
        <p className="font-semibold">Ce module est opérationnel via l'API backend.</p>
        <p className="text-sm mt-1">Connectez au backend Django pour voir les données.</p>
      </div>
    </div>
  )
}
