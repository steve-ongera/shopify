import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { FlashProvider } from './context/FlashContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import OrderPage from './pages/OrderPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <FlashProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/order" element={
                  <ProtectedRoute><OrderPage /></ProtectedRoute>
                } />
                <Route path="/account" element={
                  <ProtectedRoute><AccountPage /></ProtectedRoute>
                } />
                <Route path="/account/orders" element={
                  <ProtectedRoute><OrdersPage /></ProtectedRoute>
                } />
                <Route path="/account/orders/:id" element={
                  <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
                } />
              </Routes>
            </Layout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </FlashProvider>
  )
}