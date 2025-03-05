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

/**
 * Determines the media type based on the URL or file extension
 */
export const getMediaType = (url: string): 'image' | 'video' | 'unknown' => {
  if (!url) return 'unknown';
  
  // Check based on file extension
  const extension = url.split('.').pop()?.toLowerCase();
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
  
  if (imageExtensions.includes(extension || '')) return 'image';
  if (videoExtensions.includes(extension || '')) return 'video';
  
  // Check based on URL patterns
  if (url.includes('youtu.be') || url.includes('youtube.com')) return 'video';
  
  return 'unknown';
};

/**
 * Formats a Dropbox shared link to be directly usable in <img> or <video> tags
 */
export const formatDropboxUrl = (url: string): string => {
  if (!url || !url.includes('dropbox.com')) return url;
  
  // Replace www.dropbox.com with dl.dropboxusercontent.com
  let formattedUrl = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
  
  // Ensure URL ends with "1" for direct access
  if (formattedUrl.endsWith('0')) {
    formattedUrl = formattedUrl.slice(0, -1) + '1';
  } else if (!formattedUrl.endsWith('1')) {
    formattedUrl = formattedUrl + '1';
  }
  
  return formattedUrl;
};

/**
 * Combined utility to process and transform any media URL
 */
export const processMediaUrl = (url: string): { url: string; type: 'image' | 'video' | 'unknown' } => {
  const processedUrl = formatDropboxUrl(transformDropboxUrl(url));
  const type = getMediaType(processedUrl);
  
  return { url: processedUrl, type };
};
