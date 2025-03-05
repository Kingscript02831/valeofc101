
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Eye } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { format } from "date-fns";

interface Story {
  id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  views_count?: number;
}

const StoryManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Busca o usuário atual
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return null;
      }
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      return { ...data, id: user.id };
    },
  });

  // Busca stories do usuário atual
  const { data: stories, isLoading } = useQuery({
    queryKey: ["myStories", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      // Busca stories não expirados
      const { data: stories, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", currentUser.id)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Para cada story, busca o número de visualizações
      const storiesWithViews = await Promise.all(stories.map(async (story) => {
        const { count, error: viewsError } = await supabase
          .from("story_views")
          .select("*", { count: "exact", head: true })
          .eq("story_id", story.id);
          
        if (viewsError) throw viewsError;
        
        return {
          ...story,
          views_count: count || 0
        };
      }));
      
      return storiesWithViews;
    },
    enabled: !!currentUser?.id,
  });

  // Mutação para excluir um story
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myStories"] });
      queryClient.invalidateQueries({ queryKey: ["userStories"] });
      toast.success("Story excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir story:", error);
      toast.error("Erro ao excluir o story");
    },
  });

  const handleDeleteStory = (storyId: string) => {
    if (confirm("Tem certeza que deseja excluir este story?")) {
      deleteStoryMutation.mutate(storyId);
    }
  };

  const formatExpiryTime = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    
    // Calcular diferença em horas
    const diffHours = Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return "Expira em menos de 1 hora";
    } else if (diffHours === 1) {
      return "Expira em 1 hora";
    } else if (diffHours < 24) {
      return `Expira em ${diffHours} horas`;
    } else {
      return `Expira em ${Math.floor(diffHours / 24)} dia(s)`;
    }
  };

  const getStoryPreview = (story: Story) => {
    // For text stories, the content is stored as JSON in the media_url field
    if (story.media_type === "text") {
      try {
        // Try to parse the JSON content
        const textContent = JSON.parse(story.media_url);
        return (
          <div 
            className="h-full w-full flex items-center justify-center"
            style={{ 
              backgroundColor: textContent.bgcolor || "#000000",
              color: textContent.color || "#FFFFFF",
              fontSize: textContent.fontSize || "16px",
              padding: "8px"
            }}
          >
            <p className="text-center truncate">{textContent.text}</p>
          </div>
        );
      } catch (e) {
        // Fallback if parsing fails
        return (
          <div className="h-full w-full flex items-center justify-center bg-gray-800">
            <p className="text-center truncate text-sm">{story.media_url}</p>
          </div>
        );
      }
    }
    
    // For image and video stories
    return story.media_type === 'video' ? (
      <video 
        src={story.media_url} 
        className="h-full w-full object-cover"
      />
    ) : (
      <img 
        src={story.media_url} 
        alt="Story preview" 
        className="h-full w-full object-cover"
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
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">Seus Stories</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/story/creator")}
          className="text-blue-500"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <div className="container max-w-md mx-auto p-4">
        {/* Informações do perfil */}
        {currentUser && (
          <Card className="mb-4 overflow-hidden bg-white dark:bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar 
                  className="h-16 w-16 border cursor-pointer"
                  onClick={() => navigate(`/story/view/${currentUser.id}`)}
                >
                  {currentUser.avatar_url ? (
                    <AvatarImage src={currentUser.avatar_url} alt={currentUser.username || ""} />
                  ) : (
                    <AvatarFallback>
                      {currentUser.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h2 className="font-semibold">{currentUser.username || "Usuário"}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stories?.length || 0} stories ativos
                  </p>
                </div>
                <div className="ml-auto">
                  <Button 
                    onClick={() => navigate("/story/creator")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Adicionar Story
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Stories */}
        <Card className="overflow-hidden bg-white dark:bg-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Carregando seus stories...</p>
              </div>
            ) : stories?.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Você não possui stories ativos.</p>
                <Button 
                  onClick={() => navigate("/story/creator")}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Criar Primeiro Story
                </Button>
              </div>
            ) : (
              <div>
                {stories?.map((story, index) => (
                  <div key={story.id}>
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Preview da mídia */}
                        <div 
                          className="h-16 w-16 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/story/view/${currentUser?.id}`)}
                        >
                          {getStoryPreview(story)}
                        </div>
                        
                        {/* Detalhes do story */}
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <p className="text-xs text-gray-500">
                              {format(new Date(story.created_at), "dd/MM/yyyy • HH:mm")}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatExpiryTime(story.expires_at)}
                          </p>
                          <div className="flex items-center mt-1 gap-2">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {story.views_count} visualizações
                            </span>
                          </div>
                        </div>
                        
                        {/* Botões de ação */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStory(story.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    {index < stories.length - 1 && (
                      <Separator />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoryManager;
