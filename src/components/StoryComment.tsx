
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash, MessageCircle } from 'lucide-react';
import Tags from './Tags';

interface StoryCommentProps {
  comment: {
    id: string;
    text: string;
    created_at: string;
    user: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
    replies?: Array<{
      id: string;
      text: string;
      created_at: string;
      user: {
        id: string;
        username: string;
        avatar_url: string | null;
      };
    }>;
  };
  storyId: string;
  storyOwnerId: string;
  currentUserId: string | null;
  onCommentDeleted: () => void;
}

const StoryComment: React.FC<StoryCommentProps> = ({
  comment,
  storyId,
  storyOwnerId,
  currentUserId,
  onCommentDeleted,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const isOwner = currentUserId === comment.user.id;
  const isStoryOwner = currentUserId === storyOwnerId;
  const canDelete = isOwner || isStoryOwner;
  const canReply = isStoryOwner;

  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      const { error } = await supabase
        .from('story_comments')
        .delete()
        .eq('id', comment.id);

      if (error) throw error;

      toast({
        title: "Comentário excluído",
        description: "O comentário foi excluído com sucesso"
      });

      onCommentDeleted();
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o comentário"
      });
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    // Adicionar @ ao nome do usuário para o destaque
    const replyWithMention = `@${comment.user.username} ${replyText}`;
    
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('story_comments')
        .insert({
          story_id: storyId,
          user_id: currentUserId,
          text: replyWithMention,
          parent_comment_id: comment.id
        });
      
      if (error) throw error;
      
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso"
      });
      
      setReplyText('');
      setIsReplying(false);
      onCommentDeleted(); // Recarregar comentários
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar sua resposta"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm");
  };

  return (
    <div className="p-4 border-b last:border-b-0">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          {comment.user.avatar_url ? (
            <AvatarImage src={comment.user.avatar_url} alt={comment.user.username} />
          ) : (
            <AvatarFallback>
              {comment.user.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{comment.user.username}</span>
              <span className="text-xs text-gray-500">
                • {formatDate(comment.created_at)}
              </span>
            </div>
            
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
          
          <p className="text-sm mt-1">
            <Tags content={comment.text} />
          </p>
          
          {isReplying && (
            <div className="mt-3">
              <Textarea
                placeholder="Escreva sua resposta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReplying(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={submitting || !replyText.trim()}
                >
                  {submitting ? "Enviando..." : "Responder"}
                </Button>
              </div>
            </div>
          )}
          
          {canReply && !isReplying && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-6 p-0 text-blue-500"
              onClick={() => setIsReplying(true)}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              <span className="text-xs">Responder</span>
            </Button>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 pl-6 border-l-2 border-gray-200">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="pt-2">
                  <div className="flex gap-2">
                    <Avatar className="h-6 w-6">
                      {reply.user.avatar_url ? (
                        <AvatarImage src={reply.user.avatar_url} alt={reply.user.username} />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {reply.user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-xs">{reply.user.username}</span>
                        <span className="text-xs text-gray-500">
                          • {formatDate(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-xs mt-1">
                        <Tags content={reply.text} />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryComment;
