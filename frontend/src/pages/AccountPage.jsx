import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AccountPage() {
  const { user, updateProfile, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(form)
      setEditing(false)
    } catch {} finally { setLoading(false) }
  }

  return (
    <div className="account-page">
      <div className="page-header">
        <h1 className="page-title"><i className="bi bi-person-circle" /> My Account</h1>
      </div>

      <div className="account-layout">
        {/* Sidebar */}
        <aside className="account-sidebar">
          <div className="account-avatar">
            <div className="avatar-circle">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <div className="account-name">{user?.first_name} {user?.last_name}</div>
              <div className="account-email">{user?.email}</div>
            </div>
          </div>
          <nav className="account-nav">
            <Link to="/account" className="account-nav-link active"><i className="bi bi-person" /> Profile</Link>
            <Link to="/account/orders" className="account-nav-link"><i className="bi bi-box-seam" /> My Orders</Link>
            <button onClick={logout} className="account-nav-link account-logout">
              <i className="bi bi-box-arrow-right" /> Logout
            </button>
          </nav>
        </aside>

        {/* Main */}
        <div className="account-main">
          <div className="account-card">
            <div className="account-card-header">
              <h3><i className="bi bi-person-vcard" /> Personal Information</h3>
              {!editing && (
                <button className="btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  <i className="bi bi-pencil" /> Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                      className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                      className="form-input" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="form-input" placeholder="0712345678" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : <><i className="bi bi-check" /> Save Changes</>}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-row"><span className="info-label">Full Name</span><span>{user?.first_name} {user?.last_name}</span></div>
                <div className="info-row"><span className="info-label">Email</span><span>{user?.email}</span></div>
                <div className="info-row"><span className="info-label">Phone</span><span>{user?.phone || '—'}</span></div>
                <div className="info-row"><span className="info-label">Member Since</span>
                  <span>{new Date(user?.date_joined).toLocaleDateString('en-KE', { year: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            )}
          </div>

          <div className="account-quick-links">
            <Link to="/account/orders" className="quick-link-card">
              <i className="bi bi-box-seam" />
              <span>My Orders</span>
              <i className="bi bi-arrow-right" />
            </Link>
            <Link to="/cart" className="quick-link-card">
              <i className="bi bi-cart2" />
              <span>My Cart</span>
              <i className="bi bi-arrow-right" />
            </Link>
            <Link to="/store" className="quick-link-card">
              <i className="bi bi-grid-3x3-gap" />
              <span>Browse Store</span>
              <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}