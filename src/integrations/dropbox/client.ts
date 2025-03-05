
import { Dropbox } from 'dropbox';

// These keys are public and used for client-side authentication
const DROPBOX_APP_KEY = "YOUR_DROPBOX_APP_KEY"; // Replace with your app key

// Create a Dropbox client instance
export const createDropboxClient = (accessToken?: string) => {
  return new Dropbox({
    clientId: DROPBOX_APP_KEY,
    accessToken
  });
};

// Generate authentication URL
export const getDropboxAuthUrl = () => {
  const dropbox = createDropboxClient();
  const redirectUrl = `${window.location.origin}/dropbox-auth`;
  
  return dropbox.auth.getAuthenticationUrl(redirectUrl, undefined, 'code', 'offline', undefined, undefined, true);
};

// Parse the access token from URL (after OAuth redirect)
export const getAccessTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.hash.substring(1));
  return params.get('access_token');
};

// Save token to localStorage
export const saveDropboxToken = (token: string) => {
  localStorage.setItem('dropbox_access_token', token);
};

// Get token from localStorage
export const getDropboxToken = (): string | null => {
  return localStorage.getItem('dropbox_access_token');
};

// Remove token from localStorage
export const removeDropboxToken = () => {
  localStorage.removeItem('dropbox_access_token');
};

// Check if user is authenticated with Dropbox
export const isDropboxAuthenticated = (): boolean => {
  return !!getDropboxToken();
};
