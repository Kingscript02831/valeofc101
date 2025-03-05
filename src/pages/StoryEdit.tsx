
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowLeft, Camera, Video, Trash2 } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { MediaCarousel } from "../components/MediaCarousel";
import PhotoUrlDialog from "../components/PhotoUrlDialog";

const StoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Função para transformar URLs do Dropbox, mudando 0 para 1 no final
  const transformDropboxUrl = (url: string): string => {
    if (!url) return url;
    
    // Verifica se é uma URL do Dropbox
    if (url.includes('dropbox.com') && url.endsWith('0')) {
      // Substitui o 0 final por 1
      return url.slice(0, -1) + '1';
    }
    
    return url;
  };

  // Buscar os dados do story
  const { data: story, isLoading, error } = useQuery({
    queryKey: ["story", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do story não fornecido");
      
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (story) {
      setMediaUrl(story.media_url);
      setMediaType(story.media_type as "image" | "video");
    }
  }, [story]);

  const updateStoryMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID do story não fornecido");
      
      // Transforma a URL antes de salvar
      const transformedMediaUrl = transformDropboxUrl(mediaUrl);
      
      const { data, error } = await supabase
        .from("stories")
        .update({
          media_url: transformedMediaUrl,
          media_type: mediaType,
          link_url: null // Removido o linkUrl conforme solicitado
        })
        .eq("id", id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story", id] });
      queryClient.invalidateQueries({ queryKey: ["myStories"] });
      toast.success("Story atualizado com sucesso!");
      navigate("/story/manage");
    },
    onError: (error) => {
      console.error("Erro ao atualizar story:", error);
      toast.error("Erro ao atualizar story. Tente novamente.");
    },
  });

  const handleMediaAdd = (url: string, type: "image" | "video") => {
    // Transforma a URL do Dropbox no momento de adicionar
    const transformedUrl = transformDropboxUrl(url);
    setMediaType(type);
    setMediaUrl(transformedUrl);
  };

  const handleUpdate = async () => {
    if (!mediaUrl) {
      toast.error(`Por favor, adicione uma ${mediaType === "image" ? "imagem" : "vídeo"} para o story`);
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateStoryMutation.mutateAsync();
    } catch (err) {
      console.error("Error updating story:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="container max-w-md mx-auto">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Erro ao carregar o story</p>
        <Button onClick={() => navigate("/story/manage")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-14 pb-20">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-black">
        <Button variant="ghost" size="icon" onClick={() => navigate("/story/manage")}>
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        <h1 className="text-lg font-semibold">Editar Story</h1>
        <div className="w-10" />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <Card className="overflow-hidden bg-black border-gray-800">
          <CardContent className="p-4">
            {mediaUrl ? (
              <div className="mb-4">
                <MediaCarousel
                  images={mediaType === "image" ? [mediaUrl] : []}
                  videoUrls={mediaType === "video" ? [mediaUrl] : []}
                  title="Preview do Story"
                  autoplay={true}
                  showControls={true}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 gap-4 border-2 border-dashed border-gray-700 rounded-lg mb-4">
                <p className="text-gray-400 text-center">
                  {mediaType === "image" 
                    ? "Adicione uma imagem para o seu story" 
                    : "Adicione um vídeo para o seu story"}
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setIsPhotoDialogOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-700 text-white"
                  >
                    <Camera size={18} />
                    Imagem
                  </Button>
                  <Button
                    onClick={() => setIsVideoDialogOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-700 text-white"
                  >
                    <Video size={18} />
                    Vídeo
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between gap-4">
              {mediaUrl && (
                <Button
                  variant="outline"
                  onClick={() => setMediaUrl("")}
                  className="flex-1 border-gray-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              )}
              
              <Button
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                disabled={!mediaUrl || isUpdating}
              >
                {isUpdating ? "Atualizando..." : "Salvar Alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for adding image */}
      <PhotoUrlDialog
        isOpen={isPhotoDialogOpen}
        onClose={() => setIsPhotoDialogOpen(false)}
        onConfirm={(url) => handleMediaAdd(url, "image")}
        title="Adicionar Imagem"
      />

      {/* Dialog for adding video */}
      <PhotoUrlDialog
        isOpen={isVideoDialogOpen}
        onClose={() => setIsVideoDialogOpen(false)}
        onConfirm={(url) => handleMediaAdd(url, "video")}
        title="Adicionar Vídeo"
      />
    </div>
  );
};

export default StoryEdit;
