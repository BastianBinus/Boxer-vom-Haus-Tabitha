import { useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Props {
  wurfId: string | null
  bilder: string[]
  onChange: (bilder: string[]) => void
}

export function GalerieUpload({ wurfId, bilder, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: FileList) => {
    if (!wurfId) return
    setError(null)
    setUploading(true)
    const newUrls: string[] = []
    for (const file of Array.from(files)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Nur JPEG, PNG oder WebP erlaubt.')
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Datei zu groß (max. 5 MB).')
        continue
      }
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${wurfId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('wurf-fotos')
        .upload(path, file, { upsert: false })
      if (upErr) { setError(upErr.message); continue }
      const { data } = supabase.storage.from('wurf-fotos').getPublicUrl(path)
      newUrls.push(data.publicUrl)
    }
    if (newUrls.length > 0) onChange([...bilder, ...newUrls])
    setUploading(false)
  }

  const remove = (url: string) => {
    onChange(bilder.filter(b => b !== url))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {bilder.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {bilder.map(url => (
            <div key={url} style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <img
                src={url}
                alt=""
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
              <button
                type="button"
                onClick={() => remove(url)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--color-danger, #e53e3e)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}
                aria-label="Entfernen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!wurfId || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Wird hochgeladen…' : '+ Fotos hinzufügen'}
        </button>
        {!wurfId && <span className="field-hint">Zuerst speichern, dann Fotos hochladen.</span>}
        {error && <span className="field-hint" style={{ color: 'var(--color-cat-blush-text)' }}>{error}</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files?.length) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
