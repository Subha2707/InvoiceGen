import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

let counter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = 'success') => {
    const id = ++counter;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  const api = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <span className="toast-icon">
              {t.type === 'success' ? <FiCheckCircle /> : t.type === 'error' ? <FiXCircle /> : <FiInfo />}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);