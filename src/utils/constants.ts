export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const isChrome =
  /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
