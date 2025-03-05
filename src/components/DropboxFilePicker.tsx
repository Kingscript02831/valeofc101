
import { useState, useEffect } from 'react';
import { useDropbox } from '../hooks/useDropbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ArrowLeft, File, Folder, Image, Video, Upload, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface DropboxFilePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (url: string, type: 'image' | 'video') => void;
  mediaType?: 'image' | 'video' | 'all'; // Filter type
}

const DropboxFilePicker = ({
  isOpen,
  onClose,
  onSelectFile,
  mediaType = 'all'
}: DropboxFilePickerProps) => {
  const {
    isAuthenticated,
    isLoading,
    files,
    currentPath,
    login,
    listFiles,
    getSharedLink
  } = useDropbox();
  
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // Load files when component mounts or when directory changes
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      listFiles(currentPath);
    }
  }, [isAuthenticated, isOpen, currentPath, listFiles]);

  // Handle directory navigation
  const navigateToFolder = (path: string) => {
    setSelectedFile(null);
    listFiles(path);
  };

  // Go up one directory
  const goBack = () => {
    if (!currentPath) return;
    
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const parentPath = pathParts.join('/');
    navigateToFolder(parentPath);
  };

  // Get file type from name
  const getFileType = (fileName: string): 'image' | 'video' | 'other' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
    
    if (imageExtensions.includes(extension || '')) return 'image';
    if (videoExtensions.includes(extension || '')) return 'video';
    return 'other';
  };

  // Filter files based on the mediaType prop
  const filteredFiles = files.filter(file => {
    if (mediaType === 'all') return true;
    if (file.isFolder) return true;
    
    const fileType = getFileType(file.name);
    return mediaType === fileType;
  });

  // Handle file selection
  const handleSelect = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }
    
    setIsLoadingFile(true);
    try {
      const fileType = getFileType(selectedFile);
      
      if (fileType === 'other') {
        toast.error('Formato de arquivo não suportado');
        return;
      }
      
      // Get shared link
      const sharedUrl = await getSharedLink(selectedFile);
      
      if (sharedUrl) {
        onSelectFile(sharedUrl, fileType as 'image' | 'video');
        onClose();
      } else {
        toast.error('Erro ao obter link do arquivo');
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      toast.error('Erro ao selecionar arquivo');
    } finally {
      setIsLoadingFile(false);
    }
  };

  // File or folder icon based on type
  const FileIcon = ({ name, isFolder }: { name: string; isFolder: boolean }) => {
    if (isFolder) return <Folder className="h-5 w-5 text-blue-400" />;
    
    const fileType = getFileType(name);
    
    if (fileType === 'image') return <Image className="h-5 w-5 text-green-400" />;
    if (fileType === 'video') return <Video className="h-5 w-5 text-purple-400" />;
    return <File className="h-5 w-5 text-gray-400" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar arquivo do Dropbox</DialogTitle>
        </DialogHeader>
        
        {!isAuthenticated ? (
          <div className="p-4 text-center">
            <p className="mb-4">Conecte-se ao Dropbox para acessar seus arquivos</p>
            <Button onClick={login} className="bg-blue-600">
              <ExternalLink className="h-4 w-4 mr-2" />
              Conectar com Dropbox
            </Button>
          </div>
        ) : (
          <>
            {/* Directory navigation */}
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goBack} 
                disabled={!currentPath}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm truncate">
                {currentPath || 'Pasta raiz'}
              </span>
            </div>
            
            {/* File list */}
            <div className="h-[300px] overflow-y-auto border rounded-md">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhum arquivo encontrado
                </div>
              ) : (
                <div className="divide-y">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`p-2 flex items-center gap-2 hover:bg-muted cursor-pointer ${
                        selectedFile === file.path ? 'bg-muted' : ''
                      }`}
                      onClick={() => {
                        if (file.isFolder) {
                          navigateToFolder(file.path);
                        } else {
                          setSelectedFile(file.path);
                        }
                      }}
                    >
                      <FileIcon name={file.name} isFolder={file.isFolder} />
                      <span className="truncate flex-1">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSelect}
                disabled={!selectedFile || isLoadingFile}
                className="bg-blue-600"
              >
                {isLoadingFile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  'Selecionar'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DropboxFilePicker;
