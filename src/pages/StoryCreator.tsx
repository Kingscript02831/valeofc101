
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Upload, Type, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { supabase } from "../integrations/supabase/client";
import PhotoUrlDialog from "../components/PhotoUrlDialog";
import { transformDropboxUrl } from "../utils/mediaUtils";

const StoryCreator = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [mediaType, setMediaType] = useState<"image" | "video" | "text" | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [textContent, setTextContent] = useState<{
    text: string;
    bgcolor: string;
    color: string;
    fontSize: string;
  }>({
    text: "",
    bgcolor: "#000000",
    color: "#FFFFFF",
    fontSize: "24px"
  });
  
  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async () => {
      // Check user authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Prepare story data based on media type
      let finalMediaUrl = mediaUrl;
      
      if (mediaType === "text") {
        // For text stories, store the content as JSON
        finalMediaUrl = JSON.stringify(textContent);
      } else if (mediaType === "image" || mediaType === "video") {
        // Transform Dropbox URLs for direct embedding if needed
        finalMediaUrl = transformDropboxUrl(mediaUrl);
      }

      // Calculate expiry date (24 hours from now)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      
      // Insert the story
      const { data, error } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          media_type: mediaType,
          media_url: finalMediaUrl,
          expires_at: expiryDate.toISOString()
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myStories"] });
      queryClient.invalidateQueries({ queryKey: ["userStories"] });
      toast.success("Story criado com sucesso!");
      navigate("/story/manage");
    },
    onError: (error) => {
      console.error("Erro ao criar story:", error);
      toast.error("Erro ao criar o story. Verifique sua conexão.");
    }
  });

  const handleMediaUpload = (url: string) => {
    setMediaUrl(url);
    setPreviewUrl(url);
    setIsUrlDialogOpen(false);
  };

  const handleTextInput = (text: string) => {
    setTextContent({
      ...textContent,
      text
    });
    setIsTextDialogOpen(false);
  };

  const handlePublish = () => {
    if (!mediaType) {
      toast.error("Selecione um tipo de mídia primeiro");
      return;
    }

    if (mediaType === "text" && !textContent.text) {
      setIsTextDialogOpen(true);
      return;
    }

    if ((mediaType === "image" || mediaType === "video") && !mediaUrl) {
      setIsUrlDialogOpen(true);
      return;
    }

    createStoryMutation.mutate();
  };

  const renderMediaPreview = () => {
    if (!mediaType) return null;

    if (mediaType === "text") {
      return (
        <div 
          className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
          style={{ 
            backgroundColor: textContent.bgcolor,
            color: textContent.color,
            fontSize: textContent.fontSize
          }}
          onClick={() => setIsTextDialogOpen(true)}
        >
          {textContent.text ? (
            <p className="text-center break-words">{textContent.text}</p>
          ) : (
            <p className="text-center opacity-70">Clique para adicionar texto</p>
          )}
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4" onClick={() => setIsUrlDialogOpen(true)}>
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-center text-gray-500">Clique para adicionar {mediaType === "image" ? "imagem" : "vídeo"}</p>
        </div>
      );
    }

    return mediaType === "video" ? (
      <video 
        src={previewUrl} 
        className="w-full h-full object-contain"
        controls
      />
    ) : (
      <img 
        src={previewUrl} 
        alt="Story preview" 
        className="w-full h-full object-contain"
      />
    );
  };

  // Function to exit the app
  const exitApp = () => {
    window.location.href = 'https://valeofc.glideapp.io/';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pt-14 pb-20">
      {/* Cabeçalho fixo */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white/90 dark:bg-black/90 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={exitApp}>
          <X className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">Criar Story</h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handlePublish}
          disabled={createStoryMutation.isPending}
          className="text-blue-500"
        >
          <Save className="h-6 w-6" />
        </Button>
      </div>

      <div className="container max-w-md mx-auto p-4">
        {/* Área de seleção de mídia */}
        <Card className="overflow-hidden bg-white dark:bg-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Button
                variant={mediaType === "image" ? "default" : "outline"}
                className="w-full"
                onClick={() => {
                  setMediaType("image");
                  setMediaUrl("");
                  setPreviewUrl("");
                }}
              >
                Imagem
              </Button>
              <Button
                variant={mediaType === "video" ? "default" : "outline"}
                className="w-full"
                onClick={() => {
                  setMediaType("video");
                  setMediaUrl("");
                  setPreviewUrl("");
                }}
              >
                Vídeo
              </Button>
              <Button
                variant={mediaType === "text" ? "default" : "outline"}
                className="w-full"
                onClick={() => {
                  setMediaType("text");
                  setTextContent({
                    text: "",
                    bgcolor: "#000000",
                    color: "#FFFFFF",
                    fontSize: "24px"
                  });
                }}
              >
                Texto
              </Button>
            </div>

            {/* Preview da mídia */}
            <div className="aspect-[9/16] w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
              {renderMediaPreview()}
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between">
              {mediaType === "text" ? (
                <Button 
                  onClick={() => setIsTextDialogOpen(true)}
                  className="w-full"
                  disabled={createStoryMutation.isPending}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Editar Texto
                </Button>
              ) : (
                <Button
                  onClick={() => setIsUrlDialogOpen(true)}
                  className="w-full"
                  disabled={!mediaType || createStoryMutation.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {mediaType === "image" ? "Adicionar Imagem" : mediaType === "video" ? "Adicionar Vídeo" : "Adicionar Mídia"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botão de publicar */}
        <Button
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          onClick={handlePublish}
          disabled={createStoryMutation.isPending}
        >
          {createStoryMutation.isPending ? "Publicando..." : "Publicar Story"}
        </Button>
      </div>

      {/* Dialogs */}
      <PhotoUrlDialog
        isOpen={isUrlDialogOpen}
        onClose={() => setIsUrlDialogOpen(false)}
        onConfirm={handleMediaUpload}
        title={mediaType === "image" ? "Adicionar URL da imagem" : "Adicionar URL do vídeo"}
        placeholder={mediaType === "image" ? "Cole a URL da imagem aqui" : "Cole a URL do vídeo aqui"}
        textInputOnly={false}
      />

      <PhotoUrlDialog
        isOpen={isTextDialogOpen}
        onClose={() => setIsTextDialogOpen(false)}
        onConfirm={handleTextInput}
        title="Adicionar texto para o story"
        placeholder="Digite o texto do seu story aqui..."
        textInputOnly={true}
      />
    </div>
  );
};

export default StoryCreator;
