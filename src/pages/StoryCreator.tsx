
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Camera, Trash2, Edit, Check, Square, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import PhotoUrlDialog from "../components/PhotoUrlDialog";
import { transformDropboxUrl } from "../utils/mediaUtils";
import { Checkbox } from "@/components/ui/checkbox";

interface GalleryItem {
  id: string;
  type: "image" | "video" | "text";
  url: string;
  created_at: string;
  selected?: boolean;
}

const StoryCreator = () => {
  const navigate = useNavigate();
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  useEffect(() => {
    fetchUserMedia();
  }, []);
  
  const fetchUserMedia = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      // Convert the data to match the GalleryItem interface
      const mappedData = (data || []).map(item => ({
        id: item.id,
        type: item.media_type as "image" | "video" | "text",
        url: item.media_url,
        created_at: item.created_at,
        selected: false
      }));
      
      setGalleryItems(mappedData);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast.error("Erro ao carregar sua galeria");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMedia = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      try {
        const { error } = await supabase
          .from("stories")
          .delete()
          .eq("id", id);
          
        if (error) throw error;
        
        setGalleryItems(prev => prev.filter(item => item.id !== id));
        toast.success("Item excluído com sucesso");
      } catch (error) {
        console.error("Error deleting media:", error);
        toast.error("Erro ao excluir item");
      }
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error("Nenhum item selecionado");
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir ${selectedItems.length} item(s) selecionado(s)?`)) {
      try {
        // Delete each selected item
        for (const id of selectedItems) {
          const { error } = await supabase
            .from("stories")
            .delete()
            .eq("id", id);
            
          if (error) throw error;
        }
        
        // Update the gallery items
        setGalleryItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        setIsSelectionMode(false);
        toast.success(`${selectedItems.length} item(s) excluído(s) com sucesso`);
      } catch (error) {
        console.error("Error deleting media:", error);
        toast.error("Erro ao excluir itens");
      }
    }
  };
  
  const handleEditMedia = (item: GalleryItem) => {
    navigate(`/story/edit/${item.id}`);
  };
  
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedItems([]);
    }
  };
  
  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    } else {
      setSelectedItems(prev => [...prev, id]);
    }
  };
  
  // Function to render text content from JSON
  const renderTextContent = (jsonString: string) => {
    try {
      const textData = JSON.parse(jsonString);
      return (
        <span style={{ 
          color: textData.color || '#FFFFFF',
          fontSize: '12px'
        }}>
          {textData.text}
        </span>
      );
    } catch (e) {
      return <span>Texto</span>;
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-black">
        <Button variant="ghost" size="icon" onClick={() => navigate("/story/manage")} className="text-white">
          <X className="h-8 w-8" />
        </Button>
        <h1 className="text-xl font-semibold">Criar story</h1>
        <div className="w-8" />
      </div>

      {/* Content - Story Creation Options */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Image Story Option - Changed Music icon to Camera */}
          <div 
            className="cursor-pointer rounded-xl overflow-hidden"
            onClick={() => setIsImageDialogOpen(true)}
          >
            <div className="bg-gradient-to-br from-teal-400 to-blue-400 p-6 flex flex-col items-center justify-center aspect-square">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-gray-800" />
              </div>
              <span className="text-white text-xl font-semibold">Imagem</span>
            </div>
          </div>
          
          {/* Video Story Option */}
          <div 
            className="cursor-pointer rounded-xl overflow-hidden"
            onClick={() => setIsVideoDialogOpen(true)}
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 flex flex-col items-center justify-center aspect-square">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-gray-800" />
              </div>
              <span className="text-white text-xl font-semibold">Vídeo</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gallery Section */}
      <div className="mt-8 border-t border-gray-800 pt-4">
        <div className="px-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Galeria</h2>
          <div className="flex gap-2">
            {isSelectionMode && selectedItems.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteSelected}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Excluir ({selectedItems.length})
              </Button>
            )}
            <Button 
              variant={isSelectionMode ? "secondary" : "outline"} 
              size="sm"
              onClick={toggleSelectionMode}
              className={`border-gray-600 ${isSelectionMode ? 'bg-blue-600 text-white' : 'text-white'}`}
            >
              {isSelectionMode ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Concluir
                </>
              ) : (
                "Selecionar vários"
              )}
            </Button>
          </div>
        </div>
        
        {/* Gallery Grid - Changed to 2 columns */}
        <div className="mt-4">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Carregando sua galeria...</p>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">Nenhum item na galeria</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {galleryItems.map((item) => (
                <div key={item.id} className="relative aspect-square bg-gray-800">
                  {isSelectionMode && (
                    <div 
                      className="absolute top-2 left-2 z-10" 
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      {selectedItems.includes(item.id) ? (
                        <div className="bg-blue-500 rounded h-6 w-6 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="bg-black bg-opacity-50 border border-white rounded h-6 w-6"></div>
                      )}
                    </div>
                  )}
                
                  {item.type === 'text' ? (
                    <div 
                      className="h-full w-full flex items-center justify-center bg-gray-900 text-white p-2 text-center overflow-hidden"
                      onClick={isSelectionMode ? () => toggleItemSelection(item.id) : undefined}
                    >
                      {renderTextContent(item.url)}
                    </div>
                  ) : item.type === 'video' ? (
                    <video 
                      src={transformDropboxUrl(item.url)}
                      className="object-cover w-full h-full"
                      onClick={isSelectionMode ? () => toggleItemSelection(item.id) : undefined}
                    />
                  ) : (
                    <img 
                      src={transformDropboxUrl(item.url)} 
                      alt="Gallery item" 
                      className="object-cover w-full h-full"
                      onClick={isSelectionMode ? () => toggleItemSelection(item.id) : undefined}
                    />
                  )}
                  
                  {/* Control overlay - Hidden in selection mode */}
                  {!isSelectionMode && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full h-9 w-9 bg-white/20 hover:bg-white/40 transition-colors"
                        onClick={() => handleEditMedia(item)}
                      >
                        <Edit className="h-4 w-4 text-white" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full h-9 w-9 bg-white/20 hover:bg-red-500/80 transition-colors"
                        onClick={() => handleDeleteMedia(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Video duration indicator */}
                  {item.type === 'video' && !isSelectionMode && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-0.5 rounded text-xs">
                      1:00
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog for adding image */}
      <PhotoUrlDialog
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        onConfirm={(url) => {
          const transformedUrl = transformDropboxUrl(url);
          navigate("/story/new", { state: { type: "image", url: transformedUrl } });
        }}
        title="Adicionar Imagem"
      />
      
      {/* Dialog for adding video */}
      <PhotoUrlDialog
        isOpen={isVideoDialogOpen}
        onClose={() => setIsVideoDialogOpen(false)}
        onConfirm={(url) => {
          const transformedUrl = transformDropboxUrl(url);
          navigate("/story/new", { state: { type: "video", url: transformedUrl } });
        }}
        title="Adicionar Vídeo"
      />
    </div>
  );
};

export default StoryCreator;
