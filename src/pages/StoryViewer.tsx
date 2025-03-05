
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/avatar';
import { supabase } from '../integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Heart, 
  MessageCircle,
  Share,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import StoryComments from '@/components/StoryComments';

const StoryViewer = () => {
  const { username } = useParams<{ username: string }>();
  const [stories, setStories] = useState<any[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const storyTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Obter histórias do usuário pelo username
  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        // Primeiro, obter o ID do usuário pelo username
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();
          
        if (userError) throw userError;
        
        // Depois, obter as histórias ativas desse usuário
        const { data: storiesData, error: storiesError } = await supabase
          .from('stories')
          .select(`
            *,
            profiles:user_id (
              username,
              avatar_url,
              id
            )
          `)
          .eq('user_id', userData.id)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });
          
        if (storiesError) throw storiesError;
        
        if (storiesData.length === 0) {
          toast({
            description: "Este usuário não tem histórias ativas no momento."
          });
          navigate(-1);
          return;
        }
        
        setStories(storiesData);
        
        // Registrar visualização
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Verificar se já visualizou
          const { data: existingView } = await supabase
            .from('story_views')
            .select('id')
            .eq('story_id', storiesData[0].id)
            .eq('viewer_id', session.user.id)
            .single();
            
          if (!existingView) {
            // Registrar nova visualização
            await supabase
              .from('story_views')
              .insert({
                story_id: storiesData[0].id,
                viewer_id: session.user.id
              });
          }
          
          setCurrentUser(session.user);
          
          // Verificar se já curtiu
          checkIfLiked(storiesData[0].id, session.user.id);
        }
        
        // Obter contagem de curtidas
        fetchLikesCount(storiesData[0].id);
      } catch (error) {
        console.error('Erro ao carregar histórias:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as histórias deste usuário."
        });
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStories();
    
    // Limpar timer ao desmontar
    return () => {
      if (storyTimerRef.current) {
        clearTimeout(storyTimerRef.current);
      }
    };
  }, [username, navigate, toast]);
  
  // Verificar se o usuário já curtiu a história
  const checkIfLiked = async (storyId: string, userId: string) => {
    const { data } = await supabase
      .from('story_likes')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', userId)
      .single();
      
    setHasLiked(!!data);
  };
  
  // Obter contagem de curtidas
  const fetchLikesCount = async (storyId: string) => {
    const { count } = await supabase
      .from('story_likes')
      .select('id', { count: 'exact' })
      .eq('story_id', storyId);
      
    setLikesCount(count || 0);
  };
  
  // Curtir ou descurtir história
  const toggleLike = async () => {
    if (!currentUser) {
      toast({
        description: "Você precisa estar logado para curtir uma história."
      });
      return;
    }
    
    const currentStory = stories[currentStoryIndex];
    
    try {
      if (hasLiked) {
        // Remover curtida
        await supabase
          .from('story_likes')
          .delete()
          .eq('story_id', currentStory.id)
          .eq('user_id', currentUser.id);
          
        setHasLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Adicionar curtida
        await supabase
          .from('story_likes')
          .insert({
            story_id: currentStory.id,
            user_id: currentUser.id
          });
          
        setHasLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível processar sua ação."
      });
    }
  };
  
  // Compartilhar história
  const shareStory = async () => {
    const currentStory = stories[currentStoryIndex];
    const shareUrl = `${window.location.origin}/stories/${username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `História de ${username}`,
          text: `Confira a história de ${username}!`,
          url: shareUrl
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Copiar link para área de transferência
      navigator.clipboard.writeText(shareUrl);
      toast({
        description: "Link copiado para a área de transferência!"
      });
    }
  };
  
  // Navegar para próxima história
  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      
      // Resetar estados para nova história
      const nextStory = stories[currentStoryIndex + 1];
      if (currentUser) {
        checkIfLiked(nextStory.id, currentUser.id);
        
        // Registrar visualização se ainda não visualizou
        supabase
          .from('story_views')
          .select('id')
          .eq('story_id', nextStory.id)
          .eq('viewer_id', currentUser.id)
          .single()
          .then(({ data: existingView }) => {
            if (!existingView) {
              supabase
                .from('story_views')
                .insert({
                  story_id: nextStory.id,
                  viewer_id: currentUser.id
                });
            }
          });
      }
      
      fetchLikesCount(nextStory.id);
      setShowComments(false);
    } else {
      // Fim das histórias, voltar
      navigate(-1);
    }
  };
  
  // Navegar para história anterior
  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      
      // Resetar estados para nova história
      const prevStory = stories[currentStoryIndex - 1];
      if (currentUser) {
        checkIfLiked(prevStory.id, currentUser.id);
      }
      
      fetchLikesCount(prevStory.id);
      setShowComments(false);
    } else {
      // Primeira história, voltar à navegação
      navigate(-1);
    }
  };
  
  // Fecha o visualizador
  const closeViewer = () => {
    navigate(-1);
  };
  
  if (isLoading || stories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const currentStory = stories[currentStoryIndex];
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Barra de progresso */}
      <div className="absolute top-0 left-0 right-0 z-10 flex px-2 pt-2 gap-1">
        {stories.map((_, index) => (
          <div 
            key={index} 
            className={`h-1 flex-1 rounded-full ${
              index < currentStoryIndex 
                ? 'bg-white' 
                : index === currentStoryIndex 
                ? 'bg-gray-300' 
                : 'bg-gray-700'
            }`}
          ></div>
        ))}
      </div>
      
      {/* Cabeçalho */}
      <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 border border-white">
            {currentStory.profiles.avatar_url && (
              <img 
                src={currentStory.profiles.avatar_url} 
                alt={currentStory.profiles.username} 
              />
            )}
          </Avatar>
          <div>
            <span className="text-white text-sm font-semibold">
              {currentStory.profiles.username}
            </span>
            <p className="text-gray-300 text-xs">
              {formatDistanceToNow(new Date(currentStory.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </p>
          </div>
        </div>
        
        <button 
          onClick={closeViewer}
          className="text-white rounded-full p-1"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Conteúdo da história */}
      <div className="flex-1 flex items-center justify-center">
        {currentStory.media_type === 'image' ? (
          <img 
            src={currentStory.media_url} 
            alt="Story" 
            className="max-h-full max-w-full object-contain"
          />
        ) : currentStory.media_type === 'video' ? (
          <video 
            src={currentStory.media_url} 
            controls 
            autoPlay 
            playsInline
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full p-4">
            <p className="text-white text-center text-lg">{currentStory.media_url}</p>
          </div>
        )}
      </div>
      
      {/* Navegação lateral */}
      <button 
        className="absolute left-0 top-0 bottom-0 w-1/4 z-0"
        onClick={goToPreviousStory}
      >
        <ChevronLeft className="h-8 w-8 text-white/50 absolute left-2 top-1/2 transform -translate-y-1/2" />
      </button>
      
      <button 
        className="absolute right-0 top-0 bottom-0 w-1/4 z-0"
        onClick={goToNextStory}
      >
        <ChevronRight className="h-8 w-8 text-white/50 absolute right-2 top-1/2 transform -translate-y-1/2" />
      </button>
      
      {/* Barra de ações */}
      <div className={`absolute bottom-0 left-0 right-0 bg-black/80 p-3 z-20 ${showComments ? 'pb-0' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white" 
              onClick={toggleLike}
            >
              <Heart 
                className={`h-6 w-6 mr-1 ${hasLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
              />
              {likesCount > 0 && <span>{likesCount}</span>}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white" 
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-6 w-6 mr-1" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white" 
              onClick={shareStory}
            >
              <Share className="h-6 w-6 mr-1" />
            </Button>
            
            {currentStory.link_url && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white"
                onClick={() => window.open(currentStory.link_url, '_blank')}
              >
                <LinkIcon className="h-6 w-6 mr-1" />
                <span className="text-sm">Link</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Área de comentários */}
        {showComments && (
          <div className="bg-white dark:bg-gray-900 rounded-t-xl mt-2 p-4 max-h-[70vh] overflow-y-auto">
            <StoryComments 
              storyId={currentStory.id} 
              storyOwnerId={currentStory.profiles.id}
              commentsEnabled={currentStory.comments_enabled !== false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
