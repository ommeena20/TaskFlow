import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const toast = { success: (m) => push(m, 'success'), error: (m) => push(m, 'error') };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            {t.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{t.message}</span>
            <button className="icon-btn" aria-label="Dismiss" onClick={() => remove(t.id)}><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
