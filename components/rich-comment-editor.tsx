import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { RichTextEditor } from './rich-text-editor';

interface RichCommentEditorProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function RichCommentEditor({
  user,
  value,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  placeholder = "Escreva um comentário...",
  expanded = false,
  onToggleExpand
}: RichCommentEditorProps) {
  if (!user) {
    return (
      <div className="p-4 text-muted-foreground text-center">
        <p>É necessário estar logado para comentar.</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={user?.avatar_url || ''} alt={user?.name || 'Usuário'} />
        <AvatarFallback className="text-xs">
          {user?.name?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        {!expanded ? (
          <Button
            variant="ghost"
            className="w-full justify-start h-9 text-muted-foreground hover:bg-muted/50 border border-input"
            onClick={onToggleExpand}
          >
            {placeholder}
          </Button>
        ) : (
          <RichTextEditor
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onSubmit={onSubmit}
            onCancel={onCancel}
            submitLabel={isSubmitting ? 'Enviando...' : 'Comentar'}
            disabled={isSubmitting}
            className="comment-input-expanded"
          />
        )}
      </div>
    </div>
  );
} 