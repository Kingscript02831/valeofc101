
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Link as LinkIcon, Save, Image, Video } from "lucide-react";
import { MediaCarousel } from "../components/MediaCarousel";
import PhotoUrlDialog from "../components/PhotoUrlDialog";

interface StoryData {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video" | "text";
  created_at: string;
  expires_at: string;
  link_url?: string | null;
}

const StoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "text">("image");
  const [isLoading, setIsLoading] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

  // Fetch story data
  const { data: story, isLoading: isStoryLoading } = useQuery({
    queryKey: ["story", id],
    queryFn: async () => {
      if (!id) throw new Error("ID da história não encontrado");

      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as StoryData;
    },
  });

  // Initialize form with existing data when story data is loaded
  useEffect(() => {
    if (story) {
      if (story.link_url) {
        setLinkUrl(story.link_url);
      }
      if (story.media_url) {
        setMediaUrl(story.media_url);
      }
      if (story.media_type) {
        setMediaType(story.media_type);
      }
    }
  }, [story]);

  // Update story mutation
  const updateStoryMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID da história não encontrado");

      // Fields to update - make sure this matches the database schema
      const { data, error } = await supabase
        .from("stories")
        .update({
          link_url: linkUrl || null,
          media_url: mediaUrl
        })
        .eq("id", id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story", id] });
      queryClient.invalidateQueries({ queryKey: ["userStories"] });
      toast.success("História atualizada com sucesso!");
      navigate("/story/creator");
    },
    onError: (error) => {
      console.error("Error updating story:", error);
      toast.error("Erro ao atualizar história. Tente novamente.");
    },
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await updateStoryMutation.mutateAsync();
    } catch (error) {
      console.error("Error submitting story:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUpdate = (newUrl: string) => {
    setMediaUrl(newUrl);
  };

  if (isStoryLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">História não encontrada</p>
          <Button 
            onClick={() => navigate("/story/creator")} 
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-14 pb-20">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-black">
        <Button variant="ghost" size="icon" onClick={() => navigate("/story/creator")}>
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        <h1 className="text-lg font-semibold">
          Editar {mediaType === "image" ? "Imagem" : "Vídeo"}
        </h1>
        <div className="w-10" />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <Card className="overflow-hidden bg-black border-gray-800">
          <CardContent className="p-4">
            {/* Preview do Story */}
            <div className="mb-6">
              <MediaCarousel
                images={mediaType === "image" ? [mediaUrl] : []}
                videoUrls={mediaType === "video" ? [mediaUrl] : []}
                title="Preview do Story"
                autoplay={true}
                showControls={true}
              />
            </div>

            {/* Formulário de edição */}
            <div className="space-y-4">
              {/* Campo para alterar URL da mídia */}
              <div className="space-y-2">
                <Label htmlFor="media" className="text-white flex items-center gap-2">
                  {mediaType === "image" ? <Image size={16} /> : <Video size={16} />}
                  URL da {mediaType === "image" ? "Imagem" : "Vídeo"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="media"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder={`URL da ${mediaType === "image" ? "imagem" : "vídeo"}`}
                    className="bg-gray-900 border-gray-700 text-white flex-1"
                  />
                  <Button onClick={() => setIsMediaDialogOpen(true)} variant="outline" className="border-gray-700">
                    Editar
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Altere a URL da {mediaType === "image" ? "imagem" : "vídeo"} do seu story
                </p>
              </div>

              {/* Campo para adicionar link */}
              <div className="space-y-2">
                <Label htmlFor="link" className="text-white flex items-center gap-2">
                  <LinkIcon size={16} />
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

              {/* Botões de ação */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  <Save size={18} />
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
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
        title={`Editar URL da ${mediaType === "image" ? "Imagem" : "Vídeo"}`}
        placeholder={`Cole a URL da ${mediaType === "image" ? "imagem" : "vídeo"} aqui`}
      />
    </div>
  );
};

export default StoryEdit;
