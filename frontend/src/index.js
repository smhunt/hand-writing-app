import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: process.env.REACT_APP_AUTH0_CALLBACK_URL || window.location.origin,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  </BrowserRouter>
);
