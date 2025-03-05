
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Plus } from "lucide-react";
import { transformDropboxUrl } from "../utils/mediaUtils";

interface FollowingProfile {
  id: string;
  username: string;
  avatar_url: string;
  has_active_stories: boolean;
  has_viewed_stories: boolean;
}

const StoriesBar = () => {
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      return { ...data, id: user.id };
    },
  });

  const { data: followingWithStories, isLoading } = useQuery({
    queryKey: ["followingWithStories", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data: following, error: followingError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      if (followingError) throw followingError;
      
      if (!following || following.length === 0) return [];
      
      const followingIds = following.map(f => f.following_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", followingIds);
        
      if (profilesError) throw profilesError;
      
      if (!profiles || profiles.length === 0) return [];
      
      const profilesWithStoryStatus = await Promise.all(profiles.map(async (profile) => {
        const { data: stories, error: storiesError } = await supabase
          .from("stories")
          .select("id")
          .eq("user_id", profile.id)
          .gt("expires_at", new Date().toISOString());
          
        if (storiesError) throw storiesError;
        
        if (!stories || stories.length === 0) {
          return {
            ...profile,
            has_active_stories: false,
            has_viewed_stories: false
          };
        }
        
        const storyIds = stories.map(s => s.id);
        
        const { data: views, error: viewsError } = await supabase
          .from("story_views")
          .select("story_id")
          .eq("viewer_id", currentUser.id)
          .in("story_id", storyIds);
          
        if (viewsError) throw viewsError;
        
        const hasViewedAll = views && views.length === stories.length;
        
        return {
          ...profile,
          has_active_stories: true,
          has_viewed_stories: hasViewedAll
        };
      }));
      
      return profilesWithStoryStatus
        .filter(profile => profile.has_active_stories)
        .sort((a, b) => {
          if (!a.has_viewed_stories && b.has_viewed_stories) return -1;
          if (a.has_viewed_stories && !b.has_viewed_stories) return 1;
          return 0;
        });
    },
    enabled: !!currentUser?.id,
  });

  const handleStoryClick = (userId: string) => {
    navigate(`/story/view/${userId}`);
  };

  const handleCreateStoryClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click event
    navigate("/story/creator");
  };

  return (
    <div className="bg-black w-full py-4">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-4 px-4" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {currentUser && (
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => navigate(`/story/view/${currentUser.id}`)}
            >
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-gray-600">
                  {currentUser.avatar_url ? (
                    <AvatarImage src={transformDropboxUrl(currentUser.avatar_url)} alt={currentUser.username || "You"} />
                  ) : (
                    <AvatarFallback>{currentUser.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <div 
                  className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 cursor-pointer"
                  onClick={handleCreateStoryClick}
                >
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-xs mt-1 text-center text-white">Seu story</p>
            </div>
          )}

          {followingWithStories?.map((profile) => (
            <div 
              key={profile.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleStoryClick(profile.id)}
            >
              <Avatar 
                className={`w-16 h-16 ${profile.has_viewed_stories 
                  ? 'border-2 border-gray-500'
                  : 'border-2 border-pink-500'
                }`}
              >
                {profile.avatar_url ? (
                  <AvatarImage src={transformDropboxUrl(profile.avatar_url)} alt={profile.username || ""} />
                ) : (
                  <AvatarFallback>{profile.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                )}
              </Avatar>
              <p className="text-xs mt-1 text-center text-white max-w-16 truncate">{profile.username}</p>
            </div>
          ))}

          {isLoading && (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse"></div>
                  <div className="w-12 h-2 mt-1 bg-gray-700 animate-pulse rounded"></div>
                </div>
              ))}
            </>
          )}
          
          {!isLoading && (!followingWithStories || followingWithStories.length === 0) && !currentUser && (
            <div className="flex items-center justify-center w-full py-2">
              <p className="text-xs text-gray-400">Entre para ver stories</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoriesBar;
