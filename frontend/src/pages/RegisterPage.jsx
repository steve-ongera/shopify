import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', phone: '', password: '', password_confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setErrors(typeof err === 'object' ? err : { non_field_errors: ['Registration failed.'] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <Link to="/" className="auth-logo"><i className="bi bi-bag-heart-fill" /> Shopify.ke</Link>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join thousands of shoppers across Kenya.</p>
        </div>
        {errors.non_field_errors && (
          <div className="form-error-banner"><i className="bi bi-exclamation-triangle-fill" /> {errors.non_field_errors[0]}</div>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <div className="input-icon-wrap">
                <i className="bi bi-person input-icon" />
                <input type="text" name="first_name" value={form.first_name} onChange={set} placeholder="John" className={`form-input with-icon ${errors.first_name ? 'error' : ''}`} required />
              </div>
              {errors.first_name && <span className="field-error">{errors.first_name[0]}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <div className="input-icon-wrap">
                <i className="bi bi-person input-icon" />
                <input type="text" name="last_name" value={form.last_name} onChange={set} placeholder="Doe" className={`form-input with-icon ${errors.last_name ? 'error' : ''}`} required />
              </div>
              {errors.last_name && <span className="field-error">{errors.last_name[0]}</span>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <i className="bi bi-envelope input-icon" />
              <input type="email" name="email" value={form.email} onChange={set} placeholder="you@email.com" className={`form-input with-icon ${errors.email ? 'error' : ''}`} required />
            </div>
            {errors.email && <span className="field-error">{errors.email[0]}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-icon-wrap">
              <i className="bi bi-telephone input-icon" />
              <input type="tel" name="phone" value={form.phone} onChange={set} placeholder="0712345678" className="form-input with-icon" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <i className="bi bi-lock input-icon" />
              <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={set}
                placeholder="Min. 6 characters" className={`form-input with-icon ${errors.password ? 'error' : ''}`} required />
              <button type="button" className="show-pass-btn" onClick={() => setShowPass(!showPass)}>
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password[0]}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-icon-wrap">
              <i className="bi bi-lock-fill input-icon" />
              <input type="password" name="password_confirm" value={form.password_confirm} onChange={set}
                placeholder="Repeat your password" className={`form-input with-icon ${errors.password_confirm ? 'error' : ''}`} required />
            </div>
            {errors.password_confirm && <span className="field-error">{errors.password_confirm[0]}</span>}
          </div>
          <button type="submit" className="btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="spinner-sm" /> Creating Account...</> : <><i className="bi bi-person-plus" /> Create Account</>}
          </button>
        </form>
        <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  )
}