import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Plus } from "lucide-react";
import { transformDropboxUrl } from "../utils/mediaUtils";
import { useRef, TouchEvent } from "react";

interface FollowingProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  has_stories: boolean;
}

const StoriesBar = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: following, isLoading } = useQuery({
    queryKey: ["followingProfiles"],
    queryFn: async () => {
      if (!currentUser) return [];

      const { data: followData, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      if (error) {
        console.error("Error fetching follow data:", error);
        return [];
      }

      const followingIds = followData.map((follow) => follow.following_id);

      if (followingIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", followingIds);

      if (profileError) {
        console.error("Error fetching profiles:", profileError);
        return [];
      }

      // Fetch stories for each profile
      const profilesWithStories = await Promise.all(
        profiles.map(async (profile) => {
          const { data: stories, error: storyError } = await supabase
            .from("stories")
            .select("*")
            .eq("user_id", profile.id)
            .limit(1); // Check if there's at least one story

          if (storyError) {
            console.error(`Error fetching stories for user ${profile.id}:`, storyError);
            return { ...profile, has_stories: false };
          }

          return { ...profile, has_stories: stories && stories.length > 0 };
        })
      );

      return profilesWithStories;
    },
  });

  const followingWithStories = following?.filter((profile) => profile.has_stories) || [];

  const handleStoryClick = async (userId: string) => {
    const { data: stories, error } = await supabase
      .from("stories")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching stories:", error);
      return;
    }

    if (stories && stories.length > 0) {
      const transformedStories = stories.map(story => ({
        ...story,
        media_url: transformDropboxUrl(story.media_url)
      }));
      navigate(`/story/${userId}`, { state: { stories: transformedStories } });
    } else {
      console.log("No stories found for this user.");
    }
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchStartXRef.current || !scrollContainerRef.current) return;

    const touchCurrentX = e.touches[0].clientX;
    const diffX = touchStartXRef.current - touchCurrentX;
    
    // Apply the scroll directly based on touch movement
    scrollContainerRef.current.scrollLeft += diffX;
    
    // Update reference for next move event
    touchStartXRef.current = touchCurrentX;
  };

  const handleTouchEnd = () => {
    touchStartXRef.current = null;
  };

  return (
    <div className="bg-black w-full py-4 relative">
      <div 
        className="overflow-x-auto scrollbar-hide"
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex space-x-4 px-4 pb-1">
          {currentUser && (
            <div 
              className="flex flex-col items-center cursor-pointer min-w-16"
              onClick={() => handleStoryClick(currentUser.id)}
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 to-pink-500 flex items-center justify-center">
                  <Avatar className="w-14 h-14 border-2 border-black">
                    <AvatarImage src="/placeholder.svg" alt={currentUser.id} />
                    <AvatarFallback>
                      <Plus className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-white text-xs mt-1 truncate w-16 text-center">Seu story</span>
            </div>
          )}

          {followingWithStories?.map((profile) => (
            <div 
              key={profile.id}
              className="flex flex-col items-center cursor-pointer min-w-16"
              onClick={() => handleStoryClick(profile.id)}
            >
              <Avatar 
                className="w-16 h-16 border-2 border-[#E1306C] p-[2px]"
              >
                <AvatarImage 
                  src={profile.avatar_url || "/placeholder.svg"} 
                  alt={profile.username}
                  className="rounded-full"
                />
                <AvatarFallback>
                  {profile.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-white text-xs mt-1 truncate w-16 text-center">
                {profile.username}
              </span>
            </div>
          ))}

          {isLoading && (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center min-w-16">
                  <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse"></div>
                  <div className="w-12 h-2 mt-1 bg-gray-700 animate-pulse rounded"></div>
                </div>
              ))}
            </>
          )}

          {followingWithStories?.length === 0 && !isLoading && (
            <div className="flex items-center text-gray-500 text-sm">
              <p>Siga usuários com histórias para vê-las aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoriesBar;
