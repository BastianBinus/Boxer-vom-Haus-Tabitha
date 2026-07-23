interface Props {
  title?: string
  message?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteDialog({
  title = 'Wirklich löschen?',
  message = 'Der Eintrag wird in den Papierkorb verschoben und nach 30 Tagen endgültig gelöscht.',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-body">{message}</div>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Abbrechen</button>
          <button className="btn btn-danger" onClick={onConfirm}>Löschen</button>
        </div>
      </div>
    </div>
  )
}
