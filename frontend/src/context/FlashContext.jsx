import { createContext, useContext, useState, useCallback } from 'react'

const FlashContext = createContext(null)

export const FlashProvider = ({ children }) => {
  const [messages, setMessages] = useState([])

  const showFlash = useCallback((text, type = 'info') => {
    const id = Date.now()
    setMessages(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id) => setMessages(prev => prev.filter(m => m.id !== id))

  return (
    <FlashContext.Provider value={{ messages, showFlash, dismiss }}>
      {children}
    </FlashContext.Provider>
  )
}

export const useFlash = () => useContext(FlashContext)