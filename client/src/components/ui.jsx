import { useEffect } from 'react';
import { X, Inbox, Loader2 } from 'lucide-react';

export function Badge({ kind, value }) {
  const cls = value.toLowerCase().replace(' ', '-');
  return <span className={`badge badge-${kind}-${cls}`}>{value}</span>;
}

export function Spinner({ size = 18 }) { return <Loader2 className="spin" size={size} aria-label="Loading" />; }

export function Skeleton({ rows = 4 }) {
  return <div className="skeleton-wrap" aria-busy="true">{Array.from({ length: rows }).map((_, i) => <div key={i} className="skeleton" />)}</div>;
}

export function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon size={28} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function Field({ label, error, children, htmlFor }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <span className="field-error" role="alert">{error}</span>}
    </div>
  );
}

export function Modal({ title, onClose, children, small }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${small ? 'modal-sm' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmText = 'Delete', busy, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} small>
      <p className="muted">{message}</p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>{busy ? <Spinner /> : confirmText}</button>
      </div>
    </Modal>
  );
}

export function Logo({ light }) {
  return (
    <span className={`logo ${light ? 'logo-light' : ''}`}>
      <span className="logo-mark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
      </span>
      TaskFlow
    </span>
  );
}
