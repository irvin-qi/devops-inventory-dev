import React from 'react';
import ReactDOM from 'react-dom/client';
import '@atlaskit/css-reset';
import App from './App';
import { AuthProvider, DataProvider } from './context';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </AuthProvider>
  </React.StrictMode>,
);
