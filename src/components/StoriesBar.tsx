
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Plus } from "lucide-react";

interface FollowingProfile {
  id: string;
  username: string;
  avatar_url: string;
  has_active_stories: boolean;
  has_viewed_stories: boolean; // New property to track if user has viewed the stories
}

const StoriesBar = () => {
  const navigate = useNavigate();

  // Busca o usuário atual
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

  // Busca perfis que o usuário está seguindo e que têm stories ativos
  const { data: followingWithStories, isLoading } = useQuery({
    queryKey: ["followingWithStories", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      // Busca quem o usuário atual segue
      const { data: following, error: followingError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      if (followingError) throw followingError;
      
      if (!following || following.length === 0) return [];
      
      const followingIds = following.map(f => f.following_id);
      
      // Busca perfis das pessoas que o usuário segue
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", followingIds);
        
      if (profilesError) throw profilesError;
      
      if (!profiles || profiles.length === 0) return [];
      
      // Para cada perfil, verifica se tem stories ativos e se o usuário já os viu
      const profilesWithStoryStatus = await Promise.all(profiles.map(async (profile) => {
        // Check for active stories
        const { data: stories, error: storiesError } = await supabase
          .from("stories")
          .select("id")
          .eq("user_id", profile.id)
          .gt("expires_at", new Date().toISOString());
          
        if (storiesError) throw storiesError;
        
        // If there are no active stories, don't include this profile
        if (!stories || stories.length === 0) {
          return {
            ...profile,
            has_active_stories: false,
            has_viewed_stories: false
          };
        }
        
        // Check if user has viewed all stories
        const storyIds = stories.map(s => s.id);
        
        const { data: views, error: viewsError } = await supabase
          .from("story_views")
          .select("story_id")
          .eq("viewer_id", currentUser.id)
          .in("story_id", storyIds);
          
        if (viewsError) throw viewsError;
        
        // User has viewed all stories if the number of views equals the number of stories
        const hasViewedAll = views && views.length === stories.length;
        
        return {
          ...profile,
          has_active_stories: true,
          has_viewed_stories: hasViewedAll
        };
      }));
      
      // Filter out profiles with no active stories and sort by viewed status
      // (unviewed stories first, then viewed stories)
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
    // Se for o usuário atual, vai para gerenciar stories
    if (userId === currentUser?.id) {
      navigate("/story/manage");
    } else {
      // Se for outro usuário, vai para visualizar os stories dele
      navigate(`/story/view/${userId}`);
    }
  };

  // Sempre mostrar a barra de stories, mesmo que não haja stories para exibir
  // Removemos a condição que fazia a barra desaparecer
  return (
    <div className="bg-black w-full py-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 px-4">
          {/* Círculo do usuário atual com botão de adicionar - sempre mostrado */}
          {currentUser && (
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleStoryClick(currentUser.id)}
            >
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-gray-600">
                  {currentUser.avatar_url ? (
                    <AvatarImage src={currentUser.avatar_url} alt={currentUser.username || "You"} />
                  ) : (
                    <AvatarFallback>{currentUser.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-xs mt-1 text-center text-white">Seu story</p>
            </div>
          )}

          {/* Círculos de outros usuários com stories */}
          {followingWithStories?.map((profile) => (
            <div 
              key={profile.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleStoryClick(profile.id)}
            >
              <Avatar 
                className={`w-16 h-16 ${profile.has_viewed_stories 
                  ? 'border-2 border-red-500' // Red border for viewed stories
                  : 'border-2 border-green-500' // Green border for unviewed stories
                }`}
              >
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.username || ""} />
                ) : (
                  <AvatarFallback>{profile.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                )}
              </Avatar>
              <p className="text-xs mt-1 text-center text-white max-w-16 truncate">{profile.username}</p>
            </div>
          ))}

          {/* Exibe placeholders apenas durante o carregamento */}
          {isLoading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse"></div>
                  <div className="w-12 h-2 mt-1 bg-gray-700 animate-pulse rounded"></div>
                </div>
              ))}
            </>
          )}
          
          {/* Quando não há stories e não está carregando, mostra uma mensagem ou um visual alternativo */}
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
