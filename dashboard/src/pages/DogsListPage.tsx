import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDogs } from '../hooks/useDogs'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'
import { calcAge } from '../lib/calcAge'

export function DogsListPage() {
  const { dogs, loading, softDelete } = useDogs()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = dogs.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="empty-state">Wird geladen…</div>

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Hunde</h1>
        <Link to="/hunde/neu" className="btn btn-primary">+ Neu</Link>
      </div>

      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Nach Name suchen…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">Keine Hunde gefunden.</div>
      ) : (
        <div className="card-list">
          {filtered.map(dog => (
            <Link key={dog.id} to={`/hunde/${dog.id}`} className="entity-card">
              {dog.foto_url ? (
                <img src={dog.foto_url} alt={dog.name} className="entity-card-thumb" />
              ) : (
                <div className="entity-card-thumb">🐕</div>
              )}
              <div className="entity-card-info">
                <div className="entity-card-name">{dog.name}</div>
                <div className="entity-card-sub">
                  {dog.geschlecht} · {calcAge(dog.geburtsdatum)}
                </div>
              </div>
              <span className={`badge ${dog.veroeffentlicht ? 'badge-live' : 'badge-hidden'}`}>
                {dog.veroeffentlicht ? 'Live' : 'Versteckt'}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={e => { e.preventDefault(); setDeleteId(dog.id) }}
              >
                Löschen
              </button>
            </Link>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmDeleteDialog
          onConfirm={async () => { await softDelete(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  )
}
