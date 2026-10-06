import React from 'react';
import ReactDOM from 'react-dom/client';
import DebugApp from './DebugApp';

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <DebugApp />
    </React.StrictMode>
);
