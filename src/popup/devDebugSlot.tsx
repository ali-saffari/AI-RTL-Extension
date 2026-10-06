import React from 'react';

let DevDebugLink: React.ComponentType = () => null;

// Webpack drops this require from production builds. Keep it at module scope.
if (__AI_RTL_DEV__) {
    DevDebugLink = require('./devDebugLink').default;
}

export default function DevDebugSlot() {
    return <DevDebugLink />;
}
