const host = window.location.hostname;
const API_PORT = import.meta.env.VITE_API_PORT || 5001;

export const API_URL = `https://${host}:${API_PORT}`;
export const WS_URL = `wss://${host}:${API_PORT}`;