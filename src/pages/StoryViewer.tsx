import { useState, useEffect, useRef, TouchEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Send, 
  Trash, 
  X
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "../components/ui/dialog";

interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  profiles?: {
    id: string;
    username: string;
    avatar_url: string;
    full_name: string;
  };
}

export default function StoryViewer() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchHolding = useRef(false);

  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };

    fetchSession();
  }, []);

  const { data: usersWithStories } = useQuery({
    queryKey: ["usersWithStories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("user_id")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users with stories:", error);
        return [];
      }

      const userIds = [...new Set(data.map((story) => story.user_id))];
      return userIds;
    },
  });

  const { data: stories, isLoading } = useQuery({
    queryKey: ["userStories", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("stories")
        .select(`
          id,
          created_at,
          media_url,
          media_type,
          user_id,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching stories:", error);
        return [];
      }

      return data;
    },
    enabled: !!userId,
  });

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!currentUser || !stories || stories.length === 0) return;

      const currentStory = stories[currentStoryIndex];

      const { data, error } = await supabase
        .from("story_likes")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("story_id", currentStory.id);

      if (error) {
        console.error("Error checking like status:", error);
        return;
      }

      setIsLiked(data && data.length > 0);
    };

    checkLikeStatus();
  }, [currentUser, stories, currentStoryIndex]);

  const handleLikeStory = async () => {
    if (!currentUser || !stories || stories.length === 0) return;

    const currentStory = stories[currentStoryIndex];

    if (isLiked) {
      // Unlike the story
      const { error } = await supabase
        .from("story_likes")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("story_id", currentStory.id);

      if (error) {
        console.error("Error unliking story:", error);
        toast.error("Erro ao descurtir a história");
        return;
      }

      setIsLiked(false);
      toast.success("História descurtida!");
    } else {
      // Like the story
      const { error } = await supabase
        .from("story_likes")
        .insert([{ user_id: currentUser.id, story_id: currentStory.id }]);

      if (error) {
        console.error("Error liking story:", error);
        toast.error("Erro ao curtir a história");
        return;
      }

      setIsLiked(true);
      toast.success("História curtida!");
    }
  };

  const { data: storyComments, refetch: refetchComments } = useQuery({
    queryKey: ["storyComments", stories?.[currentStoryIndex]?.id],
    queryFn: async () => {
      if (!stories?.[currentStoryIndex]?.id) return [];

      const { data, error } = await supabase
        .from("story_comments")
        .select(`
          id,
          story_id,
          user_id,
          comment,
          created_at,
          profiles (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq("story_id", stories[currentStoryIndex].id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        return [];
      }

      return data as StoryComment[];
    },
    enabled: !!stories?.[currentStoryIndex]?.id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!currentUser || !stories || stories.length === 0) {
        throw new Error("Não autenticado ou nenhuma história disponível");
      }

      const currentStory = stories[currentStoryIndex];

      const { data, error } = await supabase
        .from("story_comments")
        .insert([{ story_id: currentStory.id, user_id: currentUser.id, comment }]);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      setNewComment("");
      refetchComments();
      toast.success("Comentário adicionado!");
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast.error("Erro ao adicionar comentário");
    },
  });

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase.from("stories").delete().eq("id", storyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories", userId] });
      navigate(`/perfil/${currentUser?.id}`);
      toast.success("Story deleted!");
    },
    onError: (error) => {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story");
    },
  });

  const handleDeleteStory = () => {
    if (!stories || stories.length === 0) return;
    const currentStory = stories[currentStoryIndex];
    deleteStoryMutation.mutate(currentStory.id);
  };

  useEffect(() => {
    if (isPaused) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    } else {
      if (videoRef.current) {
        videoRef.current.play();
      }
      startProgressTimer();
    }
  }, [isPaused]);

  const startProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
          goToNextStory();
          return 0;
        }
        return prevProgress + 1;
      });
    }, 30);
  };

  useEffect(() => {
    if (stories && stories.length > 0) {
      setProgress(0);
      setIsPaused(false);
      startProgressTimer();
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [stories, currentStoryIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [currentStoryIndex, stories]);

  const goToNextStory = () => {
    if (!stories) return;

    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
      setIsPaused(false);
    } else {
      // If it's the last story of the current user, navigate to the next user
      if (!usersWithStories) return;

      const currentUserIndex = usersWithStories.indexOf(userId as string);
      if (currentUserIndex < usersWithStories.length - 1) {
        const nextUserId = usersWithStories[currentUserIndex + 1];
        navigate(`/story/${nextUserId}`);
      } else {
        navigate(-1);
      }
    }
  };

  const goToPrevStory = () => {
    if (!usersWithStories) return;

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
      setIsPaused(false);
    } else {
      const currentUserIndex = usersWithStories.indexOf(userId as string);

      if (currentUserIndex > 0) {
        const prevUserId = usersWithStories[currentUserIndex - 1];
        navigate(`/story/${prevUserId}`);
      } else {
        navigate(-1);
      }
    }
  };

  // Add touch hold functionality to pause/resume video
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    
    // Set a timeout to detect if the user is holding their finger
    touchTimeoutRef.current = setTimeout(() => {
      // Check if it's a center area touch (not edge navigation)
      const screenWidth = window.innerWidth;
      const touchX = e.touches[0].clientX;
      const centerThreshold = screenWidth * 0.3; // 30% from each edge
      
      if (touchX > centerThreshold && touchX < (screenWidth - centerThreshold)) {
        isTouchHolding.current = true;
        setIsPaused(true);
        if (videoRef.current) {
          videoRef.current.pause();
        }
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      }
    }, 200); // 200ms hold to pause
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    
    // If there was significant movement, cancel the hold detection
    if (touchStartX.current && touchEndX.current && touchStartY.current && touchEndY.current) {
      const moveDistance = Math.sqrt(
        Math.pow(touchEndX.current - touchStartX.current, 2) + 
        Math.pow(touchEndY.current - touchStartY.current, 2)
      );
      
      if (moveDistance > 15) { // 15px threshold for movement
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
          touchTimeoutRef.current = null;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    // Clear the hold detection timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // If we were holding to pause, resume playback
    if (isTouchHolding.current) {
      isTouchHolding.current = false;
      setIsPaused(false);
      
      if (videoRef.current) {
        videoRef.current.play();
      }
      
      startProgressTimer();
    } 
    // Otherwise, handle swipe navigation if applicable
    else if (touchStartX.current && touchEndX.current && touchStartY.current && touchEndY.current) {
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
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  if (isLoading || !stories) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <p className="text-white mb-4">Nenhuma história encontrada</p>
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
              className={`h-full bg-white ${index < currentStoryIndex ? 'w-full' : index === currentStoryIndex ? '' : 'w-0'}`}
              style={index === currentStoryIndex ? { width: `${progress}%` } : {}}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={currentStory.profiles?.avatar_url || ''} />
            <AvatarFallback>{currentStory.profiles?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-medium">{currentStory.profiles?.username}</p>
            <p className="text-gray-300 text-xs">
              {new Date(currentStory.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-white" onClick={() => navigate(-1)}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {currentStory.media_type === 'video' ? (
        <video
          ref={videoRef}
          src={currentStory.media_url}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          muted
          onEnded={goToNextStory}
        />
      ) : (
        <img
          src={currentStory.media_url}
          className="w-full h-full object-contain"
          alt="Story"
        />
      )}

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-6">
            <div className="w-8 h-16 border-4 border-white rounded-md"></div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Enviar mensagem..."
          className="bg-gray-800/50 border-gray-700 text-white"
          ref={commentInputRef}
          onFocus={() => setIsPaused(true)}
          onBlur={() => !showComments && setIsPaused(false)}
        />
        <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute bottom-20 right-4 flex flex-col gap-2">
        <Button
          variant="ghost"
          className="rounded-full bg-gray-800/50 p-3"
          onClick={handleLikeStory}
        >
          <Heart
            className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </Button>
        
        <Button
          variant="ghost"
          className="rounded-full bg-gray-800/50 p-3"
          onClick={() => {
            setShowComments(true);
            setIsPaused(true);
            setTimeout(() => {
              commentInputRef.current?.focus();
            }, 100);
          }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>

        {currentStory.user_id === currentUser?.id && (
          <Button
            variant="ghost"
            className="rounded-full bg-gray-800/50 p-3"
            onClick={handleDeleteStory}
          >
            <Trash className="h-6 w-6 text-white" />
          </Button>
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white" 
          onClick={goToPrevStory}
          disabled={currentStoryIndex === 0 && (!usersWithStories?.indexOf(userId as string) || usersWithStories?.indexOf(userId as string) === 0)}
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

      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <div className="max-h-96 overflow-y-auto">
            {storyComments?.length ? (
              storyComments.map((comment) => (
                <div key={comment.id} className="py-2 flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url || ''} />
                    <AvatarFallback>{comment.profiles?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{comment.profiles?.username}</p>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-400">Nenhum comentário ainda</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
