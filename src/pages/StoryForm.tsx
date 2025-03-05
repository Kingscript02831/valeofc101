
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Camera, Video, Trash2, Link } from "lucide-react";
import PhotoUrlDialog from "../components/PhotoUrlDialog";
import { MediaCarousel } from "../components/MediaCarousel";

interface StoryFormState {
  type: "image" | "video";
  url?: string;
}

const StoryForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const formState = location.state as StoryFormState | null;
  
  const [storyType, setStoryType] = useState<"image" | "video">(formState?.type || "image");
  const [mediaUrl, setMediaUrl] = useState<string>(formState?.url || "");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // If there's no state data, redirect to the creator
    if (!formState) {
      navigate("/story/creator");
    }
  }, [formState, navigate]);

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

  const createStoryMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Você precisa estar autenticado");

      // Transforma a URL antes de salvar
      const transformedMediaUrl = transformDropboxUrl(mediaUrl);

      const payload = {
        user_id: user.id,
        media_url: transformedMediaUrl,
        media_type: storyType,
        link_url: linkUrl || null
      };

      const { data, error } = await supabase
        .from("stories")
        .insert(payload)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories"] });
      queryClient.invalidateQueries({ queryKey: ["myStories"] });
      toast.success("História adicionada com sucesso!");
      navigate("/story/manage");
    },
    onError: (error) => {
      console.error("Error creating story:", error);
      toast.error("Erro ao adicionar história. Tente novamente.");
    },
  });

  const handleMediaAdd = (url: string, type: "image" | "video") => {
    // Transforma a URL do Dropbox no momento de adicionar
    const transformedUrl = transformDropboxUrl(url);
    setStoryType(type);
    setMediaUrl(transformedUrl);
  };

  const handleSubmit = async () => {
    if (!mediaUrl) {
      toast.error(`Por favor, adicione uma ${storyType === "image" ? "imagem" : "vídeo"} para o story`);
      return;
    }
    
    setIsUploading(true);
    try {
      await createStoryMutation.mutateAsync();
    } catch (error) {
      console.error("Error submitting story:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-14 pb-20">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-black">
        <Button variant="ghost" size="icon" onClick={() => navigate("/story/creator")}>
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        <h1 className="text-lg font-semibold">
          {storyType === "image" ? "Story de Imagem" : "Story de Vídeo"}
        </h1>
        <div className="w-10" />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <Card className="overflow-hidden bg-black border-gray-800">
          <CardContent className="p-4">
            {mediaUrl ? (
              <div className="mb-4">
                <MediaCarousel
                  images={storyType === "image" ? [mediaUrl] : []}
                  videoUrls={storyType === "video" ? [mediaUrl] : []}
                  title="Preview do Story"
                  autoplay={true}
                  showControls={true}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 gap-4 border-2 border-dashed border-gray-700 rounded-lg mb-4">
                <p className="text-gray-400 text-center">
                  {storyType === "image" 
                    ? "Adicione uma imagem para o seu story" 
                    : "Adicione um vídeo para o seu story"}
                </p>
                <div className="flex gap-4">
                  {storyType === "image" ? (
                    <Button
                      onClick={() => setIsPhotoDialogOpen(true)}
                      variant="outline"
                      className="flex items-center gap-2 border-gray-700 text-white"
                    >
                      <Camera size={18} />
                      Imagem
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsVideoDialogOpen(true)}
                      variant="outline"
                      className="flex items-center gap-2 border-gray-700 text-white"
                    >
                      <Video size={18} />
                      Vídeo
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Campos adicionais para link */}
            {mediaUrl && (
              <div className="space-y-4 mb-4">
                {/* Campo para adicionar link */}
                <div className="space-y-2">
                  <Label htmlFor="link" className="text-white flex items-center gap-2">
                    <Link size={16} />
                    Adicionar Link
                  </Label>
                  <Input
                    id="link"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://exemplo.com"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400">
                    Adicione um link para direcionar os visualizadores
                  </p>
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
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                disabled={!mediaUrl || isUploading}
              >
                {isUploading ? "Publicando..." : "Publicar Story"}
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

export default StoryForm;
