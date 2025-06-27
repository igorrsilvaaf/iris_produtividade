import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Pencil, Trash2, Heart, MessageSquare, Reply } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Badge } from './ui/badge';
import type { User } from '@/lib/auth';
import { useUser } from '@/hooks/use-user';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RichTextEditor } from './rich-text-editor';
import { RichCommentEditor } from './rich-comment-editor';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  likes_count?: number;
  is_liked?: boolean;
}

interface TaskCommentsProps {
  taskId: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
}

export function TaskComments({ taskId, user: userProp }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [likeLoadingId, setLikeLoadingId] = useState<number | null>(null);
  const { user, loading: userLoading, error: userError, refetch: refetchUser } = useUser(userProp);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        credentials: 'same-origin',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else if (response.status === 401) {
        console.error('Sessão expirada ao buscar comentários');
        refetchUser();
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          content: newComment,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData, ...comments]);
        setNewComment('');
        setShowCommentBox(false);
      } else if (response.status === 401) {
        console.error('Sessão expirada ao adicionar comentário');
        refetchUser();
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editingContent.trim()) return;

    try {
      const response = await fetch(
        `/api/tasks/${taskId}/comments/${commentId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            content: editingContent,
          }),
        }
      );

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(
          comments.map((comment) =>
            comment.id === commentId ? updatedComment : comment
          )
        );
        setEditingCommentId(null);
        setEditingContent('');
      } else if (response.status === 401) {
        console.error('Sessão expirada ao atualizar comentário');
        refetchUser();
      }
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      const response = await fetch(
        `/api/tasks/${taskId}/comments/${commentId}`,
        {
          method: 'DELETE',
          credentials: 'same-origin',
        }
      );

      if (response.status === 204) {
        setComments(comments.filter((comment) => comment.id !== commentId));
      } else if (response.status === 401) {
        console.error('Sessão expirada ao excluir comentário');
        refetchUser();
      }
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleLikeComment = async (commentId: number) => {
    if (!user || likeLoadingId === commentId) return;
    
    setLikeLoadingId(commentId);
    
    // Adicionar animação de bounce
    const heartButton = document.querySelector(`[data-comment-id="${commentId}"] .heart-icon`);
    if (heartButton) {
      heartButton.classList.add('comment-like-bounce');
      setTimeout(() => heartButton.classList.remove('comment-like-bounce'), 300);
    }
    
    try {
      // Simular like/unlike - implementar API depois se necessário
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          const isLiked = comment.is_liked;
          return {
            ...comment,
            is_liked: !isLiked,
            likes_count: (comment.likes_count || 0) + (isLiked ? -1 : 1)
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    } finally {
      setLikeLoadingId(null);
    }
  };

  const formatCommentDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  }, []);

  const renderMarkdown = useCallback((content: string) => {
    return (
      <div className="prose-comment">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
            u: ({ children }) => <u className="underline">{children}</u>,
            code: ({ children }) => (
              <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">{children}</pre>
            ),
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-sm">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-sm">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-2">{children}</blockquote>
            ),
            a: ({ children, href }) => (
              <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">{children}</a>
            ),
            img: ({ src, alt }) => (
              <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-2" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }, []);

  if (isLoading || userLoading) {
    return <div className="p-4 text-muted-foreground">Carregando comentários...</div>;
  }

  if (userError) {
    return (
      <div className="p-4 text-muted-foreground">
        <p>Erro ao carregar dados do usuário: {userError}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={refetchUser}
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-muted-foreground">
        <p>É necessário estar logado para ver e adicionar comentários.</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Recarregar Página
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Área de adicionar comentário com RichTextEditor */}
        <RichCommentEditor
          user={user}
          value={newComment}
          onChange={setNewComment}
          onSubmit={handleAddComment}
          onCancel={() => {
            setShowCommentBox(false);
            setNewComment('');
          }}
          isSubmitting={isSubmitting}
          expanded={showCommentBox}
          onToggleExpand={() => setShowCommentBox(true)}
        />

        {/* Lista de comentários */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isOwner = user?.id.toString() === comment.user_id || user?.id === parseInt(comment.user_id);
              const isEditing = editingCommentId === comment.id;
              
              return (
                <div key={comment.id} className="group comment-hover">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.author_avatar || ''} alt={comment.author_name} />
                      <AvatarFallback className="text-xs">{comment.author_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted/30 rounded-2xl px-4 py-3 border">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">
                              {comment.author_name}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground cursor-help">
                                  {formatCommentDate(comment.created_at)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{format(new Date(comment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                              </TooltipContent>
                            </Tooltip>
                            {comment.updated_at !== comment.created_at && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-auto">
                                editado
                              </Badge>
                            )}
                          </div>
                          
                          {isOwner && !isEditing && (
                            <div className="flex items-center gap-1 comment-actions">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                    onClick={() => startEditing(comment)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar comentário</TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteComment(comment.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Excluir comentário</TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="mt-2">
                            <RichTextEditor
                              value={editingContent}
                              onChange={setEditingContent}
                              placeholder="Editar comentário..."
                              onSubmit={() => handleUpdateComment(comment.id)}
                              onCancel={cancelEditing}
                              submitLabel="Salvar"
                              cancelLabel="Cancelar"
                              minHeight="100px"
                            />
                          </div>
                        ) : (
                          <div className="prose-comment">
                            {renderMarkdown(comment.content)}
                          </div>
                        )}
                      </div>
                      
                      {/* Ações do comentário */}
                      {!isEditing && (
                        <div className="flex items-center gap-4 mt-1 ml-2" data-comment-id={comment.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 text-xs gap-1 hover:bg-transparent ${
                                  comment.is_liked 
                                    ? 'text-red-500 hover:text-red-600' 
                                    : 'text-muted-foreground hover:text-red-500'
                                }`}
                                onClick={() => handleLikeComment(comment.id)}
                                disabled={likeLoadingId === comment.id}
                              >
                                <Heart className={`h-3 w-3 heart-icon ${comment.is_liked ? 'fill-current' : ''}`} />
                                {comment.likes_count || 0}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{comment.is_liked ? 'Descurtir' : 'Curtir'}</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                onClick={() => {
                                  // Implementar resposta depois se necessário
                                  console.log('Responder comentário:', comment.id);
                                }}
                              >
                                <Reply className="h-3 w-3" />
                                Responder
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Responder comentário</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}