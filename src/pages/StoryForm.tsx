
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Camera, Video, Trash2, Image } from "lucide-react";
import PhotoUrlDialog from "../components/PhotoUrlDialog";
import { MediaCarousel } from "../components/MediaCarousel";
import { transformDropboxUrl } from "../utils/mediaUtils";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

  useEffect(() => {
    // If there's no state data, redirect to the creator
    if (!formState) {
      navigate("/story/creator");
    }
  }, [formState, navigate]);

  const createStoryMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Você precisa estar autenticado");

      // Transforma a URL antes de salvar
      const transformedMediaUrl = transformDropboxUrl(mediaUrl);

      const payload = {
        user_id: user.id,
        media_url: transformedMediaUrl,
        media_type: storyType
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

  const handleMediaUpdate = (newUrl: string) => {
    // Transform Dropbox URL if needed
    const transformedUrl = transformDropboxUrl(newUrl);
    setMediaUrl(transformedUrl);
  };

  const handleSubmit = async () => {
    if (!mediaUrl) {
      toast.error(`Por favor, adicione uma ${storyType === "image" ? "imagem" : "vídeo"} para o story`);
      return;
    }
    
    setIsLoading(true);
    try {
      await createStoryMutation.mutateAsync();
    } catch (error) {
      console.error("Error submitting story:", error);
    } finally {
      setIsLoading(false);
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
            {/* Preview do Story */}
            <div className="mb-6">
              <MediaCarousel
                images={storyType === "image" ? [mediaUrl] : []}
                videoUrls={storyType === "video" ? [mediaUrl] : []}
                title="Preview do Story"
                autoplay={true}
                showControls={true}
              />
            </div>

            {/* Formulário de edição */}
            <div className="space-y-4">
              {/* Campo para URL da mídia */}
              <div className="space-y-2">
                <Label htmlFor="media" className="text-white flex items-center gap-2">
                  {storyType === "image" ? <Image size={16} /> : <Video size={16} />}
                  URL da {storyType === "image" ? "Imagem" : "Vídeo"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="media"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder={`URL da ${storyType === "image" ? "imagem" : "vídeo"}`}
                    className="bg-gray-900 border-gray-700 text-white flex-1"
                  />
                  <Button onClick={() => setIsMediaDialogOpen(true)} variant="outline" className="border-gray-700">
                    Editar
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  URL da {storyType === "image" ? "imagem" : "vídeo"} do seu story
                </p>
              </div>

              {/* Botões de ação */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Publicando..." : "Publicar Story"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para editar URL da mídia */}
      <PhotoUrlDialog
        isOpen={isMediaDialogOpen}
        onClose={() => setIsMediaDialogOpen(false)}
        onConfirm={handleMediaUpdate}
        title={`Editar URL da ${storyType === "image" ? "Imagem" : "Vídeo"}`}
        placeholder={`Cole a URL da ${storyType === "image" ? "imagem" : "vídeo"} aqui`}
      />
    </div>
  );
};

export default StoryForm;
