// Backend endpoints pulled from Vite env so we can switch between dev/prod without code edits
export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const API_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL;
