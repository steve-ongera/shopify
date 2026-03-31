import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { productAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    productAPI.search(q).then(data => {
      setResults(Array.isArray(data) ? data : (data.results || []))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [q])

  return (
    <div className="search-page">
      <div className="page-header">
        <h1 className="page-title"><i className="bi bi-search" /> Search Results</h1>
        {q && <p className="search-query-label">Results for "<strong>{q}</strong>"</p>}
      </div>
      {!q ? (
        <div className="empty-state">
          <i className="bi bi-search" />
          <h3>Enter a search term above to get started</h3>
        </div>
      ) : loading ? (
        <div className="products-grid">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="product-card skeleton" />)}
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-emoji-frown" />
          <h3>No results for "{q}"</h3>
          <p>Try different keywords or browse our categories.</p>
          <Link to="/store" className="btn-primary"><i className="bi bi-grid" /> Browse All Products</Link>
        </div>
      ) : (
        <>
          <p className="search-results-count">{results.length} product{results.length !== 1 ? 's' : ''} found</p>
          <div className="products-grid">
            {results.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  )
}