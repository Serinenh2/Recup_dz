import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Shield, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { aiConversationsAPI } from '../api'
import toast from 'react-hot-toast'

export default function AgrementsTab() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('Vérifier la validité des agréments')
  const [loading, setLoading] = useState(false)
  const [convId, setConvId] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startAnalysis = async () => {
    setLoading(true)
    setAnalysis(null)
    try {
      const res = await aiConversationsAPI.create({ contexte: 'agrement', titre: 'Analyse des agréments' })
      const cid = res.data.id
      setConvId(cid)
      const userMsg = { role: 'user', message: input || 'Vérifier la validité des agréments' }
      setMessages([userMsg])
      sendMessage(cid, input || 'Vérifier la validité des agréments')
    } catch {
      setLoading(false)
      toast.error('Erreur serveur. Le serveur Django est-il en marche ?')
    }
  }

  const sendMessage = async (id, text) => {
    try {
      const res = await aiConversationsAPI.sendMessage(id, { message: text })
      const reponse = res.data.reponse
      setMessages(prev => [...prev, { role: 'assistant', message: reponse }])
      setAnalysis(res.data.analyse_contextuelle || null)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', message: 'Erreur de connexion au serveur IA.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    if (!convId) {
      startAnalysis()
      setInput('')
      return
    }
    const userMsg = { role: 'user', message: input }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    sendMessage(convId, input)
    setInput('')
  }

  const handleContextualAnalysis = async () => {
    setLoading(true)
    try {
      const res = await aiConversationsAPI.analyseContextuelle({
        contexte: 'agrement',
        entite: 'recuperateur',
      })
      setAnalysis(res.data)
      setMessages(prev => [...prev, { role: 'assistant', message: res.data.reponse || 'Analyse effectuée' }])
    } catch {
      toast.error('Erreur lors de l\'analyse contextuelle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Shield size={16} className="text-primary-500" />
          Vérification des agréments
        </div>
        <button onClick={handleContextualAnalysis} disabled={loading} className="btn-secondary btn-sm flex items-center gap-1">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Analyse IA
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="card p-4 bg-blue-50/50 border-blue-200">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Bot size={16} className="text-primary-600" />
            Résultats de l'analyse
          </h4>
          <div className="space-y-2 text-sm">
            {analysis.validite && (
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span className="text-slate-700">Validité: {analysis.validite}</span>
              </div>
            )}
            {analysis.alertes?.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold text-red-600 mb-1">Alertes détectées:</p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  {analysis.alertes.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="border rounded-xl overflow-hidden" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              <Shield size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Posez des questions sur les agréments</p>
              <p className="text-xs mt-1">Ex: "Quels agréments expirent bientôt ?"</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-primary-600" />
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-white dark:bg-slate-700 border text-slate-800 dark:text-slate-200 rounded-bl-md'
              }`}>
                {m.message}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={14} className="text-slate-600" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                <Bot size={14} className="text-primary-600" />
              </div>
              <div className="bg-white dark:bg-slate-700 border px-4 py-2.5 rounded-2xl text-sm text-slate-500">
                Analyse en cours...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-3 border-t bg-white dark:bg-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Demandez à l'IA sur les agréments..."
            className="flex-1 px-4 py-2.5 rounded-xl border dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}
            className="px-4 rounded-xl bg-primary-600 text-white disabled:opacity-50 hover:bg-primary-700">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}