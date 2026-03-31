import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { useFlash } from '../context/FlashContext'
import { getImageUrl, formatPrice } from '../components/ProductCard'

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'ready_for_pickup', 'delivered']
const STEP_LABELS = { pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', ready_for_pickup: 'Ready for Pickup', delivered: 'Delivered' }
const STEP_ICONS = { pending: 'bi-clock', confirmed: 'bi-check-circle', processing: 'bi-gear', shipped: 'bi-truck', ready_for_pickup: 'bi-geo-alt', delivered: 'bi-bag-check' }

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const { showFlash } = useFlash()
  const navigate = useNavigate()

  useEffect(() => {
    orderAPI.detail(id).then(setOrder).catch(() => {
      showFlash('Order not found.', 'error')
      navigate('/account/orders')
    }).finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      const data = await orderAPI.cancel(id)
      showFlash(data.message, 'success')
      const updated = await orderAPI.detail(id)
      setOrder(updated)
    } catch (err) {
      showFlash(err.error || 'Cannot cancel this order.', 'error')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!order) return null

  const stepIndex = STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="order-detail-page">
      <nav className="breadcrumb-nav">
        <Link to="/account">Account</Link>
        <i className="bi bi-chevron-right" />
        <Link to="/account/orders">Orders</Link>
        <i className="bi bi-chevron-right" />
        <span>{order.order_number}</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Order {order.order_number}</h1>
          <span className="order-date-label">
            Placed on {new Date(order.created_at).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        {['pending', 'confirmed'].includes(order.status) && (
          <button className="btn-danger" onClick={handleCancel} disabled={cancelling}>
            <i className="bi bi-x-circle" /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Progress Tracker */}
      {!isCancelled ? (
        <div className="order-tracker">
          {STEPS.map((step, i) => (
            <div key={step} className={`tracker-step ${i <= stepIndex ? 'done' : ''} ${i === stepIndex ? 'current' : ''}`}>
              <div className="tracker-circle">
                <i className={`bi ${STEP_ICONS[step]}`} />
              </div>
              <span className="tracker-label">{STEP_LABELS[step]}</span>
              {i < STEPS.length - 1 && <div className={`tracker-line ${i < stepIndex ? 'done' : ''}`} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="cancelled-banner">
          <i className="bi bi-x-circle-fill" /> This order has been cancelled.
        </div>
      )}

      <div className="order-detail-layout">
        {/* Left: Items */}
        <div className="order-detail-main">
          <div className="order-detail-card">
            <h3 className="card-title"><i className="bi bi-bag" /> Order Items</h3>
            <div className="order-items-list">
              {order.items?.map(item => (
                <div key={item.id} className="order-detail-item">
                  <img src={getImageUrl(item.product_image)} alt={item.product_name}
                    className="order-detail-item-img" onError={e => e.target.src = '/placeholder.jpg'} />
                  <div className="order-detail-item-info">
                    <Link to={`/products/${item.product_slug}`} className="order-detail-item-name">
                      {item.product_name}
                    </Link>
                    <span className="order-detail-item-unit">{formatPrice(item.unit_price)} × {item.quantity}</span>
                  </div>
                  <span className="order-detail-item-total">{formatPrice(item.total_price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-detail-card">
            <h3 className="card-title"><i className="bi bi-geo-alt-fill" /> Pickup Information</h3>
            {order.pickup_station ? (
              <div className="pickup-detail">
                <div className="info-row"><span className="info-label">Station</span><span>{order.pickup_station.name}</span></div>
                <div className="info-row"><span className="info-label">County</span><span>{order.pickup_station.county}</span></div>
                <div className="info-row"><span className="info-label">Address</span><span>{order.pickup_station.address}</span></div>
                <div className="info-row"><span className="info-label">Hours</span><span>{order.pickup_station.operating_hours}</span></div>
                {order.pickup_station.phone && (
                  <div className="info-row"><span className="info-label">Phone</span><span>{order.pickup_station.phone}</span></div>
                )}
              </div>
            ) : <p>No pickup station info.</p>}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="order-detail-sidebar">
          <div className="order-detail-card">
            <h3 className="card-title"><i className="bi bi-receipt" /> Payment Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="summary-row"><span>Delivery Fee</span><span>{formatPrice(order.delivery_fee)}</span></div>
            <div className="summary-divider" />
            <div className="summary-row summary-total"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            <div className="summary-row">
              <span>Payment</span>
              <span className={`payment-badge ${order.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                <i className={`bi ${order.payment_status === 'paid' ? 'bi-check-circle-fill' : 'bi-clock'}`} />
                {order.payment_status}
              </span>
            </div>
            <div className="summary-row"><span>Method</span><span>{order.payment_method === 'mpesa' ? 'M-Pesa' : 'Cash on Pickup'}</span></div>
            {order.mpesa_transaction_id && (
              <div className="summary-row"><span>Mpesa Ref</span><span className="mpesa-ref">{order.mpesa_transaction_id}</span></div>
            )}
          </div>

          {order.notes && (
            <div className="order-detail-card">
              <h3 className="card-title"><i className="bi bi-chat-text" /> Order Notes</h3>
              <p className="order-notes">{order.notes}</p>
            </div>
          )}

          <Link to="/store" className="btn-secondary btn-block">
            <i className="bi bi-bag" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}