import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      if (typeof err === 'object') setErrors(err)
      else setErrors({ non_field_errors: ['Login failed. Please try again.'] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <i className="bi bi-bag-heart-fill" /> Shopify.ke
          </Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to continue shopping.</p>
        </div>
        {errors.non_field_errors && (
          <div className="form-error-banner">
            <i className="bi bi-exclamation-triangle-fill" /> {errors.non_field_errors[0]}
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <i className="bi bi-envelope input-icon" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com" className={`form-input with-icon ${errors.email ? 'error' : ''}`} required autoFocus />
            </div>
            {errors.email && <span className="field-error">{errors.email[0]}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">
              Password <a href="#" className="forgot-link">Forgot password?</a>
            </label>
            <div className="input-icon-wrap">
              <i className="bi bi-lock input-icon" />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Your password" className={`form-input with-icon ${errors.password ? 'error' : ''}`} required />
              <button type="button" className="show-pass-btn" onClick={() => setShowPass(!showPass)}>
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="spinner-sm" /> Signing in...</> : <><i className="bi bi-box-arrow-in-right" /> Sign In</>}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one free</Link>
        </div>
      </div>
    </div>
  )
}