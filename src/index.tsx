import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import '@patternfly/react-core/dist/styles/base.css';
import App from './app';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
