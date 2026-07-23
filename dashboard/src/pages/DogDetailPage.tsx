import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDog, useDogs } from '../hooks/useDogs'
import { useHealthChecks } from '../hooks/useHealthChecks'
import { useExams } from '../hooks/useExams'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'
import { calcAge } from '../lib/calcAge'

type Tab = 'uebersicht' | 'gesundheit' | 'pruefungen'

const EMPTY_HC = { kategorie: '', ergebnis: '', datum: '', tierarzt: '', notiz: '' }
const EMPTY_EX = { art: '', ergebnis: '', datum: '', ort: '', notiz: '' }

export function DogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { dog, loading } = useDog(id)
  const { softDelete } = useDogs()
  const { items: checks, create: createCheck, softDelete: deleteCheck } = useHealthChecks(id)
  const { items: exams, create: createExam, softDelete: deleteExam } = useExams(id)

  const [tab, setTab] = useState<Tab>('uebersicht')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showHcForm, setShowHcForm] = useState(false)
  const [hcForm, setHcForm] = useState(EMPTY_HC)
  const [showExForm, setShowExForm] = useState(false)
  const [exForm, setExForm] = useState(EMPTY_EX)

  if (loading) return <div className="empty-state">Wird geladen…</div>
  if (!dog) return <div className="empty-state">Hund nicht gefunden.</div>

  const submitHc = async (e: FormEvent) => {
    e.preventDefault()
    await createCheck({ ...hcForm, hund_id: id! })
    setHcForm(EMPTY_HC)
    setShowHcForm(false)
  }

  const submitEx = async (e: FormEvent) => {
    e.preventDefault()
    await createExam({ ...exForm, hund_id: id! })
    setExForm(EMPTY_EX)
    setShowExForm(false)
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{dog.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/hunde/${id}/bearbeiten`} className="btn btn-ghost btn-sm">
            Bearbeiten
          </Link>
          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
            Löschen
          </button>
        </div>
      </div>

      <div className="tab-bar">
        {(['uebersicht', 'gesundheit', 'pruefungen'] as Tab[]).map(t => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'uebersicht' ? 'Übersicht' : t === 'gesundheit' ? 'Gesundheit' : 'Prüfungen'}
          </button>
        ))}
      </div>

      {tab === 'uebersicht' && (
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {dog.foto_url && (
            <img
              src={dog.foto_url}
              alt={dog.name}
              style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InfoRow label="Alter" value={calcAge(dog.geburtsdatum)} />
            <InfoRow label="Geburtsdatum" value={dog.geburtsdatum} />
            <InfoRow label="Geschlecht" value={dog.geschlecht} />
            <InfoRow label="Status" value={dog.veroeffentlicht ? 'Veröffentlicht' : 'Nicht veröffentlicht'} />
            {(dog.mutter_extern_name || dog.mutter_id) && (
              <InfoRow label="Mutter" value={dog.mutter_extern_name ?? dog.mutter_id ?? '—'} />
            )}
            {(dog.vater_extern_name || dog.vater_id) && (
              <InfoRow label="Vater" value={dog.vater_extern_name ?? dog.vater_id ?? '—'} />
            )}
          </div>
        </div>
      )}

      {tab === 'gesundheit' && (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowHcForm(v => !v)}>
              {showHcForm ? 'Abbrechen' : '+ Eintrag'}
            </button>
          </div>
          {showHcForm && (
            <form
              onSubmit={submitHc}
              style={{ background: 'var(--color-surface)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div className="form-grid">
                <div className="field">
                  <label className="field-label">Kategorie *</label>
                  <input className="field-input" value={hcForm.kategorie} onChange={e => setHcForm(p => ({ ...p, kategorie: e.target.value }))} required placeholder="z. B. HD-Röntgen" />
                </div>
                <div className="field">
                  <label className="field-label">Ergebnis *</label>
                  <input className="field-input" value={hcForm.ergebnis} onChange={e => setHcForm(p => ({ ...p, ergebnis: e.target.value }))} required placeholder="z. B. HD-A" />
                </div>
                <div className="field">
                  <label className="field-label">Datum *</label>
                  <input className="field-input" type="date" value={hcForm.datum} onChange={e => setHcForm(p => ({ ...p, datum: e.target.value }))} required />
                </div>
                <div className="field">
                  <label className="field-label">Tierarzt</label>
                  <input className="field-input" value={hcForm.tierarzt} onChange={e => setHcForm(p => ({ ...p, tierarzt: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Notiz</label>
                <textarea className="field-input field-textarea" value={hcForm.notiz} onChange={e => setHcForm(p => ({ ...p, notiz: e.target.value }))} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-sm">Speichern</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowHcForm(false)}>Abbrechen</button>
              </div>
            </form>
          )}
          <div className="inline-list">
            {checks.length === 0 && <div className="empty-state">Noch keine Gesundheitschecks.</div>}
            {checks.map(c => (
              <div key={c.id} className="inline-row">
                <div className="inline-row-info">
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.kategorie} — {c.ergebnis}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                    {c.datum}{c.tierarzt ? ` · ${c.tierarzt}` : ''}
                  </div>
                  {c.notiz && <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{c.notiz}</div>}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteCheck(c.id)}>Löschen</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'pruefungen' && (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowExForm(v => !v)}>
              {showExForm ? 'Abbrechen' : '+ Eintrag'}
            </button>
          </div>
          {showExForm && (
            <form
              onSubmit={submitEx}
              style={{ background: 'var(--color-surface)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div className="form-grid">
                <div className="field">
                  <label className="field-label">Art *</label>
                  <input className="field-input" value={exForm.art} onChange={e => setExForm(p => ({ ...p, art: e.target.value }))} required placeholder="z. B. Wesenstest" />
                </div>
                <div className="field">
                  <label className="field-label">Ergebnis *</label>
                  <input className="field-input" value={exForm.ergebnis} onChange={e => setExForm(p => ({ ...p, ergebnis: e.target.value }))} required placeholder="z. B. Bestanden" />
                </div>
                <div className="field">
                  <label className="field-label">Datum *</label>
                  <input className="field-input" type="date" value={exForm.datum} onChange={e => setExForm(p => ({ ...p, datum: e.target.value }))} required />
                </div>
                <div className="field">
                  <label className="field-label">Ort / Verein</label>
                  <input className="field-input" value={exForm.ort} onChange={e => setExForm(p => ({ ...p, ort: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Notiz</label>
                <textarea className="field-input field-textarea" value={exForm.notiz} onChange={e => setExForm(p => ({ ...p, notiz: e.target.value }))} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-sm">Speichern</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowExForm(false)}>Abbrechen</button>
              </div>
            </form>
          )}
          <div className="inline-list">
            {exams.length === 0 && <div className="empty-state">Noch keine Prüfungen.</div>}
            {exams.map(ex => (
              <div key={ex.id} className="inline-row">
                <div className="inline-row-info">
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ex.art} — {ex.ergebnis}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                    {ex.datum}{ex.ort ? ` · ${ex.ort}` : ''}
                  </div>
                  {ex.notiz && <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{ex.notiz}</div>}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteExam(ex.id)}>Löschen</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDeleteDialog
          title="Hund löschen?"
          message={`"${dog.name}" wird in den Papierkorb verschoben.`}
          onConfirm={async () => { await softDelete(id!); navigate('/hunde') }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, fontSize: 14 }}>
      <span style={{ color: 'var(--color-muted)', minWidth: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{value}</span>
    </div>
  )
}
