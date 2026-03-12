import React, { createContext, useContext, useMemo, useState } from 'react';
import { AnimatedToast } from '../components';

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showToast = (nextMessage: string) => {
    setMessage(nextMessage);
    setVisible(false);
    requestAnimationFrame(() => setVisible(true));
  };

  const value = useMemo(
    () => ({
      showToast,
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AnimatedToast visible={visible} message={message} onHidden={() => setVisible(false)} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
};
