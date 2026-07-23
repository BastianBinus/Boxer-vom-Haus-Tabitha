interface Props {
  value: boolean
  onChange: (v: boolean) => void
}

export function PublishToggle({ value, onChange }: Props) {
  return (
    <div className="publish-toggle-wrap">
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={value}
          onChange={e => onChange(e.target.checked)}
        />
        <span className="toggle-track" />
        <span className="toggle-thumb" />
      </label>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-ink)' }}>
          {value ? 'Veröffentlicht' : 'Nicht veröffentlicht'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
          {value
            ? 'Sichtbar auf der öffentlichen Website'
            : 'Nur im Dashboard sichtbar'}
        </div>
      </div>
      <span className={`badge ${value ? 'badge-live' : 'badge-hidden'}`}>
        {value ? 'Live' : 'Versteckt'}
      </span>
    </div>
  )
}
