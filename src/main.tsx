import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Unregister any active or lingering service workers to avoid stale cache lockups
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) {
      reg.unregister().catch(() => {});
    }
  }).catch(() => {});
}

function mountApp() {
  const container = document.getElementById('root');
  if (container) {
    try {
      if (typeof window !== 'undefined') {
        (window as any).__appLoaded = true;
      }
      const root = createRoot(container);
      root.render(
        <StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </StrictMode>
      );
    } catch (err) {
      console.error('Failed to render root App:', err);
      container.innerHTML = `
        <div style="min-height: 100vh; background: #020617; color: white; display: flex; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; text-align: center;">
          <div style="background: #0f172a; border: 1px solid #1e293b; padding: 32px; border-radius: 20px; max-width: 480px; width: 100%;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Litoral em Movimento</h2>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Carregando aplicação... Clique abaixo para atualizar.</p>
            <button onclick="localStorage.removeItem('litoral_reservations_v2'); sessionStorage.clear(); window.location.reload();" style="background: #f59e0b; color: #020617; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer;">
              Atualizar Página
            </button>
          </div>
        </div>
      `;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
