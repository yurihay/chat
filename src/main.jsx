import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './AppPlus.jsx';
import './styles.css';

const el = globalThis.document?.querySelector('#root');
createRoot(el).render(React.createElement(App));
