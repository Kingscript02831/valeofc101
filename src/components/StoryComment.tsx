
import React, { useState } from 'react';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { Trash, MessageCircle } from 'lucide-react';

interface StoryCommentProps {
  comment: {
    id: string;
    text: string;
    created_at: string;
    user: {
      id: string;
      username: string;
      avatar_url: string;
    };
    parent_comment_id?: string | null;
    replies?: any[];
  };
  storyOwnerId: string;
  storyId: string;
  currentUserId: string | null;
  onCommentDeleted: () => void;
}

const StoryComment: React.FC<StoryCommentProps> = ({
  comment,
  storyOwnerId,
  storyId,
  currentUserId,
  onCommentDeleted
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);
  const { toast } = useToast();
  
  const isStoryOwner = currentUserId === storyOwnerId;
  const isCommentOwner = currentUserId === comment.user.id;
  
  const handleDelete = async () => {
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
    
    try {
      const { error } = await supabase
        .from('story_comments')
        .insert({
          story_id: storyId,
          user_id: currentUserId,
          text: replyText,
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
      console.error('Erro ao responder comentário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar sua resposta"
      });
    }
  };
  
  const formattedDate = new Date(comment.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className={`p-3 border-b ${comment.parent_comment_id ? 'ml-8 bg-gray-50 dark:bg-gray-800' : ''}`}>
      <div className="flex items-start gap-2">
        <Avatar className="h-8 w-8">
          <img 
            src={comment.user.avatar_url || "https://via.placeholder.com/40"} 
            alt={comment.user.username || "Usuário"} 
          />
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{comment.user.username || "Usuário"}</span>
              <span className="text-xs text-gray-500 ml-2">{formattedDate}</span>
            </div>
            
            <div className="flex gap-2">
              {(isStoryOwner || isCommentOwner) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleDelete}
                  title="Excluir comentário"
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              )}
              
              {isStoryOwner && !comment.parent_comment_id && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsReplying(!isReplying)}
                  title="Responder"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-sm mt-1">{comment.text}</p>
          
          {isReplying && (
            <div className="mt-3">
              <Textarea
                placeholder="Escreva sua resposta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px]"
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
                >
                  Responder
                </Button>
              </div>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? 'Ocultar respostas' : `Mostrar ${comment.replies.length} respostas`}
              </Button>
              
              {showReplies && (
                <div className="mt-2">
                  {comment.replies.map((reply) => (
                    <StoryComment
                      key={reply.id}
                      comment={reply}
                      storyOwnerId={storyOwnerId}
                      storyId={storyId}
                      currentUserId={currentUserId}
                      onCommentDeleted={onCommentDeleted}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryComment;
