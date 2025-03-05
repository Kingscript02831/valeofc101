
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea"; 
import { X } from "lucide-react";

interface PhotoUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
  title: string;
  placeholder?: string;
  textInputOnly?: boolean;
}

const PhotoUrlDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  placeholder = "Cole a URL da imagem aqui",
  textInputOnly = false
}: PhotoUrlDialogProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!url.trim()) {
      setError("Por favor, insira um valor");
      return;
    }
    
    // If textInputOnly is true, we don't need to validate URL format
    if (!textInputOnly) {
      // Simple URL validation
      try {
        new URL(url);
      } catch (e) {
        setError("Por favor, insira uma URL válida");
        return;
      }
    }
    
    onConfirm(url);
    onClose();
    setUrl("");
    setError(null);
  };

  const handleClose = () => {
    onClose();
    setUrl("");
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          {textInputOnly ? (
            <Textarea
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder={placeholder}
              className="resize-none h-32 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          ) : (
            <Input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder={placeholder}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          )}
          
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        
        <DialogFooter className="mt-4 sm:justify-between">
          <Button type="button" variant="outline" onClick={handleClose} 
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUrlDialog;
