import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, ChevronRight } from 'lucide-react'
import { aiConversationsAPI } from '../api'

export default function ChatTab() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [newConv, setNewConv] = useState(false)
  const [convId, setConvId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    aiConversationsAPI.suggestions().then(r => setHistory(r.data.suggestions || [])).catch(() => {})
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startChat = (suggestion) => {
    setLoading(true)
    aiConversationsAPI.create({ contexte: 'general', titre: suggestion }).then(r => {
      const cid = r.data.id
      setConvId(cid)
      setMessages([{ role: 'user', message: suggestion }])
      sendMessage(cid, suggestion)
    }).catch(() => {
      setLoading(false)
      setMessages([{ role: 'assistant', message: 'Erreur serveur. Le serveur Django est-il en marche sur http://localhost:8000 ?' }])
    })
  }

  const sendMessage = (id, text) => {
    aiConversationsAPI.sendMessage(id, { message: text }).then(r => {
      const reponse = r.data.reponse
      setMessages(prev => [...prev, { role: 'assistant', message: reponse }])
      setLoading(false)
    }).catch(() => {
      setMessages(prev => [...prev, { role: 'assistant', message: 'Erreur de connexion au serveur IA.' }])
      setLoading(false)
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    if (!convId) {
      startChat(input)
      setInput('')
      return
    }
    const userMsg = { role: 'user', message: input }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    sendMessage(convId, input)
    setInput('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Sparkles size={16} className="text-primary-500" />
          Assistant Réglementaire Déchets
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setConvId(null); setMessages([]); setNewConv(true) }}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200">
            Nouvelle conversation
          </button>
          <button onClick={() => setShowHistory(!showHistory)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
            {showHistory ? 'Masquer' : 'Historique'}
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-semibold text-slate-500 mb-2">Suggestions de questions :</p>
          <div className="flex flex-wrap gap-2">
            {history.map((s, i) => (
              <button key={i} onClick={() => { setConvId(null); startChat(s); setShowHistory(false) }}
                className="text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border hover:border-primary-300 hover:text-primary-700 text-slate-600 dark:text-slate-300 text-left flex items-center gap-1">
                <ChevronRight size={12} className="text-slate-400" />{s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-xl overflow-hidden" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              <Bot size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Posez une question à l'assistant réglementaire</p>
              <p className="text-xs mt-1">Ex: "Quels agréments expirent bientôt ?"</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1"><Bot size={14} className="text-primary-600" /></div>}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-white dark:bg-slate-700 border text-slate-800 dark:text-slate-200 rounded-bl-md'
              }`}>
                {m.message}
              </div>
              {m.role === 'user' && <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1"><User size={14} className="text-slate-600" /></div>}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center"><Bot size={14} className="text-primary-600" /></div>
              <div className="bg-white dark:bg-slate-700 border px-4 py-2.5 rounded-2xl text-sm text-slate-500">Reflexion...</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-3 border-t bg-white dark:bg-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Posez votre question sur la réglementation..."
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
