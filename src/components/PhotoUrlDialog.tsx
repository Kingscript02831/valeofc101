
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea"; 

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {textInputOnly ? "Digite o texto para seu story" : ""}
          </DialogDescription>
        </DialogHeader>
        
        {textInputOnly ? (
          <Textarea
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            className="resize-none h-32"
          />
        ) : (
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
          />
        )}
        
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUrlDialog;
