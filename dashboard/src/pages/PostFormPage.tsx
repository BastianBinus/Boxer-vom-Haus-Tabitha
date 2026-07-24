import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePosts, usePost } from '../hooks/usePosts'
import { PublishToggle } from '../components/PublishToggle'

export function PostFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const { post, loading: postLoading } = usePost(id)
  const { create, update } = usePosts()

  const [titel, setTitel] = useState('')
  const [datum, setDatum] = useState(new Date().toISOString().slice(0, 10))
  const [auszug, setAuszug] = useState('')
  const [inhalt, setInhalt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [imagesText, setImagesText] = useState('')
  const [veroeffentlicht, setVeroeffentlicht] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!post) return
    setTitel(post.titel)
    setDatum(post.datum)
    setAuszug(post.auszug ?? '')
    setInhalt(post.inhalt)
    setVideoUrl(post.video_url ?? '')
    setImagesText(Array.isArray(post.images) ? (post.images as string[]).join('\n') : '')
    setVeroeffentlicht(post.veroeffentlicht)
  }, [post])

  const parseImages = (text: string): string[] | null => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    return lines.length > 0 ? lines : null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        titel: titel.trim(),
        datum,
        auszug: auszug.trim() || null,
        inhalt: inhalt.trim(),
        video_url: videoUrl.trim() || null,
        images: parseImages(imagesText),
        veroeffentlicht,
      }
      if (isEdit && id) {
        await update(id, payload)
      } else {
        await create(payload)
      }
      navigate('/beitraege')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && postLoading) return <p className="page-loading">Lädt…</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Beitrag bearbeiten' : 'Neuer Beitrag'}</h1>
        <Link to="/beitraege" className="btn btn-ghost">Abbrechen</Link>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {error && <p className="error-text">{error}</p>}

        <div className="form-group">
          <label className="form-label" htmlFor="titel">Titel *</label>
          <input
            id="titel"
            className="form-input"
            type="text"
            value={titel}
            onChange={e => setTitel(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="datum">Datum *</label>
          <input
            id="datum"
            className="form-input"
            type="date"
            value={datum}
            onChange={e => setDatum(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="auszug">Kurztext (optional)</label>
          <textarea
            id="auszug"
            className="form-input form-textarea"
            rows={2}
            value={auszug}
            onChange={e => setAuszug(e.target.value)}
            placeholder="Wird als Vorschautext auf der Website angezeigt"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="inhalt">Inhalt</label>
          <textarea
            id="inhalt"
            className="form-input form-textarea"
            rows={6}
            value={inhalt}
            onChange={e => setInhalt(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="videoUrl">Video-URL (optional)</label>
          <input
            id="videoUrl"
            className="form-input"
            type="url"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=… oder https://vimeo.com/…"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="images">Bild-URLs (optional, eine pro Zeile)</label>
          <textarea
            id="images"
            className="form-input form-textarea"
            rows={3}
            value={imagesText}
            onChange={e => setImagesText(e.target.value)}
            placeholder="https://beispiel.de/bild1.jpg&#10;https://beispiel.de/bild2.jpg"
          />
        </div>

        <div className="form-group">
          <PublishToggle value={veroeffentlicht} onChange={setVeroeffentlicht} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  )
}
