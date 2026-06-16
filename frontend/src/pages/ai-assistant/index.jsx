import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, BookOpen, Bell, FileSearch, ClipboardCheck, TrendingUp, BarChart3, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store'
import { aiDashboardAPI } from './api'

const TABS = [
  { id: 'chat',       label: 'Chat intelligent',          icon: MessageSquare },
  { id: 'recherche',  label: 'Recherche réglementaire',   icon: FileSearch },
  { id: 'agrements',  label: 'Vérification agréments',    icon: ClipboardCheck },
  { id: 'bsd',        label: 'Analyse BSD',               icon: FileSearch },
  { id: 'stocks',     label: 'Analyse stocks',            icon: BarChart3 },
  { id: 'rapports',   label: 'Rapports',                  icon: TrendingUp },
  { id: 'alertes',    label: 'Alertes intelligentes',     icon: Bell },
  { id: 'connaissances', label: 'Base de connaissances',  icon: BookOpen },
]

export default function AIAssistantPage() {
  const [tab, setTab] = useState('chat')
  const [stats, setStats] = useState(null)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    aiDashboardAPI.statistiques().then(r => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assistant Réglementaire Déchets</h1>
          <p className="text-slate-500 text-sm mt-0.5">المساعد التنظيمي للنفايات — Expert virtuel de la réglementation algérienne</p>
        </div>
        <div className="badge badge-primary">Natif RECUP-DZ</div>
      </div>

      {/* KPIs rapides */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Questions posées', value: stats.questions_posees, icon: MessageSquare },
            { label: 'Alertes détectées', value: stats.alertes_detectees, icon: Bell },
            { label: 'BSD analysés', value: stats.bsd_analyses, icon: FileSearch },
            { label: 'Conversations', value: stats.conversations_total, icon: ChevronRight },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0">
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <t.icon size={16} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 min-h-[500px]">
          {tab === 'chat' && <ChatTab />}
          {tab === 'recherche' && <RechercheTab />}
          {tab === 'agrements' && <AgrementsTab />}
          {tab === 'bsd' && <BSDTab />}
          {tab === 'stocks' && <StocksTab />}
          {tab === 'rapports' && <RapportsTab />}
          {tab === 'alertes' && <AlertesTab />}
          {tab === 'connaissances' && <ConnaissancesTab />}
        </div>
      </div>
    </div>
  )
}
