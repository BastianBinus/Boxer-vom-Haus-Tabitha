import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLitters, useLitter } from '../hooks/useLitters'
import { useDogs } from '../hooks/useDogs'
import { GalerieUpload } from '../components/GalerieUpload'
import type { TablesInsert } from '../types/database.types'

type VaterMode = 'db' | 'extern'

export function LitterFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const { litter, loading: litterLoading } = useLitter(id)
  const { create, update } = useLitters()
  const { dogs } = useDogs()

  const [savedId, setSavedId] = useState<string | null>(id ?? null)
  const [mutterId, setMutterId] = useState('')
  const [datum, setDatum] = useState('')
  const [anzahlRuden, setAnzahlRuden] = useState(0)
  const [anzahlHuendinnen, setAnzahlHuendinnen] = useState(0)
  const [vaterMode, setVaterMode] = useState<VaterMode>('extern')
  const [vaterId, setVaterId] = useState('')
  const [vaterExternName, setVaterExternName] = useState('')
  const [vaterExternZwinger, setVaterExternZwinger] = useState('')
  const [notiz, setNotiz] = useState('')
  const [inGalerie, setInGalerie] = useState(false)
  const [galerieBilder, setGalerieBilder] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!litter) return
    setMutterId(litter.mutter_id)
    setDatum(litter.datum)
    setAnzahlRuden(litter.anzahl_ruden)
    setAnzahlHuendinnen(litter.anzahl_huendinnen)
    setNotiz(litter.notiz ?? '')
    setInGalerie(litter.in_galerie)
    setGalerieBilder(Array.isArray(litter.galerie_bilder) ? (litter.galerie_bilder as string[]) : [])
    if (litter.vater_id) {
      setVaterMode('db')
      setVaterId(litter.vater_id)
    } else {
      setVaterMode('extern')
      setVaterExternName(litter.vater_extern_name ?? '')
      setVaterExternZwinger(litter.vater_extern_zwinger ?? '')
    }
  }, [litter])

  const huendinnen = dogs.filter(d => d.geschlecht === 'Hündin')
  const rueden = dogs.filter(d => d.geschlecht === 'Rüde')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload: TablesInsert<'wuerfe'> = {
        mutter_id: mutterId,
        datum,
        anzahl_ruden: anzahlRuden,
        anzahl_huendinnen: anzahlHuendinnen,
        notiz: notiz || null,
        vater_id: vaterMode === 'db' ? (vaterId || null) : null,
        vater_extern_name: vaterMode === 'extern' ? (vaterExternName || null) : null,
        vater_extern_zwinger: vaterMode === 'extern' ? (vaterExternZwinger || null) : null,
        in_galerie: inGalerie,
        galerie_bilder: galerieBilder.length > 0 ? galerieBilder : null,
      }
      if (isEdit && id) {
        await update(id, payload)
        navigate('/wuerfe')
      } else {
        const data = await create(payload)
        setSavedId(data.id)
        navigate(`/wuerfe/${data.id}/bearbeiten`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    }
    setSaving(false)
  }

  if (isEdit && litterLoading) return <div className="empty-state">Wird geladen…</div>

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Wurf bearbeiten' : 'Neuer Wurf'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-grid">
          <div className="field">
            <label className="field-label">Mutter *</label>
            <select className="field-input" value={mutterId} onChange={e => setMutterId(e.target.value)} required>
              <option value="">— auswählen —</option>
              {huendinnen.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Datum *</label>
            <input className="field-input" type="date" value={datum} onChange={e => setDatum(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field-label">Anzahl Rüden</label>
            <input className="field-input" type="number" min={0} value={anzahlRuden} onChange={e => setAnzahlRuden(Number(e.target.value))} />
          </div>
          <div className="field">
            <label className="field-label">Anzahl Hündinnen</label>
            <input className="field-input" type="number" min={0} value={anzahlHuendinnen} onChange={e => setAnzahlHuendinnen(Number(e.target.value))} />
          </div>
        </div>

        <fieldset>
          <legend>Vater</legend>
          <div className="radio-group" style={{ marginBottom: 12 }}>
            <label className="radio-label">
              <input type="radio" checked={vaterMode === 'db'} onChange={() => setVaterMode('db')} />
              In Datenbank
            </label>
            <label className="radio-label">
              <input type="radio" checked={vaterMode === 'extern'} onChange={() => setVaterMode('extern')} />
              Extern
            </label>
          </div>
          {vaterMode === 'db' ? (
            <select className="field-input" value={vaterId} onChange={e => setVaterId(e.target.value)}>
              <option value="">— auswählen —</option>
              {rueden.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          ) : (
            <div className="form-grid">
              <div className="field">
                <label className="field-label">Name</label>
                <input className="field-input" value={vaterExternName} onChange={e => setVaterExternName(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Zwinger</label>
                <input className="field-input" value={vaterExternZwinger} onChange={e => setVaterExternZwinger(e.target.value)} />
              </div>
            </div>
          )}
        </fieldset>

        <div className="field">
          <label className="field-label">Notiz</label>
          <textarea className="field-input field-textarea" value={notiz} onChange={e => setNotiz(e.target.value)} />
        </div>

        <div className="field">
          <label className="radio-label" style={{ gap: 10 }}>
            <input
              type="checkbox"
              checked={inGalerie}
              onChange={e => setInGalerie(e.target.checked)}
            />
            <span style={{ fontWeight: 600, fontSize: 14 }}>In Ehemaligengalerie anzeigen</span>
          </label>
        </div>

        <div className="field">
          <label className="field-label">Galeriebilder</label>
          <GalerieUpload
            wurfId={savedId}
            bilder={galerieBilder}
            onChange={setGalerieBilder}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Wird gespeichert…' : 'Speichern'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/wuerfe')}>
            Abbrechen
          </button>
        </div>
      </form>
    </>
  )
}
