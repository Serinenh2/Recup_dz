import { useState } from 'react'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { aiConversationsAPI } from '../api'

export default function ContextualAssistant({ context, entityId, entityLabel }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [convId, setConvId] = useState(null)

  const handleAsk = async () => {
    if (!input.trim() && !context) return
    
    setLoading(true)
    const question = input || `Analyser ${entityLabel || context}`
    
    try {
      let response
      if (convId) {
        response = await aiConversationsAPI.sendMessage(convId, { message: question })
        setMessages(prev => [...prev, { role: 'user', message: question }, { role: 'assistant', message: response.data.reponse }])
      } else {
        response = await aiConversationsAPI.analyseContextuelle({
          contexte: context,
          entite_id: entityId,
        })
        const cid = response.data.conversation_id || Date.now()
        setConvId(cid)
        setMessages([
          { role: 'assistant', message: response.data.reponse || response.data.suggestions || 'Analyse effectuée' }
        ])
      }
      setInput('')
    } catch {
      setMessages(prev => [...prev, { role: 'user', message: question }, { role: 'assistant', message: 'Erreur de connexion au serveur IA.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAsk = async (question) => {
    setInput('')
    setLoading(true)
    try {
      const response = await aiConversationsAPI.analyseContextuelle({
        contexte: context,
        entite_id: entityId,
        question,
      })
      setMessages([
        { role: 'assistant', message: response.data.reponse || response.data.suggestions || 'Analyse effectuée' }
      ])
    } catch {
      setMessages([{ role: 'assistant', message: 'Erreur de connexion au serveur IA.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all z-40 flex items-center justify-center"
        title={`Assistant pour ${entityLabel || context}`}
      >
        <Bot size={20} />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col" style={{ height: '400px' }}>
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Assistant Réglementaire</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700">
              <X size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <Bot size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">Demandez de l'aide sur {entityLabel || context}</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Bot size={12} className="text-primary-600" />
                  </div>
                )}
                <div className={`max-w-[75%] px-3 py-2 rounded-lg text-xs whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}>
                  {m.message}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot size={12} className="text-primary-600" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg text-xs text-slate-500">
                  Réflexion...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Question sur ${entityLabel || 'ce contexte'}...`}
                className="flex-1 px-3 py-2 rounded-lg border text-xs"
                disabled={loading}
              />
              <button
                onClick={handleAsk}
                disabled={loading || !input.trim()}
                className="px-3 rounded-lg bg-primary-600 text-white disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}