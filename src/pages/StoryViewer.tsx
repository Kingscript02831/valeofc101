import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Heart, MessageCircle, X } from "lucide-react";

interface Story {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  user_id: string;
}

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
}

const StoryViewer = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (userId) {
      fetchUserStories(userId);
    }
  }, [userId]);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url");

      if (error) {
        console.error("Error fetching all users:", error);
      }

      if (data) {
        setAllUsers(data);
      }
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };

  const fetchUserStories = async (uid: string) => {
    setIsLoadingStories(true);
    try {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", uid)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching stories:", error);
        toast.error("Failed to load stories.");
        return;
      }

      if (data) {
        setUserStories(data);
        setCurrentStoryIndex(0);
      } else {
        setUserStories([]);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load stories.");
    } finally {
      setIsLoadingStories(false);
    }
  };

  useEffect(() => {
    if (userStories.length > 0 && !paused) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prevProgress + 1;
        });
      }, 50);

      return () => clearInterval(timer);
    }
  }, [userStories, currentStoryIndex, paused]);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        if (currentStoryIndex < userStories.length - 1) {
          setCurrentStoryIndex((prevIndex) => prevIndex + 1);
          setProgress(0);
          setPaused(false);
        } else {
          console.log("End of stories");
        }
      }, 500);
    }
  }, [progress, currentStoryIndex, userStories.length]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('ended', () => {
        if (currentStoryIndex < userStories.length - 1) {
          setCurrentStoryIndex((prevIndex) => prevIndex + 1);
          setProgress(0);
          setPaused(false);
        } else {
          console.log("End of stories");
        }
      });
    }
  }, [currentStoryIndex, userStories]);

  const handlePause = () => {
    setPaused(!paused);
    if (videoRef.current) {
      paused ? videoRef.current.play() : videoRef.current.pause();
    }
  };

  const handleLike = () => {
    console.log("Liked story");
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  const handlePostComment = async () => {
    if (commentText.trim() === '') return;

    // Simulate posting a comment
    const newComment = {
      id: String(comments.length + 1),
      text: commentText,
      user: {
        username: 'CurrentUser',
        avatar_url: '/path/to/current/user/avatar.jpg',
      },
      created_at: new Date().toISOString(),
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  const moveToNextUserStories = () => {
    if (allUsers && allUsers.length > 0) {
      const currentUserIndex = allUsers.findIndex(user => user.id === userId);
      
      if (currentUserIndex >= 0 && currentUserIndex < allUsers.length - 1) {
        // Move to the next user's stories
        const nextUser = allUsers[currentUserIndex + 1];
        setUserId(nextUser.id);
        setCurrentStoryIndex(0);
        setProgress(0);
        setPaused(false);
        
        // Update the URL without a full page reload
        navigate(`/story/view/${nextUser.id}`, { replace: true });
        
        // Reset and load the new user's stories
        setUserStories([]);
        setIsLoadingStories(true);
        fetchUserStories(nextUser.id);
      } else {
        // No more users with stories, navigate back
        navigate(-1);
      }
    }
  };

  useEffect(() => {
    if (userStories.length > 0 && currentStoryIndex >= userStories.length) {
      console.log("End of user stories, moving to next user");
      moveToNextUserStories();
    }
  }, [currentStoryIndex, userStories]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {isLoadingStories ? (
        <div className="flex justify-center items-center h-full">
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>
      ) : userStories.length > 0 ? (
        <>
          <div className="relative h-full">
            {userStories[currentStoryIndex].media_type === 'image' ? (
              <img
                src={userStories[currentStoryIndex].media_url}
                alt="Story"
                className="object-contain w-full h-full"
                onClick={handlePause}
              />
            ) : (
              <video
                ref={videoRef}
                src={userStories[currentStoryIndex].media_url}
                className="object-contain w-full h-full"
                loop
                onClick={handlePause}
                muted
                autoPlay
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-full text-white">
          No stories available.
        </div>
      )}
      
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-4 rounded-t-xl z-20 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Comentários</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCloseComments}
              className="text-white hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {comments.map((comment) => (
            <div key={comment.id} className="mb-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.user.avatar_url} alt={comment.user.username} />
                  <AvatarFallback>{comment.user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-medium">{comment.user.username}</div>
                  <div className="text-gray-400">{comment.text}</div>
                  <div className="text-xs text-gray-500">{comment.created_at}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Adicione um comentário..."
              className="bg-gray-800 text-white rounded-md border-none focus-visible:ring-none focus-visible:ring-offset-0"
            />
            <Button onClick={handlePostComment} className="mt-2 w-full">
              Enviar Comentário
            </Button>
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2 right-2 flex items-center">
        <div className="w-full bg-gray-500/50 rounded-full h-2">
          <div
            className="bg-white h-full rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <Button variant="ghost" size="icon" className="text-white">
          {paused ? '▶' : '⏸'}
        </Button>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="text-sm text-white">@shadcn</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white" onClick={handleLike}>
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white" onClick={handleComment}>
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
