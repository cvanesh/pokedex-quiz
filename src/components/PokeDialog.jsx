export default function PokeDialog({ message, onConfirm, onCancel, confirmText = 'YES', cancelText = 'NO' }) {
  return (
    <div className="poke-dialog-overlay" onClick={onCancel}>
      <div className="poke-dialog" onClick={e => e.stopPropagation()}>
        <div className="poke-dialog-pokeball" />
        <p className="poke-dialog-message">{message}</p>
        <div className="poke-dialog-buttons">
          <button className="btn btn-secondary poke-dialog-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn-primary poke-dialog-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
