
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { X, Heart, MessageCircle, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import StoryComments from '@/components/StoryComments';

const StoryViewer = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Referências para vídeos
  const videoRef = useRef<HTMLVideoElement>(null);

  // Buscar usuário atual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser(data.user);
      }
    };

    fetchCurrentUser();
  }, []);

  // Buscar stories do usuário
  const { data: stories, isLoading } = useQuery({
    queryKey: ['userStories', userId],
    queryFn: async () => {
      const { data: userStories, error } = await supabase
        .from('stories')
        .select(`
          *,
          user:profiles!stories_user_id_fkey (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return userStories;
    },
  });

  // Verificar se o usuário atual já curtiu a story atual
  useEffect(() => {
    if (stories && stories.length > 0 && currentUser) {
      const checkLike = async () => {
        const { data: likeData } = await supabase
          .from('story_likes')
          .select('*')
          .eq('story_id', stories[currentStoryIndex].id)
          .eq('user_id', currentUser.id)
          .single();

        setIsLiked(!!likeData);
      };

      checkLike();
    }
  }, [stories, currentStoryIndex, currentUser]);

  // Registrar visualização da story
  useEffect(() => {
    if (stories && stories.length > 0 && currentUser && currentUser.id !== userId) {
      const registerView = async () => {
        // Verificar se já visualizou
        const { data: existingView } = await supabase
          .from('story_views')
          .select('*')
          .eq('story_id', stories[currentStoryIndex].id)
          .eq('viewer_id', currentUser.id)
          .single();

        // Se não visualizou, registrar
        if (!existingView) {
          await supabase
            .from('story_views')
            .insert({
              story_id: stories[currentStoryIndex].id,
              viewer_id: currentUser.id,
            });
        }
      };

      registerView();
    }
  }, [stories, currentStoryIndex, currentUser, userId]);

  // Controle de vídeo para autoplay
  useEffect(() => {
    if (stories && stories.length > 0) {
      const currentStory = stories[currentStoryIndex];
      if (currentStory.media_type === 'video' && videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(error => {
          console.error('Erro ao reproduzir vídeo:', error);
        });
      }
    }
  }, [stories, currentStoryIndex]);

  // Navegar entre stories
  const goToNextStory = () => {
    if (stories && currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      navigate(-1);
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  // Curtir story
  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Atenção",
        description: "Você precisa estar logado para curtir uma story",
      });
      return;
    }

    if (stories) {
      try {
        if (isLiked) {
          // Remover curtida
          await supabase
            .from('story_likes')
            .delete()
            .eq('story_id', stories[currentStoryIndex].id)
            .eq('user_id', currentUser.id);
          
          setIsLiked(false);
        } else {
          // Adicionar curtida
          await supabase
            .from('story_likes')
            .insert({
              story_id: stories[currentStoryIndex].id,
              user_id: currentUser.id,
            });
          
          setIsLiked(true);
        }
      } catch (error) {
        console.error('Erro ao curtir/descurtir story:', error);
      }
    }
  };

  // Compartilhar story
  const handleShare = () => {
    if (navigator.share && stories) {
      navigator.share({
        title: `Story de ${stories[currentStoryIndex].user.username}`,
        text: `Confira este story de ${stories[currentStoryIndex].user.username}`,
        url: window.location.href,
      }).catch(error => {
        console.error('Erro ao compartilhar:', error);
      });
    } else {
      // Fallback para copiar o link
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado",
        description: "Link copiado para a área de transferência",
      });
    }
  };

  // Fechar viewer
  const handleClose = () => {
    navigate(-1);
  };

  // Toggle de comentários
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <div className="text-white mb-4">Nenhuma story disponível</div>
        <Button onClick={handleClose} variant="outline">Voltar</Button>
      </div>
    );
  }

  const currentStory = stories[currentStoryIndex];

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col">
        {/* Cabeçalho */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              {currentStory.user.avatar_url ? (
                <AvatarImage src={currentStory.user.avatar_url} alt={currentStory.user.username} />
              ) : (
                <AvatarFallback>
                  {currentStory.user.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-white">
              <div className="text-sm font-semibold">{currentStory.user.username}</div>
              <div className="text-xs opacity-70">
                {new Date(currentStory.created_at).toLocaleString()}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={handleClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Conteúdo da Story */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {currentStory.media_type === 'image' ? (
            <img
              src={currentStory.media_url}
              alt="Story"
              className="max-h-full max-w-full object-contain"
            />
          ) : currentStory.media_type === 'video' ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full object-contain"
            >
              <source src={currentStory.media_url} type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg text-white max-w-sm">
              {currentStory.media_url}
            </div>
          )}
        </div>

        {/* Comentários */}
        {showComments && (
          <div className="absolute inset-0 bg-black bg-opacity-90 overflow-y-auto">
            <div className="p-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white mb-4"
                onClick={toggleComments}
              >
                <X className="h-6 w-6" />
              </Button>
              
              <StoryComments 
                storyId={currentStory.id} 
                storyOwnerId={currentStory.user_id}
                commentsEnabled={currentStory.comments_enabled !== false}
              />
            </div>
          </div>
        )}

        {/* Botões de navegação */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3" onClick={goToPreviousStory}>
          {currentStoryIndex > 0 && (
            <div className="h-full flex items-center justify-start pl-2">
              <ChevronLeft className="h-8 w-8 text-white opacity-50" />
            </div>
          )}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3" onClick={goToNextStory}>
          <div className="h-full flex items-center justify-end pr-2">
            <ChevronRight className="h-8 w-8 text-white opacity-50" />
          </div>
        </div>

        {/* Ações no rodapé */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-around">
          <Button
            variant="ghost"
            size="icon"
            className={`${isLiked ? 'text-red-500' : 'text-white'}`}
            onClick={handleLike}
          >
            <Heart className="h-6 w-6" fill={isLiked ? 'currentColor' : 'none'} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={toggleComments}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={handleShare}
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
