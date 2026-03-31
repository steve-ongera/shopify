import { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../services/api'
import { useAuth } from './AuthContext'
import { useFlash } from './FlashContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total_items: 0, subtotal: 0 })
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const { showFlash } = useFlash()

  useEffect(() => {
    if (isAuthenticated) fetchCart()
    else setCart({ items: [], total_items: 0, subtotal: 0 })
  }, [isAuthenticated])

  const fetchCart = async () => {
    try {
      const data = await cartAPI.get()
      setCart(data)
    } catch {}
  }

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true)
    try {
      const data = await cartAPI.add({ product_id: productId, quantity })
      setCart(data.cart)
      showFlash(data.message, 'success')
    } catch (err) {
      showFlash(err.error || 'Failed to add to cart.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (itemId, quantity) => {
    try {
      await cartAPI.updateItem({ item_id: itemId, quantity })
      await fetchCart()
    } catch {}
  }

  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId)
      await fetchCart()
      showFlash('Item removed from cart.', 'info')
    } catch {}
  }

  const clearCart = async () => {
    try {
      await cartAPI.clear()
      setCart({ items: [], total_items: 0, subtotal: 0 })
    } catch {}
  }

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)