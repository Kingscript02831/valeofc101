
/**
 * Transforms Dropbox URLs by changing the "0" at the end to "1" when needed
 * This helps with direct media embedding from Dropbox
 */
export const transformDropboxUrl = (url: string): string => {
  if (!url) return url;
  
  // Handle Dropbox URLs ending with "0" by changing to "1"
  if (url.includes('dropbox.com') && url.endsWith('0')) {
    return url.slice(0, -1) + '1';
  }
  
  return url;
};
