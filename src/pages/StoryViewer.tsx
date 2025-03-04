
import { useState, useEffect, useRef, TouchEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, ChevronLeft, ChevronRight, Trash2, Send, MessageSquare, Heart, MoreVertical } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  created_at: string;
  expires_at: string;
  user?: {
    username: string;
    avatar_url: string;
  };
}

interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

const StoryViewer = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      return user;
    },
  });

  // Get all users with active stories
  const { data: usersWithStories } = useQuery({
    queryKey: ["usersWithStories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("user_id")
        .gt("expires_at", new Date().toISOString())
        .order("created_at");

      if (error) throw error;
      
      // Get unique user IDs
      const uniqueUserIds = Array.from(new Set(data.map((story: any) => story.user_id)));
      console.log("Users with stories:", uniqueUserIds);
      return uniqueUserIds;
    },
  });

  const isOwner = currentUser?.id === userId;

  // Get stories for the current user ID
  const { data: stories, isLoading } = useQuery({
    queryKey: ["viewStories", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", userId)
        .gt("expires_at", new Date().toISOString())
        .order("created_at");

      if (error) throw error;

      // Transform the story data to match our interface
      const typedStories: Story[] = data.map((story: any) => ({
        ...story,
        media_type: story.media_type as "image" | "video",
        user: userData
      }));

      return typedStories;
    },
    enabled: !!userId,
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ["storyComments", stories?.[currentStoryIndex]?.id],
    queryFn: async () => {
      if (!stories || stories.length === 0 || currentStoryIndex >= stories.length) return [];
      
      const { data, error } = await supabase
        .from("story_comments")
        .select("*, profiles:user_id(username, avatar_url)")
        .eq("story_id", stories[currentStoryIndex].id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data as StoryComment[];
    },
    enabled: !!stories && stories.length > 0 && currentStoryIndex < stories.length,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("story_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", currentUser?.id);

      if (error) throw error;
      
      return commentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storyComments", stories?.[currentStoryIndex]?.id] });
    },
    onError: (error) => {
      console.error("Erro ao excluir comentário:", error);
      toast.error("Erro ao excluir comentário");
    }
  });

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Tem certeza que deseja excluir este comentário?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const checkUserLike = async (storyId: string) => {
    if (!currentUser || !storyId) return;

    const { data, error } = await supabase
      .from("story_likes")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", currentUser.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao verificar curtida:", error);
      return;
    }

    setHasLiked(!!data);
  };

  const fetchLikesCount = async (storyId: string) => {
    if (!storyId) return;

    const { count, error } = await supabase
      .from("story_likes")
      .select("id", { count: "exact", head: true })
      .eq("story_id", storyId);

    if (error) {
      console.error("Erro ao contar curtidas:", error);
      return;
    }

    setLikesCount(count || 0);
  };

  useEffect(() => {
    if (!stories || stories.length === 0 || currentStoryIndex >= stories.length) return;
    
    const storyId = stories[currentStoryIndex].id;
    checkUserLike(storyId);
    fetchLikesCount(storyId);
    setShowComments(false);
    setIsPaused(false);
  }, [currentStoryIndex, stories, currentUser]);

  const markAsViewedMutation = useMutation({
    mutationFn: async (storyId: string) => {
      if (!currentUser || isOwner) return;

      const { error } = await supabase
        .from("story_views")
        .upsert({
          story_id: storyId,
          viewer_id: currentUser.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories"] });
      queryClient.invalidateQueries({ queryKey: ["followingWithStories"] });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (storyId: string) => {
      if (!currentUser) return;

      if (hasLiked) {
        const { error } = await supabase
          .from("story_likes")
          .delete()
          .eq("story_id", storyId)
          .eq("user_id", currentUser.id);

        if (error) throw error;
        
        return { action: 'unlike' };
      } else {
        const { error } = await supabase
          .from("story_likes")
          .insert({
            story_id: storyId,
            user_id: currentUser.id,
          });

        if (error) throw error;
        
        return { action: 'like' };
      }
    },
    onSuccess: (data, storyId) => {
      setHasLiked(!hasLiked);
      setLikesCount(prev => data?.action === 'like' ? prev + 1 : prev - 1);
      
      queryClient.invalidateQueries({ queryKey: ["storyLikes", storyId] });
    },
    onError: (error) => {
      console.error("Erro ao curtir/descurtir:", error);
      toast.error("Erro ao processar sua curtida");
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ storyId, text }: { storyId: string, text: string }) => {
      if (!currentUser) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("story_comments")
        .insert({
          story_id: storyId,
          user_id: currentUser.id,
          text: text,
        })
        .select("*, profiles:user_id(username, avatar_url)")
        .single();

      if (error) throw error;
      
      return data as StoryComment;
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["storyComments", stories?.[currentStoryIndex]?.id] });
    },
    onError: (error) => {
      console.error("Erro ao adicionar comentário:", error);
      toast.error("Erro ao adicionar comentário");
    }
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories"] });
      queryClient.invalidateQueries({ queryKey: ["viewStories"] });
      queryClient.invalidateQueries({ queryKey: ["followingWithStories"] }); 
      toast.success("História excluída com sucesso");
      
      if (stories && stories.length <= 1) {
        navigate("/");
      } else {
        if (currentStoryIndex >= stories.length - 1) {
          setCurrentStoryIndex(stories.length - 2);
        }
      }
    },
    onError: (error) => {
      console.error("Error deleting story:", error);
      toast.error("Erro ao excluir história");
    },
  });

  useEffect(() => {
    if (isLoading || !stories || stories.length === 0) return;

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (stories[currentStoryIndex]) {
      markAsViewedMutation.mutate(stories[currentStoryIndex].id);
    }

    if (videoRef.current && stories[currentStoryIndex]?.media_type === 'video') {
      setProgress(0);
      return;
    }

    if (showComments || isPaused) {
      return;
    }

    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;
    
    setProgress(0);
    
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + step;
        if (newProgress >= 100) {
          goToNextStory();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [currentStoryIndex, isLoading, stories, showComments, isPaused]);

  const handleVideoProgress = () => {
    if (!videoRef.current) return;
    
    const { currentTime, duration } = videoRef.current;
    const calculatedProgress = (currentTime / duration) * 100;
    setProgress(calculatedProgress);
  };

  const handleVideoEnded = () => {
    goToNextStory();
  };

  const goToNextStory = () => {
    if (!stories || stories.length === 0) return;
    
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      goToNextUser();
    }
  };

  const goToPrevUser = () => {
    if (!usersWithStories || !userId) return;
    
    const currentUserIndex = usersWithStories.indexOf(userId);
    console.log("Current user index:", currentUserIndex);
    
    if (currentUserIndex > 0) {
      const prevUserId = usersWithStories[currentUserIndex - 1];
      console.log("Going to previous user:", prevUserId);
      navigate(`/story/view/${prevUserId}`);
    } else {
      console.log("No previous user, going back");
      navigate(-1);
    }
  };

  const goToNextUser = () => {
    if (!usersWithStories || !userId) return;
    
    const currentUserIndex = usersWithStories.indexOf(userId);
    console.log("Current user index:", currentUserIndex, "Total users:", usersWithStories.length);
    
    if (currentUserIndex !== -1 && currentUserIndex < usersWithStories.length - 1) {
      const nextUserId = usersWithStories[currentUserIndex + 1];
      console.log("Going to next user:", nextUserId);
      navigate(`/story/view/${nextUserId}`);
    } else {
      console.log("No next user, going back");
      navigate("/");
    }
  };

  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      goToPrevUser();
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    
    // Start a timer for long press detection
    longPressTimer.current = setTimeout(() => {
      if (!isPaused) {
        setIsPaused(true);
        if (videoRef.current && videoRef.current.paused === false) {
          videoRef.current.pause();
        }
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      }
    }, 200);
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    
    // If moved more than a small threshold, cancel the long press
    if (touchStartX.current && touchEndX.current && touchStartY.current && touchEndY.current) {
      const xDiff = Math.abs(touchStartX.current - touchEndX.current);
      const yDiff = Math.abs(touchStartY.current - touchEndY.current);
      if (xDiff > 10 || yDiff > 10) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // If it was paused due to long press, resume playback
    if (isPaused) {
      setIsPaused(false);
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play();
      }
      
      // Restart the progress interval
      if (!progressInterval.current && !showComments) {
        const duration = 5000;
        const interval = 50;
        const step = (interval / duration) * 100;
        
        progressInterval.current = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + step;
            if (newProgress >= 100) {
              goToNextStory();
              return 0;
            }
            return newProgress;
          });
        }, interval);
      }
      return;
    }
    
    if (!touchStartX.current || !touchEndX.current || !touchStartY.current || !touchEndY.current) {
      return;
    }
    
    const horizontalDistance = touchStartX.current - touchEndX.current;
    const verticalDistance = touchStartY.current - touchEndY.current;
    
    if (Math.abs(horizontalDistance) > Math.abs(verticalDistance)) {
      if (Math.abs(horizontalDistance) > 50) {
        if (horizontalDistance > 0) {
          goToNextStory();
        } else {
          goToPrevStory();
        }
      }
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
    touchStartTime.current = null;
  };

  const handleDeleteStory = () => {
    if (!stories) return;
    
    if (confirm("Tem certeza que deseja excluir esta história?")) {
      deleteStoryMutation.mutate(stories[currentStoryIndex].id);
    }
  };

  const handleLikeStory = () => {
    if (!stories || !currentUser) return;
    
    toggleLikeMutation.mutate(stories[currentStoryIndex].id);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !stories || !currentUser) return;
    
    addCommentMutation.mutate({
      storyId: stories[currentStoryIndex].id,
      text: commentText.trim()
    });
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    
    if (!showComments && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 300);
    }
  };
  
  const handleCloseComments = () => {
    setShowComments(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <p className="text-xl mb-4">Não há histórias para mostrar</p>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

  const currentStory = stories[currentStoryIndex];

  return (
    <div 
      className="fixed inset-0 bg-black flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-0 left-0 right-0 z-10 p-2 flex gap-1">
        {stories.map((_, index) => (
          <div key={index} className="h-1 bg-gray-600 flex-1 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-100 ease-linear ${index < currentStoryIndex ? 'w-full' : index === currentStoryIndex ? '' : 'w-0'}`}
              style={{ width: index === currentStoryIndex ? `${progress}%` : index < currentStoryIndex ? '100%' : '0%' }}
            ></div>
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-0 right-0 z-10 px-4 pt-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3 border border-white">
            <AvatarImage 
              src={currentStory.user?.avatar_url || undefined} 
              alt={currentStory.user?.username || "Usuário"} 
            />
            <AvatarFallback>
              {currentStory.user?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-white font-medium">
              {currentStory.user?.username || "Usuário"}
            </p>
            <p className="text-gray-300 text-xs">
              {new Date(currentStory.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white" 
            onClick={() => navigate(-1)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {currentStory.media_type === 'video' ? (
          <video
            ref={videoRef}
            src={currentStory.media_url}
            className="max-h-screen max-w-full object-contain"
            autoPlay
            playsInline
            onTimeUpdate={handleVideoProgress}
            onEnded={handleVideoEnded}
            controls={false}
          />
        ) : (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="max-h-screen max-w-full object-contain"
          />
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white" 
          onClick={goToPrevStory}
          disabled={currentStoryIndex === 0 && usersWithStories?.indexOf(userId as string) === 0}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white" 
          onClick={goToNextStory}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-t-3xl transition-all duration-300 ease-in-out overflow-hidden ${
          showComments ? 'h-[60vh]' : 'h-0'
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto"></div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={handleCloseComments}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <h3 className="text-black dark:text-white font-semibold mb-4">Comentários</h3>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingComments ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black dark:border-white"></div>
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage 
                        src={comment.profiles?.avatar_url || undefined} 
                        alt={comment.profiles?.username || "Usuário"} 
                      />
                      <AvatarFallback>
                        {comment.profiles?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-black dark:text-white text-sm font-medium">
                          {comment.profiles?.username || "Usuário"}
                        </p>
                        {currentUser && comment.user_id === currentUser.id && (
                          <Button 
                            onClick={() => handleDeleteComment(comment.id)}
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Sem comentários ainda
              </div>
            )}
          </div>
          
          <form onSubmit={handleAddComment} className="mt-4 flex items-center gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              {currentUser && (
                <>
                  <AvatarImage 
                    src={currentUser.user_metadata?.avatar_url || undefined} 
                    alt={currentUser.user_metadata?.full_name || "Você"} 
                  />
                  <AvatarFallback>
                    {currentUser.user_metadata?.full_name?.charAt(0).toUpperCase() || "V"}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <Input
              ref={commentInputRef}
              type="text"
              placeholder="Adicione um comentário..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-gray-100 dark:bg-gray-800 border-none text-black dark:text-white rounded-full placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost" 
              className="text-black dark:text-white"
              disabled={!commentText.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-sm">
        <div className="px-4 py-3 flex items-center">
          <button 
            className="flex items-center justify-center mr-4"
            onClick={toggleComments}
          >
            <img 
              src="/comentario.png" 
              alt="Comentar" 
              className="h-7 w-7"
            />
          </button>
          
          <div className="flex-1">
            <form onSubmit={handleAddComment} className="flex items-center">
              <Input
                type="text"
                placeholder="Enviar mensagem"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="bg-gray-800/60 border-0 text-white rounded-full placeholder:text-gray-400"
                onClick={() => setShowComments(true)}
              />
            </form>
          </div>
          
          <button 
            className="flex items-center justify-center ml-4"
            onClick={handleLikeStory}
          >
            <img 
              src={hasLiked ? "/amei1.png" : "/curtidas.png"} 
              alt={hasLiked ? "Amei" : "Curtir"} 
              className="h-7 w-7"
            />
          </button>
        </div>
      </div>

      {isOwner && (
        <div className="absolute bottom-20 right-4">
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={handleDeleteStory}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
