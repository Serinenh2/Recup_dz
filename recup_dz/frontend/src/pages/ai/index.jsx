import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Bot, Send, MessageSquare, Plus, Trash2, AlertTriangle,
  Lightbulb, FileText, BarChart3, RefreshCw, X, Sparkles, Loader2
} from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const aiAPI = {
  getConversations:  ()         => api.get('/ai/conversations/'),
  createConversation:(data)     => api.post('/ai/conversations/', data),
  deleteConversation:(id)       => api.delete(`/ai/conversations/${id}/`),
  getMessages:       (convId)   => api.get(`/ai/messages/?conversation_id=${convId}`),
  sendMessage:       (convId, d)=> api.post(`/ai/conversations/${convId}/envoyer_message/`, d),
  getSuggestions:    ()         => api.get('/ai/conversations/suggestions/'),
  getAlerts:         ()         => api.get('/ai/alerts/'),
  getStats:          ()         => api.get('/ai/dashboard/statistiques/'),
}

function formatMarkdown(text) {
  if (!text) return ''
  let html = text
    .replace(/^### (.+)$/gm, '<h3 class="font-bold text-sm mt-3 mb-1 text-slate-900 dark:text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-base mt-4 mb-2 text-slate-900 dark:text-white">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-slate-700 dark:text-slate-300 list-disc">$1</li>')
    .replace(/^✅ (.+)$/gm, '<p class="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">✅ $1</p>')
    .replace(/^⚠️ (.+)$/gm, '<p class="text-amber-600 dark:text-amber-400 text-sm font-semibold">⚠️ $1</p>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>')
  return html
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'USER'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
        }`}>
          {isUser ? <MessageSquare size={14} /> : <Bot size={14} />}
        </div>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-md'
            : 'bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-slate-800 dark:text-slate-200 rounded-tl-md shadow-sm'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed">{msg.message}</p>
          ) : (
            <div
              className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.message) }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ConversationList({ conversations, activeId, onSelect, onDelete, onNew, loading }) {
  return (
    <div className="w-72 border-r border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-[#E2E8F0] dark:border-[#334155]">
        <button onClick={onNew} className="btn-primary w-full justify-center gap-2 text-sm py-2">
          <Plus size={14} /> Nouvelle conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="text-slate-400 animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Bot size={32} className="mx-auto mb-2 text-slate-200" />
            <p className="text-xs text-slate-400">Aucune conversation</p>
          </div>
        ) : (
          conversations.map(c => (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all ${
                activeId === c.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare size={14} className={`flex-shrink-0 ${
                activeId === c.id ? 'text-primary-600' : 'text-slate-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${
                  activeId === c.id ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {c.titre || 'Conversation'}
                </p>
                {c.contexte && (
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{c.contexte}</span>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(c.id) }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Suggestions({ onSelect }) {
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    aiAPI.getSuggestions().then(res => setSuggestions(res.data.suggestions || [])).catch(() => {})
  }, [])

  if (suggestions.length === 0) return null

  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
        <Sparkles size={12} /> Suggestions
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function StatsBar() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    aiAPI.getStats().then(res => setStats(res.data)).catch(() => {})
  }, [])

  if (!stats) return null

  const items = [
    { label: 'Questions', value: stats.questions_posees, color: 'text-primary-600' },
    { label: 'Conversations', value: stats.conversations_total, color: 'text-violet-600' },
    { label: 'Alertes non lues', value: stats.alertes_non_lues, color: 'text-amber-600' },
  ]

  return (
    <div className="flex gap-3 mb-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
          <span className={`text-lg font-black ${item.color}`}>{item.value}</span>
          <span className="text-[10px] text-slate-400 font-semibold leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const loadConversations = useCallback(async () => {
    try {
      const res = await aiAPI.getConversations()
      const data = res.data.results || res.data
      setConversations(Array.isArray(data) ? data : [])
    } catch { /* ignore */ }
    setLoadingConvs(false)
  }, [])

  useEffect(() => { loadConversations() }, [loadConversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async (convId) => {
    setLoadingMessages(true)
    try {
      const res = await aiAPI.getMessages(convId)
      const data = res.data.results || res.data
      setMessages(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Erreur chargement des messages')
    }
    setLoadingMessages(false)
  }

  const handleSelectConv = (convId) => {
    setActiveConvId(convId)
    loadMessages(convId)
  }

  const handleNewConv = async () => {
    setActiveConvId(null)
    setMessages([])
    inputRef.current?.focus()
  }

  const handleDeleteConv = async (convId) => {
    try {
      await aiAPI.deleteConversation(convId)
      setConversations(prev => prev.filter(c => c.id !== convId))
      if (activeConvId === convId) {
        setActiveConvId(null)
        setMessages([])
      }
      toast.success('Conversation supprimée')
    } catch {
      toast.error('Erreur suppression')
    }
  }

  const handleSend = async (text) => {
    const msg = (text || input).trim()
    if (!msg || sending) return
    setInput('')
    setSending(true)

    const userMsg = { id: Date.now(), role: 'USER', message: msg }
    setMessages(prev => [...prev, userMsg])

    try {
      let convId = activeConvId

      if (!convId) {
        const res = await aiAPI.createConversation({
          titre: msg.slice(0, 60) + (msg.length > 60 ? '...' : ''),
          contexte: 'GENERAL',
        })
        convId = res.data.id
        setActiveConvId(convId)
        await loadConversations()
      }

      const res = await aiAPI.sendMessage(convId, { message: msg })
      const botMsg = {
        id: Date.now() + 1,
        role: 'ASSISTANT',
        message: res.data.reponse,
      }
      setMessages(prev => [...prev, botMsg])

      if (!activeConvId) {
        await loadConversations()
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== userMsg.id))
      toast.error("Erreur lors de l'envoi")
    }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot size={24} className="text-violet-600" />
            Assistant IA Réglementaire
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Intelligence artificielle dédiée à la gestion des déchets — Loi 01-19
          </p>
        </div>
        <button onClick={loadConversations} className="btn-secondary btn-sm">
          <RefreshCw size={14} />
        </button>
      </div>

      <StatsBar />

      <div className="card flex overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
        <ConversationList
          conversations={conversations}
          activeId={activeConvId}
          onSelect={handleSelectConv}
          onDelete={handleDeleteConv}
          onNew={handleNewConv}
          loading={loadingConvs}
        />

        <div className="flex-1 flex flex-col">
          {loadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={24} className="text-slate-400 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                <Bot size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-1">Assistant Réglementaire RECUP-DZ</h3>
              <p className="text-sm text-slate-400 text-center max-w-md mb-6">
                Posez vos questions sur la réglementation des déchets, les agréments, la nomenclature, ou analysez vos BSD et opérations.
              </p>
              <Suggestions onSelect={handleSend} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {sending && (
                <div className="flex justify-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="text-violet-500 animate-spin" />
                        <span className="text-sm text-slate-500">Analyse en cours...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="p-3 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A]">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question (agréments, BSD, nomenclature, réglementation...)"
                className="input flex-1 resize-none min-h-[42px] max-h-[120px] text-sm py-2.5"
                rows={1}
                disabled={sending}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="btn-primary px-4 py-2.5 flex-shrink-0"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 px-1">
              Appuyez sur Entrée pour envoyer — Shift+Entrée pour un retour à la ligne
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
