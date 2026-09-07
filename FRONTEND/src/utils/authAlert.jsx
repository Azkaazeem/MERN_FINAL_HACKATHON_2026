import React from 'react';
import toast from 'react-hot-toast';
import { ShieldAlert, LogIn, X } from 'lucide-react';

/**
 * Displays a sleek side alert toast prompting the anonymous user to log in
 * @param {Function} navigate - React Router navigate function
 * @param {string} actionName - Description of action the user attempted
 */
export const showAuthAlert = (navigate, actionName = 'perform this action') => {
  toast.custom((t) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-color)',
        border: '1px solid #00e5ff',
        boxShadow: '0 10px 35px rgba(0, 229, 255, 0.28), 0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '16px 18px',
        borderRadius: '8px',
        maxWidth: '380px',
        width: '100%',
        animation: t.visible ? 'customEnter 0.25s ease' : 'customExit 0.25s ease',
        borderLeft: '5px solid #00e5ff',
        zIndex: 99999
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5ff', fontWeight: '800', fontSize: '13.5px' }}>
          <ShieldAlert size={18} />
          <span>Login Required</span>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex'
          }}
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      </div>

      <p style={{ margin: 0, fontSize: '12.5px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
        Anonymous users have <strong>Read-Only access</strong>. Please log in or create an account to {actionName}.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            if (navigate) {
              navigate('/login');
            } else {
              window.location.href = '/login';
            }
          }}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: '#00e5ff',
            color: '#000000',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
        >
          <LogIn size={14} />
          <span>Sign In / Register</span>
        </button>

        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  ), {
    position: 'top-right',
    duration: 6000
  });
};
