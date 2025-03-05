
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import StoryComment from './StoryComment';
import { Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

interface StoryCommentsProps {
  storyId: string;
  storyOwnerId: string;
  commentsEnabled: boolean;
}

const StoryComments: React.FC<StoryCommentsProps> = ({ 
  storyId,
  storyOwnerId,
  commentsEnabled 
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Obter usuário atual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setCurrentUser(profileData);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Carregar comentários
  const fetchComments = async () => {
    setLoading(true);
    try {
      // Primeiro, busque todos os comentários principais (sem parent_comment_id)
      const { data: parentComments, error: parentError } = await supabase
        .from('story_comments')
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('story_id', storyId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });
        
      if (parentError) throw parentError;
      
      // Depois, busque todas as respostas
      const { data: replies, error: repliesError } = await supabase
        .from('story_comments')
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('story_id', storyId)
        .not('parent_comment_id', 'is', null)
        .order('created_at', { ascending: true });
        
      if (repliesError) throw repliesError;
      
      // Organize as respostas dentro dos comentários pai
      const commentsWithReplies = parentComments.map((comment) => {
        const commentReplies = replies.filter(
          (reply) => reply.parent_comment_id === comment.id
        );
        return { ...comment, replies: commentReplies };
      });
      
      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os comentários"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (storyId) {
      fetchComments();
    }
  }, [storyId]);

  // Enviar novo comentário
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('story_comments')
        .insert({
          story_id: storyId,
          user_id: currentUser.id,
          text: commentText
        });
        
      if (error) throw error;
      
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi enviado com sucesso"
      });
      
      setCommentText('');
      fetchComments();
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar seu comentário"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!commentsEnabled) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-center my-4">
        Os comentários estão desativados para esta história.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Comentários</h3>
      
      {currentUser && (
        <div className="mb-4">
          <Textarea
            placeholder="Deixe seu comentário..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleSubmitComment}
              disabled={submitting || !commentText.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : "Comentar"}
            </Button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center my-8 text-gray-500">
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </div>
      ) : (
        <div className="border rounded-md">
          {comments.map((comment) => (
            <StoryComment
              key={comment.id}
              comment={comment}
              storyOwnerId={storyOwnerId}
              storyId={storyId}
              currentUserId={currentUser?.id || null}
              onCommentDeleted={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryComments;
