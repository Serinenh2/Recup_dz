import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, FileText, CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import { aiConversationsAPI } from '../api'
import toast from 'react-hot-toast'

export default function BSDTab() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('Analyser le statut des BSD')
  const [loading, setLoading] = useState(false)
  const [convId, setConvId] = useState(null)
  const [bsdStatus, setBsdStatus] = useState(null)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startAnalysis = async () => {
    setLoading(true)
    setBsdStatus(null)
    try {
      const res = await aiConversationsAPI.create({ contexte: 'bsd', titre: 'Analyse des BSD' })
      const cid = res.data.id
      setConvId(cid)
      const userMsg = { role: 'user', message: input || 'Analyser le statut des BSD' }
      setMessages([userMsg])
      sendMessage(cid, input || 'Analyser le statut des BSD')
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
      setBsdStatus(res.data.analyse_contextuelle || null)
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
        contexte: 'bsd',
        entite: 'bsd',
      })
      setBsdStatus(res.data)
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
          <FileText size={16} className="text-primary-500" />
          Analyse des BSD (Bons de Sortie)
        </div>
        <button onClick={handleContextualAnalysis} disabled={loading} className="btn-secondary btn-sm flex items-center gap-1">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Analyse IA
        </button>
      </div>

      {/* BSD Status Indicators */}
      {bsdStatus && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <FileText size={20} className="mx-auto mb-2 text-primary-600" />
            <p className="text-xs text-slate-500">Total BSD</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{bsdStatus.total_bsd || 0}</p>
          </div>
          <div className="card p-4 text-center">
            <CheckCircle2 size={20} className="mx-auto mb-2 text-emerald-600" />
            <p className="text-xs text-slate-500">Valides</p>
            <p className="text-xl font-bold text-emerald-600">{bsdStatus.valides || 0}</p>
          </div>
          <div className="card p-4 text-center">
            <AlertTriangle size={20} className="mx-auto mb-2 text-red-600" />
            <p className="text-xs text-slate-500">Anomalies</p>
            <p className="text-xl font-bold text-red-600">{bsdStatus.anomalies || 0}</p>
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="border rounded-xl overflow-hidden" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Posez des questions sur les BSD</p>
              <p className="text-xs mt-1">Ex: "Analyser les BSD invalides"</p>
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
            placeholder="Demandez à l'IA sur les BSD..."
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