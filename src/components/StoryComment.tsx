
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { MoreHorizontal, Reply, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../integrations/supabase/client';
import { ptBR } from 'date-fns/locale';
import { Avatar } from './ui/avatar';
import Tags from './Tags';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface StoryCommentProps {
  comment: any;
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
  onCommentDeleted,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const { toast } = useToast();
  
  // Formatar texto de resposta para incluir @ do usuário
  const formatReplyText = () => {
    if (comment?.user?.username) {
      return `@${comment.user.username} `;
    }
    return '';
  };
  
  // Inicializar campo de resposta com @username
  const handleReplyClick = () => {
    setReplyText(formatReplyText());
    setShowReplyForm(true);
  };
  
  // Enviar resposta ao comentário
  const handleSubmitReply = async () => {
    if (!replyText.trim() || !currentUserId) return;
    
    setReplying(true);
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
      setShowReplyForm(false);
      onCommentDeleted(); // Recarregar comentários para mostrar a nova resposta
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar sua resposta"
      });
    } finally {
      setReplying(false);
    }
  };
  
  // Excluir comentário
  const handleDeleteComment = async () => {
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
  
  // Verificar se o usuário atual é o autor do comentário ou o dono da story
  const canDelete = currentUserId && (currentUserId === comment.user_id || currentUserId === storyOwnerId);
  const isStoryOwner = currentUserId === storyOwnerId;
  
  return (
    <div className={`p-4 border-b ${comment.parent_comment_id ? 'pl-8 bg-gray-50 dark:bg-gray-800/30' : ''}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          {comment.user?.avatar_url && (
            <img src={comment.user.avatar_url} alt={comment.user?.username || 'User'} />
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-sm">
                {comment.user?.username || 'Usuário'}
                {comment.user_id === storyOwnerId && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-1.5 py-0.5 rounded-full">
                    Autor
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
            
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDeleteComment} className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <div className="mt-1 text-sm">
            <Tags content={comment.text} />
          </div>
          
          {currentUserId && (
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs" 
                onClick={handleReplyClick}
              >
                <Reply className="mr-1 h-3 w-3" /> Responder
              </Button>
            </div>
          )}
          
          {showReplyForm && (
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
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSubmitReply}
                  disabled={replying || !replyText.trim()}
                >
                  {replying ? 'Enviando...' : 'Responder'}
                </Button>
              </div>
            </div>
          )}
          
          {/* Mostrar respostas ao comentário */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply: any) => (
                <div key={reply.id} className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      {reply.user?.avatar_url && (
                        <img src={reply.user.avatar_url} alt={reply.user?.username || 'User'} />
                      )}
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-xs">
                            {reply.user?.username || 'Usuário'}
                            {reply.user_id === storyOwnerId && (
                              <span className="ml-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-1.5 py-0.5 rounded-full">
                                Autor
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        
                        {(currentUserId === reply.user_id || currentUserId === storyOwnerId) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={async () => {
                                  await supabase
                                    .from('story_comments')
                                    .delete()
                                    .eq('id', reply.id);
                                  onCommentDeleted();
                                }} 
                                className="text-red-500"
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      <div className="mt-1 text-xs">
                        <Tags content={reply.text} />
                      </div>
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
