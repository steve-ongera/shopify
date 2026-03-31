import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useFlash } from '../context/FlashContext'
import { categoryAPI } from '../services/api'

function FlashMessages() {
  const { messages, dismiss } = useFlash()
  if (!messages.length) return null
  return (
    <div className="flash-container">
      {messages.map(msg => (
        <div key={msg.id} className={`flash-message flash-${msg.type}`}>
          <span>
            {msg.type === 'success' && <i className="bi bi-check-circle-fill me-2" />}
            {msg.type === 'error' && <i className="bi bi-exclamation-triangle-fill me-2" />}
            {msg.type === 'info' && <i className="bi bi-info-circle-fill me-2" />}
            {msg.text}
          </span>
          <button onClick={() => dismiss(msg.id)} className="flash-close"><i className="bi bi-x" /></button>
        </div>
      ))}
    </div>
  )
}

function Navbar({ onMenuClick, categories }) {
  const { user, logout, isAuthenticated } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropRef = useRef(null)
  const location = useLocation()

  useEffect(() => { setSearch('') }, [location])

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <header className="navbar-wrapper">
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-inner">
          <span><i className="bi bi-geo-alt-fill" /> Free pickup across Kenya</span>
          <span><i className="bi bi-telephone-fill" /> +254 700 000 000</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Left: hamburger + logo */}
          <div className="nav-left">
            <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
              <i className="bi bi-list" />
            </button>
            <Link to="/" className="nav-logo">
              <span className="logo-icon"><i className="bi bi-bag-heart-fill" /></span>
              <span className="logo-text">Shopify<span className="logo-ke">.ke</span></span>
            </Link>
          </div>

          {/* Center: search (desktop) */}
          <div className="nav-search">
            <form onSubmit={handleSearch} className="search-form">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <i className="bi bi-search" />
              </button>
            </form>
          </div>

          {/* Right: actions */}
          <div className="nav-actions">
            <button className="icon-btn mobile-search-btn" onClick={() => setSearchOpen(!searchOpen)}>
              <i className="bi bi-search" />
            </button>

            {isAuthenticated ? (
              <div className="user-dropdown" ref={dropRef}>
                <button className="icon-btn user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <i className="bi bi-person-circle" />
                  <span className="user-name-label">{user?.first_name}</span>
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu-custom">
                    <Link to="/account" onClick={() => setDropdownOpen(false)}><i className="bi bi-person" /> My Account</Link>
                    <Link to="/account/orders" onClick={() => setDropdownOpen(false)}><i className="bi bi-box-seam" /> My Orders</Link>
                    <hr />
                    <button onClick={() => { logout(); setDropdownOpen(false) }}>
                      <i className="bi bi-box-arrow-right" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="icon-btn">
                <i className="bi bi-person" />
                <span className="nav-label">Login</span>
              </Link>
            )}

            <Link to="/cart" className="icon-btn cart-btn">
              <i className="bi bi-cart2" />
              {cart.total_items > 0 && <span className="cart-badge">{cart.total_items}</span>}
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="mobile-search-bar">
            <form onSubmit={handleSearch} className="search-form">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-btn"><i className="bi bi-search" /></button>
            </form>
          </div>
        )}

        {/* Category nav */}
        <div className="cat-nav">
          <div className="cat-nav-inner">
            <Link to="/store" className="cat-nav-link"><i className="bi bi-grid-3x3-gap" /> All Products</Link>
            {categories.map(cat => (
              <Link key={cat.slug} to={`/category/${cat.slug}`} className="cat-nav-link">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

function Sidebar({ open, onClose, categories }) {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
      onClose()
    }
  }

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="nav-logo" onClick={onClose}>
            <span className="logo-icon"><i className="bi bi-bag-heart-fill" /></span>
            <span className="logo-text">Shopify<span className="logo-ke">.ke</span></span>
          </Link>
          <button className="sidebar-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>

        <div className="sidebar-search">
          <form onSubmit={handleSearch} className="search-form">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="search-input" />
            <button type="submit" className="search-btn"><i className="bi bi-search" /></button>
          </form>
        </div>

        {isAuthenticated && (
          <div className="sidebar-user">
            <i className="bi bi-person-circle sidebar-user-icon" />
            <div>
              <div className="sidebar-user-name">{user?.first_name} {user?.last_name}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Shop By Category</div>
          <Link to="/store" className="sidebar-link" onClick={onClose}><i className="bi bi-grid-3x3-gap" /> All Products</Link>
          {categories.map(cat => (
            <Link key={cat.slug} to={`/category/${cat.slug}`} className="sidebar-link" onClick={onClose}>
              <i className="bi bi-tag" /> {cat.name}
              <span className="sidebar-badge">{cat.product_count}</span>
            </Link>
          ))}
          <div className="sidebar-divider" />
          <div className="sidebar-section-label">Account</div>
          {isAuthenticated ? (
            <>
              <Link to="/account" className="sidebar-link" onClick={onClose}><i className="bi bi-person" /> My Account</Link>
              <Link to="/account/orders" className="sidebar-link" onClick={onClose}><i className="bi bi-box-seam" /> My Orders</Link>
              <Link to="/cart" className="sidebar-link" onClick={onClose}><i className="bi bi-cart2" /> Cart</Link>
              <button className="sidebar-link sidebar-logout" onClick={() => { logout(); onClose() }}>
                <i className="bi bi-box-arrow-right" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="sidebar-link" onClick={onClose}><i className="bi bi-box-arrow-in-right" /> Login</Link>
              <Link to="/register" className="sidebar-link" onClick={onClose}><i className="bi bi-person-plus" /> Register</Link>
            </>
          )}
        </nav>
      </aside>
    </>
  )
}

function Footer({ categories }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col">
          <div className="footer-logo">
            <i className="bi bi-bag-heart-fill" /> Shopify.ke
          </div>
          <p className="footer-desc">Kenya's trusted online marketplace. Shop quality products and pick up at a station near you.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><i className="bi bi-facebook" /></a>
            <a href="#" aria-label="Instagram"><i className="bi bi-instagram" /></a>
            <a href="#" aria-label="Twitter"><i className="bi bi-twitter-x" /></a>
            <a href="#" aria-label="WhatsApp"><i className="bi bi-whatsapp" /></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            {categories.slice(0, 6).map(cat => (
              <li key={cat.slug}><Link to={`/category/${cat.slug}`}>{cat.name}</Link></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li><Link to="/store">Shop Now</Link></li>
            <li><Link to="/account/orders">Track Order</Link></li>
            <li><a href="#">Returns Policy</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Pickup Stations</h4>
          <ul>
            <li><i className="bi bi-geo-alt" /> Shanzu TTC, Mombasa</li>
            <li><i className="bi bi-geo-alt" /> Bamburi, Mombasa</li>
            <li><i className="bi bi-geo-alt" /> Nairobi CBD</li>
            <li><i className="bi bi-geo-alt" /> Westlands, Nairobi</li>
            <li><i className="bi bi-geo-alt" /> Kisumu CBD</li>
          </ul>
          <div className="footer-payment">
            <span><i className="bi bi-phone" /> M-Pesa</span>
            <span><i className="bi bi-cash" /> Cash</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Shopify Kenya. All rights reserved.</span>
        <span>Built with <i className="bi bi-heart-fill" style={{ color: '#e53e3e' }} /> in Kenya</span>
      </div>
    </footer>
  )
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    categoryAPI.list().then(data => {
      setCategories(data.results || data || [])
    }).catch(() => {})
  }, [])

  return (
    <div className="app-wrapper">
      <FlashMessages />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} categories={categories} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} categories={categories} />
      <main className="main-content">{children}</main>
      <Footer categories={categories} />
    </div>
  )
}