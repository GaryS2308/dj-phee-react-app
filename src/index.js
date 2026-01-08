import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/styles.css';

const container = document.getElementById('root');

if (container) {
  // Always do a clean client render to avoid hydration warnings.
  if (container.hasChildNodes()) {
    container.innerHTML = '';
  }
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
