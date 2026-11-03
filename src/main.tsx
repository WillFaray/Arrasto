import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useBoardStore } from './store/boardStore';

// Expose store for test automation and devtools
if (typeof window !== 'undefined') {
  (window as unknown as { __BOARD_STORE__: typeof useBoardStore }).__BOARD_STORE__ = useBoardStore;
}

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
