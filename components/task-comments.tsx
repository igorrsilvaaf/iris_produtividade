import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MoreVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { User } from '@/lib/auth';
import { useUser } from '@/hooks/use-user';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
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
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 mt-1">
          <AvatarImage src={user?.avatar_url || ''} alt={user?.name || 'Usuário'} />
          <AvatarFallback>
            {user?.name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Adicione um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              Comentar
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        ) : (
          comments.map((comment) => {
            const isOwner = user?.id.toString() === comment.user_id || user?.id === parseInt(comment.user_id);
            return (
            <div key={comment.id} className="flex gap-3 group">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={comment.author_avatar || ''} alt={comment.author_name} />
                <AvatarFallback>{comment.author_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.author_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                        {comment.updated_at !== comment.created_at && ' (editado)'}
                      </span>
                    </div>
                    {isOwner && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Excluir comentário"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditing(comment)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="min-h-[80px]"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
}
