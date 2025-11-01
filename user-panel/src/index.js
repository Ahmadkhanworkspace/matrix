import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import App from './App';
import LiveChatWidget from './components/LiveChatWidget';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <ErrorBoundary>
        <App />
        <LiveChatWidget />
        <Toaster position="top-right" />
      </ErrorBoundary>
  </React.StrictMode>
); 