
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Music, Camera, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import PhotoUrlDialog from "../components/PhotoUrlDialog";

interface GalleryItem {
  id: string;
  type: "image" | "video" | "text";
  url: string;
  created_at: string;
}

const StoryCreator = () => {
  const navigate = useNavigate();
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
        created_at: item.created_at
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
  
  const handleEditMedia = (item: GalleryItem) => {
    navigate(`/story/edit/${item.id}`);
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
          {/* Image Story Option */}
          <div 
            className="cursor-pointer rounded-xl overflow-hidden"
            onClick={() => setIsImageDialogOpen(true)}
          >
            <div className="bg-gradient-to-br from-teal-400 to-blue-400 p-6 flex flex-col items-center justify-center aspect-square">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Music className="h-8 w-8 text-gray-800" />
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
          <Button variant="outline" className="border-gray-600 text-white">
            Selecionar vários
          </Button>
        </div>
        
        {/* Gallery Grid */}
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
            <div className="grid grid-cols-3 gap-0.5">
              {galleryItems.map((item) => (
                <div key={item.id} className="relative aspect-square bg-gray-800">
                  {item.type === 'text' ? (
                    <div className="h-full w-full flex items-center justify-center bg-gray-900 text-white p-2 text-center overflow-hidden">
                      {renderTextContent(item.url)}
                    </div>
                  ) : item.type === 'video' ? (
                    <video 
                      src={item.url}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <img 
                      src={item.url} 
                      alt="Gallery item" 
                      className="object-cover w-full h-full"
                    />
                  )}
                  
                  {/* Control overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => handleEditMedia(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-red-500 hover:bg-white/20"
                      onClick={() => handleDeleteMedia(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Video duration indicator - Alterado de 0:30 para 1:00 */}
                  {item.type === 'video' && (
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
          navigate("/story/new", { state: { type: "image", url } });
        }}
        title="Adicionar Imagem"
      />
      
      {/* Dialog for adding video */}
      <PhotoUrlDialog
        isOpen={isVideoDialogOpen}
        onClose={() => setIsVideoDialogOpen(false)}
        onConfirm={(url) => {
          navigate("/story/new", { state: { type: "video", url } });
        }}
        title="Adicionar Vídeo"
      />
    </div>
  );
};

export default StoryCreator;
