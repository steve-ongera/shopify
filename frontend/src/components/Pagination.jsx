export default function Pagination({ page, count, pageSize = 20, onPageChange }) {
  const totalPages = Math.ceil(count / pageSize)
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        <i className="bi bi-chevron-left" />
      </button>
      {pages.map((p, i) => (
        p === '...'
          ? <span key={i} className="page-ellipsis">…</span>
          : <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      <button className="page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  )
}