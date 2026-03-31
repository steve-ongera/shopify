import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { orderAPI, pickupAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useFlash } from '../context/FlashContext'
import { getImageUrl, formatPrice } from '../components/ProductCard'

export default function OrderPage() {
  const [stations, setStations] = useState([])
  const [selectedStation, setSelectedStation] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const { cart, fetchCart } = useCart()
  const { user } = useAuth()
  const { showFlash } = useFlash()
  const navigate = useNavigate()

  useEffect(() => {
    pickupAPI.list().then(d => {
      setStations(d.results || d || [])
    }).catch(() => {})
    if (user?.phone) setMpesaPhone(user.phone)
  }, [])

  const station = stations.find(s => s.id == selectedStation)
  const deliveryFee = station ? parseFloat(station.delivery_fee) : 0
  const subtotal = parseFloat(cart.subtotal || 0)
  const total = subtotal + deliveryFee

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedStation) { showFlash('Please select a pickup station.', 'error'); return }
    if (paymentMethod === 'mpesa' && !mpesaPhone) { showFlash('Please enter your M-Pesa phone number.', 'error'); return }
    setLoading(true)
    try {
      const data = await orderAPI.create({
        pickup_station_id: selectedStation,
        payment_method: paymentMethod,
        mpesa_phone: mpesaPhone,
        notes,
      })
      await fetchCart()
      showFlash(data.message, 'success')
      navigate(`/account/orders/${data.order.id}`)
    } catch (err) {
      showFlash(err.error || 'Failed to place order. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!cart.items || cart.items.length === 0) return (
    <div className="order-page">
      <div className="empty-state large">
        <i className="bi bi-cart-x" />
        <h2>Your cart is empty</h2>
        <Link to="/store" className="btn-primary">Browse Products</Link>
      </div>
    </div>
  )

  return (
    <div className="order-page">
      <div className="page-header">
        <h1 className="page-title"><i className="bi bi-bag-check" /> Checkout</h1>
      </div>

      {/* Step indicator */}
      <div className="checkout-steps">
        {['Cart Review', 'Delivery & Payment', 'Confirm'].map((label, i) => (
          <div key={i} className={`checkout-step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
            <div className="step-circle">{step > i + 1 ? <i className="bi bi-check" /> : i + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        {/* Form */}
        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Cart Review */}
          <div className="checkout-section">
            <h3 className="checkout-section-title"><i className="bi bi-cart3" /> Your Items</h3>
            <div className="checkout-items">
              {cart.items.map(item => (
                <div key={item.id} className="checkout-item">
                  <img src={getImageUrl(item.product.image)} alt={item.product.name}
                    className="checkout-item-img" onError={e => e.target.src = '/placeholder.jpg'} />
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.product.name}</span>
                    <span className="checkout-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">{formatPrice(item.total_price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Station */}
          <div className="checkout-section">
            <h3 className="checkout-section-title"><i className="bi bi-geo-alt-fill" /> Select Pickup Station</h3>
            <div className="station-list">
              {stations.map(s => (
                <label key={s.id} className={`station-option ${selectedStation == s.id ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="station"
                    value={s.id}
                    checked={selectedStation == s.id}
                    onChange={() => setSelectedStation(s.id)}
                  />
                  <div className="station-option-content">
                    <div className="station-main">
                      <span className="station-name"><i className="bi bi-pin-map-fill" /> {s.name}</span>
                      <span className="station-fee">{formatPrice(s.delivery_fee)}</span>
                    </div>
                    <div className="station-meta">
                      <span><i className="bi bi-geo" /> {s.county} · {s.town}</span>
                      <span><i className="bi bi-clock" /> {s.operating_hours}</span>
                    </div>
                    <span className="station-address"><i className="bi bi-building" /> {s.address}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-section">
            <h3 className="checkout-section-title"><i className="bi bi-credit-card" /> Payment Method</h3>
            <div className="payment-methods">
              <label className={`payment-option ${paymentMethod === 'mpesa' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                <i className="bi bi-phone-fill" /> M-Pesa STK Push
                <span className="payment-badge">Recommended</span>
              </label>
              <label className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                <i className="bi bi-cash-coin" /> Cash on Pickup
              </label>
            </div>

            {paymentMethod === 'mpesa' && (
              <div className="mpesa-input-wrap">
                <label>M-Pesa Phone Number</label>
                <div className="phone-input-wrap">
                  <span className="phone-prefix">+254</span>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={e => setMpesaPhone(e.target.value)}
                    placeholder="7XX XXX XXX"
                    className="form-input"
                    required={paymentMethod === 'mpesa'}
                  />
                </div>
                <p className="input-hint"><i className="bi bi-info-circle" /> You will receive an STK push prompt to complete payment.</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="checkout-section">
            <h3 className="checkout-section-title"><i className="bi bi-chat-text" /> Order Notes (Optional)</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Special instructions for your order..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <button type="submit" className="btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? (
              <><span className="spinner-sm" /> Placing Order...</>
            ) : (
              <><i className="bi bi-bag-check-fill" /> Place Order · {formatPrice(total)}</>
            )}
          </button>
        </form>

        {/* Summary Sidebar */}
        <div className="checkout-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>{station ? formatPrice(deliveryFee) : 'Select station'}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {station && (
            <div className="selected-station-info">
              <h4><i className="bi bi-geo-alt-fill" /> Pickup at:</h4>
              <p><strong>{station.name}</strong></p>
              <p>{station.address}</p>
              <p><i className="bi bi-clock" /> {station.operating_hours}</p>
            </div>
          )}

          <div className="summary-security">
            <i className="bi bi-shield-lock-fill" /> Your order is safe & secure
          </div>
        </div>
      </div>
    </div>
  )
}