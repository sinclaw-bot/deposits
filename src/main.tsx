import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@gravity-ui/uikit/styles/styles.css';
import { App } from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
