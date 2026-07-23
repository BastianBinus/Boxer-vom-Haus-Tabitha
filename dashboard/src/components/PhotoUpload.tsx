import { useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Props {
  hundId: string | null
  currentUrl: string | null
  onUpload: (url: string) => void
}

export function PhotoUpload({ hundId, currentUrl, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    if (!hundId) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Nur JPEG, PNG oder WebP erlaubt.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Datei zu groß (max. 5 MB).')
      return
    }
    setError(null)
    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${hundId}/foto.${ext}`
    const { error: upErr } = await supabase.storage
      .from('hundefotos')
      .upload(path, file, { upsert: true })
    if (upErr) {
      setError(upErr.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('hundefotos').getPublicUrl(path)
    onUpload(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="photo-upload">
      {currentUrl ? (
        <img src={currentUrl} alt="Hundefoto" className="photo-preview" />
      ) : (
        <div className="photo-preview">🐕</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!hundId || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Wird hochgeladen…' : 'Foto hochladen'}
        </button>
        {!hundId && (
          <div className="field-hint">Zuerst speichern, dann Foto hochladen.</div>
        )}
        {error && (
          <div className="field-hint" style={{ color: 'oklch(40% 0.08 8deg)' }}>
            {error}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
