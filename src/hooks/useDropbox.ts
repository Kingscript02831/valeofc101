
import { useState, useEffect, useCallback } from 'react';
import { Dropbox, files } from 'dropbox';
import { createDropboxClient, getDropboxToken, saveDropboxToken, removeDropboxToken, getDropboxAuthUrl } from '../integrations/dropbox/client';
import { toast } from 'sonner';

interface DropboxFile {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  size?: number;
  thumbnailUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
}

export function useDropbox() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<DropboxFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  
  // Initialize the Dropbox client
  const getClient = useCallback(() => {
    const token = getDropboxToken();
    if (!token) return null;
    return createDropboxClient(token);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const token = getDropboxToken();
    setIsAuthenticated(!!token);
  }, []);

  // Login to Dropbox (redirect to Dropbox OAuth)
  const login = useCallback(() => {
    getDropboxAuthUrl().then(url => {
      window.location.href = url.toString();
    });
  }, []);

  // Logout from Dropbox
  const logout = useCallback(() => {
    removeDropboxToken();
    setIsAuthenticated(false);
  }, []);

  // Process auth callback (called after OAuth redirect)
  const handleAuthCallback = useCallback((hash: string) => {
    if (!hash) return false;
    
    const params = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      saveDropboxToken(accessToken);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  // List files in a folder
  const listFiles = useCallback(async (path: string = '') => {
    const client = getClient();
    if (!client) return;
    
    setIsLoading(true);
    try {
      const response = await client.filesListFolder({
        path: path || '',
        include_media_info: true
      });
      
      const mappedFiles = response.result.entries.map(entry => {
        const isFolder = entry['.tag'] === 'folder';
        
        // Create a DropboxFile object
        const file: DropboxFile = {
          id: entry.id || entry.name,
          name: entry.name,
          path: (entry as any).path_display || entry.path_lower || '',
          isFolder,
          size: isFolder ? undefined : (entry as files.FileMetadata).size
        };
        
        return file;
      });
      
      setFiles(mappedFiles);
      setCurrentPath(path);
    } catch (error) {
      console.error('Error listing Dropbox files:', error);
      toast.error('Erro ao listar arquivos do Dropbox');
    } finally {
      setIsLoading(false);
    }
  }, [getClient]);

  // Get thumbnail URL for an image
  const getThumbnailUrl = useCallback(async (path: string) => {
    const client = getClient();
    if (!client) return null;
    
    try {
      const response = await client.filesGetThumbnail({
        path,
        format: 'jpeg',
        size: 'w256h256'
      });
      
      // Create a Blob URL from the thumbnail data
      const blob = await response.result.fileBlob;
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error getting thumbnail:', error);
      return null;
    }
  }, [getClient]);

  // Get a shareable link for a file
  const getSharedLink = useCallback(async (path: string) => {
    const client = getClient();
    if (!client) return null;
    
    try {
      // Check if a shared link already exists
      const checkResult = await client.sharingListSharedLinks({
        path,
        direct_only: true
      });
      
      if (checkResult.result.links.length > 0) {
        let url = checkResult.result.links[0].url;
        // Transform the URL to make it directly usable
        url = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
        return url;
      }
      
      // Create a new shared link
      const result = await client.sharingCreateSharedLinkWithSettings({
        path
      });
      
      let url = result.result.url;
      // Transform the URL to make it directly usable
      url = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      return url;
    } catch (error) {
      console.error('Error creating shared link:', error);
      toast.error('Erro ao criar link compartilhado');
      return null;
    }
  }, [getClient]);

  // Upload a file to Dropbox
  const uploadFile = useCallback(async (file: File, path: string = '') => {
    const client = getClient();
    if (!client) return null;
    
    setIsLoading(true);
    try {
      // Convert path to proper format if needed
      const uploadPath = path ? `${path}/${file.name}` : `/${file.name}`;
      
      const response = await client.filesUpload({
        path: uploadPath,
        contents: file
      });
      
      // Refresh the file list
      await listFiles(path);
      
      return response.result;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar arquivo para o Dropbox');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getClient, listFiles]);

  return {
    isAuthenticated,
    isLoading,
    files,
    currentPath,
    login,
    logout,
    handleAuthCallback,
    listFiles,
    getThumbnailUrl,
    getSharedLink,
    uploadFile
  };
}
