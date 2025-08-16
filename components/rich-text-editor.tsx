import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link2, 
  Paperclip, 
  MoreHorizontal,
  Eye,
  EyeOff,
  Type,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
  dataTestid?: string;
  showActions?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escrever um comentário...",
  onSubmit,
  onCancel,
  submitLabel = "Comentar",
  cancelLabel = "Cancelar",
  disabled = false,
  className = "",
  minHeight = "120px",
  dataTestid: testId,
  showActions = true
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize da textarea com controle de altura máxima
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.max(textarea.scrollHeight, parseInt(minHeight));
      const maxHeight = parseInt(minHeight) * 2.5; // Altura máxima é 2.5x a altura mínima
      
      if (newHeight > maxHeight) {
        textarea.style.height = maxHeight + 'px';
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = newHeight + 'px';
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [value, minHeight]);

  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    
    onChange(newText);
    
    // Restaurar foco e seleção
    setTimeout(() => {
      textarea.focus();
      const newStart = start + before.length;
      const newEnd = newStart + textToInsert.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  }, [value, onChange]);

  const formatBold = () => insertText('**', '**', 'texto em negrito');
  const formatItalic = () => insertText('*', '*', 'texto em itálico');
  const formatUnderline = () => insertText('<u>', '</u>', 'texto sublinhado');
  const formatCode = () => insertText('`', '`', 'código');
  const formatQuote = () => insertText('\n> ', '', 'citação');

  const insertList = () => {
    const lines = value.split('\n');
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const prefix = lineStart === 0 ? '- ' : '\n- ';
    insertText(prefix, '', 'item da lista');
  };

  const insertOrderedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const prefix = lineStart === 0 ? '1. ' : '\n1. ';
    insertText(prefix, '', 'primeiro item');
  };

  const handleLinkInsert = () => {
    if (!linkText.trim() || !linkUrl.trim()) return;
    
    const linkMarkdown = `[${linkText}](${linkUrl})`;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = value.substring(0, start) + linkMarkdown + value.substring(end);
    onChange(newText);
    
    setShowLinkDialog(false);
    setLinkText('');
    setLinkUrl('');
    
    setTimeout(() => textarea.focus(), 0);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Aqui você implementaria o upload do arquivo
    // Por enquanto, vou simular inserindo uma referência
    const fileName = file.name;
    const fileText = file.type.startsWith('image/') 
      ? `![${fileName}](url-do-arquivo-aqui)` 
      : `[📎 ${fileName}](url-do-arquivo-aqui)`;
    
    insertText('\n' + fileText + '\n', '');
    
    // Reset do input
    event.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Atalhos de formatação
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatBold();
          break;
        case 'i':
          e.preventDefault();
          formatItalic();
          break;
        case 'u':
          e.preventDefault();
          formatUnderline();
          break;
        case 'k':
          e.preventDefault();
          setShowLinkDialog(true);
          break;
      }
    }

    // Só processar Ctrl+Enter e Escape se showActions for true
    if (showActions) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSubmit?.();
      }

      if (e.key === 'Escape') {
        onCancel?.();
      }
    }
  };

  const renderMarkdown = (content: string) => {
    return (
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
            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto my-2">{children}</pre>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-sm my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-sm my-2">{children}</ol>,
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
    );
  };

  return (
    <div className={`border border-input rounded-lg bg-background ${className}`} data-testid={testId}>
      <Tabs defaultValue="edit" value={showPreview ? "preview" : "edit"} className="w-full">
        {/* Barra de Ferramentas */}
        <div className="flex items-center justify-between border-b border-border p-2 bg-muted/30">
          <div className="flex items-center gap-1">
            {/* Formatação de Texto */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={formatBold}
                title="Negrito (Ctrl+B)"
                disabled={disabled}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={formatItalic}
                title="Itálico (Ctrl+I)"
                disabled={disabled}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={formatUnderline}
                title="Sublinhado (Ctrl+U)"
                disabled={disabled}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>

            {/* Listas */}
            <div className="flex items-center gap-1 mr-2 border-l border-border pl-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={insertList}
                title="Lista com marcadores"
                disabled={disabled}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={insertOrderedList}
                title="Lista numerada"
                disabled={disabled}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>

            {/* Links e Anexos */}
            <div className="flex items-center gap-1 mr-2 border-l border-border pl-2">
              <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    title="Inserir link (Ctrl+K)"
                    disabled={disabled}
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Inserir Link</DialogTitle>
                    <DialogDescription>
                      Adicione um link ao seu comentário.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="link-text">Texto do link</Label>
                      <Input
                        id="link-text"
                        placeholder="Texto que será exibido"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="link-url">URL</Label>
                      <Input
                        id="link-url"
                        placeholder="https://exemplo.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleLinkInsert} disabled={!linkText.trim() || !linkUrl.trim()}>
                      Inserir Link
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.txt"
                aria-label="Anexar arquivo"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => fileInputRef.current?.click()}
                title="Anexar arquivo"
                disabled={disabled}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            {/* Mais Opções */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 border-l border-border ml-2 pl-2"
                  title="Mais opções"
                  disabled={disabled}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={formatCode}>
                  <Code className="h-4 w-4 mr-2" />
                  Código inline
                </DropdownMenuItem>
                <DropdownMenuItem onClick={formatQuote}>
                  <Quote className="h-4 w-4 mr-2" />
                  Citação
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => insertText('\n---\n', '')}>
                  <Type className="h-4 w-4 mr-2" />
                  Linha divisória
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Toggle Preview */}
          <div className="flex items-center gap-2">
            <TabsList className="grid w-full grid-cols-2 h-7">
              <TabsTrigger 
                value="edit" 
                className="text-xs px-3 py-1"
                onClick={() => setShowPreview(false)}
              >
                Editar
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="text-xs px-3 py-1"
                onClick={() => setShowPreview(true)}
              >
                Preview
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Conteúdo do Editor */}
        <TabsContent value="edit" className="m-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[120px] resize-none border-0 focus-visible:ring-0 rounded-none rounded-b-lg text-sm"
            style={{ minHeight }}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div 
            className="p-3 min-h-[120px] max-h-[300px] prose-comment text-sm overflow-y-auto"
          >
            {value.trim() ? (
              renderMarkdown(value)
            ) : (
              <p className="text-muted-foreground italic">Nada para visualizar ainda...</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Ações e Dicas */}
      {showActions && (
        <div className="flex items-center justify-between p-3 bg-muted/20 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <span className="hidden sm:inline">Ctrl+Enter para enviar • </span>
            <span>Suporte a Markdown</span>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={disabled}
                className="h-7 px-3 text-xs"
              >
                {cancelLabel}
              </Button>
            )}
            {onSubmit && (
              <Button
                onClick={onSubmit}
                disabled={disabled || !value.trim()}
                size="sm"
                className="h-7 px-3 text-xs"
              >
                {submitLabel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}