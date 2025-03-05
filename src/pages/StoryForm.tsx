
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Camera, Video, Trash2, Type } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import PhotoUrlDialog from "../components/PhotoUrlDialog";
import { MediaCarousel } from "../components/MediaCarousel";

interface StoryFormState {
  type: "text" | "image" | "video";
  url?: string;
  content?: string;
}

const StoryForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const formState = location.state as StoryFormState | null;
  
  const [storyType, setStoryType] = useState<"text" | "image" | "video">(formState?.type || "image");
  const [mediaUrl, setMediaUrl] = useState<string>(formState?.url || "");
  const [textContent, setTextContent] = useState<string>(formState?.content || "");
  const [textBackgroundColor, setTextBackgroundColor] = useState<string>("#000000");
  const [textColor, setTextColor] = useState<string>("#FFFFFF");
  const [fontSize, setFontSize] = useState<string>("24px");
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

      // For text stories, store the content in the media_url field with special formatting
      const payload = {
        user_id: user.id,
        media_url: storyType === "text" 
          ? JSON.stringify({
              text: textContent,
              bgcolor: textBackgroundColor,
              color: textColor,
              fontSize: fontSize
            }) 
          : mediaUrl,
        media_type: storyType,
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
    setStoryType(type);
    setMediaUrl(url);
  };

  const handleSubmit = async () => {
    if (storyType === "text" && !textContent) {
      toast.error("Por favor, adicione algum texto para o story");
      return;
    }
    
    if ((storyType === "image" || storyType === "video") && !mediaUrl) {
      toast.error("Por favor, adicione uma mídia para o story");
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

  const colorOptions = [
    "#000000", "#FF5252", "#7C4DFF", "#2196F3", 
    "#00BCD4", "#009688", "#4CAF50", "#FFEB3B", 
    "#FF9800", "#795548", "#607D8B"
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-14 pb-20">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-black">
        <Button variant="ghost" size="icon" onClick={() => navigate("/story/creator")}>
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        <h1 className="text-lg font-semibold">
          {storyType === "text" ? "Story de Texto" : 
           storyType === "image" ? "Story de Imagem" : "Story de Vídeo"}
        </h1>
        <div className="w-10" />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <Card className="overflow-hidden bg-black border-gray-800">
          <CardContent className="p-4">
            {storyType === "text" ? (
              <div 
                className="mb-4 p-4 rounded min-h-[300px] flex items-center justify-center"
                style={{ backgroundColor: textBackgroundColor }}
              >
                <Textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Digite seu texto aqui..."
                  className="bg-transparent text-center border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ 
                    color: textColor,
                    fontSize: fontSize,
                    textAlign: "center"
                  }}
                />
              </div>
            ) : mediaUrl ? (
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

            {/* Text customization controls - only show for text stories */}
            {storyType === "text" && (
              <div className="mb-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Cor de fundo</p>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${textBackgroundColor === color ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTextBackgroundColor(color)}
                        aria-label={`Cor de fundo ${color}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Cor do texto</p>
                  <div className="flex flex-wrap gap-2">
                    {['#FFFFFF', '#000000', '#FF5252', '#2196F3', '#4CAF50', '#FFEB3B'].map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${textColor === color ? 'ring-2 ring-blue-500' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTextColor(color)}
                        aria-label={`Cor do texto ${color}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Tamanho do texto</p>
                  <div className="flex gap-2">
                    {['18px', '24px', '32px', '42px'].map(size => (
                      <button
                        key={size}
                        className={`px-3 py-1 rounded ${fontSize === size ? 'bg-blue-600' : 'bg-gray-800'}`}
                        onClick={() => setFontSize(size)}
                      >
                        {size.replace('px', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-4">
              {(mediaUrl || textContent) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (storyType === "text") {
                      setTextContent("");
                    } else {
                      setMediaUrl("");
                    }
                  }}
                  className="flex-1 border-gray-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              )}
              
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                disabled={
                  (storyType === "text" && !textContent) || 
                  ((storyType === "image" || storyType === "video") && !mediaUrl) || 
                  isUploading
                }
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
