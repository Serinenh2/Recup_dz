/**
 * DateInput — champ de date avec format JJ/MM/AAAA
 * Stocke en format YYYY-MM-DD pour Django
 */
import { useState, useEffect } from 'react'

function toDisplay(iso) {
  // YYYY-MM-DD → JJ/MM/AAAA
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

function toISO(display) {
  // JJ/MM/AAAA → YYYY-MM-DD
  if (!display) return ''
  const parts = display.split('/')
  if (parts.length !== 3) return ''
  const [dd, mm, yyyy] = parts
  if (yyyy.length !== 4 || isNaN(dd) || isNaN(mm) || isNaN(yyyy)) return ''
  return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`
}

function isValidDate(display) {
  if (!display) return true // empty is ok (optional field)
  const parts = display.split('/')
  if (parts.length !== 3) return false
  const [dd, mm, yyyy] = parts
  if (yyyy.length !== 4) return false
  const d = parseInt(dd), m = parseInt(mm), y = parseInt(yyyy)
  if (isNaN(d)||isNaN(m)||isNaN(y)) return false
  if (d < 1 || d > 31) return false
  if (m < 1 || m > 12) return false
  if (y < 1900 || y > 2100) return false
  return true
}

export default function DateInput({ value, onChange, placeholder = 'JJ/MM/AAAA', required, className = '' }) {
  const [display, setDisplay] = useState(() => toDisplay(value))
  const [error,   setError]   = useState('')

  useEffect(() => {
    setDisplay(toDisplay(value))
  }, [value])

  const handleChange = (e) => {
    let raw = e.target.value

    // Auto-insert slashes
    raw = raw.replace(/[^0-9/]/g, '')
    if (raw.length === 2 && display.length === 1) raw = raw + '/'
    if (raw.length === 5 && display.length === 4) raw = raw + '/'
    if (raw.length > 10) raw = raw.slice(0, 10)

    setDisplay(raw)

    if (!raw) {
      setError('')
      onChange('')
      return
    }

    if (raw.length === 10) {
      if (isValidDate(raw)) {
        setError('')
        onChange(toISO(raw))
      } else {
        setError('Date invalide')
        onChange('')
      }
    } else {
      setError('')
      onChange('')
    }
  }

  const handleBlur = () => {
    if (display && display.length < 10) {
      setError('Format: JJ/MM/AAAA')
    } else if (display && !isValidDate(display)) {
      setError('Date invalide')
    } else {
      setError('')
    }
  }

  return (
    <div>
      <input
        type="text"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={10}
        className={`input ${error ? 'border-red-400' : ''} ${className}`}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
