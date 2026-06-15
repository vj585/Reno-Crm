import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { id, message, type } = e.detail;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center p-4 rounded-md shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 min-w-[300px] text-white ${
            t.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {t.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
          <span className="flex-1 font-medium text-sm">{t.message}</span>
          <button onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}>
            <X className="w-4 h-4 text-white/80 hover:text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}
