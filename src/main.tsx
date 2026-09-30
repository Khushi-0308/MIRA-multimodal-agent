import React from 'react';
import ReactDOM from 'react-dom/client';
import { MiraProvider } from './context/MiraContext';
import { App } from './App';
import './styles/index.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MiraProvider>
      <App />
    </MiraProvider>
  </React.StrictMode>
);
