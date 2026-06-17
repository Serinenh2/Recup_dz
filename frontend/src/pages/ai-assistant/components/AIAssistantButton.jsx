import { useState } from 'react'
import { Bot, X, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AIAssistantButton({ context, entityId, entityLabel }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleClick = () => {
    if (context) {
      navigate('/ai-assistant', { state: { context, entityId, entityLabel } })
    } else {
      navigate('/ai-assistant')
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all z-40 flex items-center justify-center animate-pulse"
        title="Assistant Réglementaire"
      >
        <Bot size={24} />
      </button>
    </>
  )
}