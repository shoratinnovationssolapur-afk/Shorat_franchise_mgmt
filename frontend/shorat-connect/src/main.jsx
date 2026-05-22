// src/main.jsx

import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './pages/Admin/context/AuthContext.jsx';
import { NotificationProvider } from './pages/Admin/Notifications/NotificationContext.jsx';

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    // src/main.jsx
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider> {/* The parent provider */}
        <NotificationProvider> {/* The child provider */}
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
} else {
  console.error("❌ Root element not found!");
}
