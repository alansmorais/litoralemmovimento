import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// In development, preview domains, or iframe containers: ensure no rogue service workers cause white screens
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  const isDevOrIframe =
    window.self !== window.top ||
    window.location.hostname.includes('run.app') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (isDevOrIframe) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) {
        reg.unregister();
      }
    }).catch(() => {});
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);



