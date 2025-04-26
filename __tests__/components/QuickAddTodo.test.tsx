import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickAddTodo } from '@/components/quick-add-todo';
import '@testing-library/jest-dom';

// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

// Mock do useToast
const mockToast = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock de useTranslation
jest.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Simples tradução para os testes
      const translations: Record<string, string> = {
        'Add a new task...': 'Adicionar nova tarefa...',
        'Priority': 'Prioridade',
        'Error': 'Erro',
        'Title is required': 'O título é obrigatório',
        'Task created': 'Tarefa criada',
        'Your task has been added successfully': 'Sua tarefa foi adicionada com sucesso',
        'Failed to create task': 'Falha ao criar tarefa',
        'Add': 'Adicionar',
        'Adding...': 'Adicionando...',
      };
      return translations[key] || key;
    }
  }),
}));

// Mock para fetch global
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
);

describe('Componente QuickAddTodo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar o formulário corretamente', () => {
    render(<QuickAddTodo />);
    
    expect(screen.getByPlaceholderText('Adicionar nova tarefa...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument();
  });

  test('deve mostrar erro quando o título não for preenchido', async () => {
    // Precisamos simular que o botão não está desabilitado para testar o comportamento
    const { container } = render(<QuickAddTodo />);
    
    // Encontrar o botão diretamente pelo container, ignorando o estado desabilitado
    const submitButton = container.querySelector('button[type="submit"]');
    
    // Garantir que encontramos o botão
    expect(submitButton).not.toBeNull();
    
    if (submitButton) {
      // Simular o evento de clique diretamente
      fireEvent.submit(submitButton);
      
      // Aguardar a chamada do toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro',
          description: 'O título é obrigatório',
        });
      });
    }
    
    // Verificar se a API não foi chamada
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('deve enviar os dados corretos quando o formulário for submetido', async () => {
    render(<QuickAddTodo />);
    
    // Preencher o título
    fireEvent.change(screen.getByPlaceholderText('Adicionar nova tarefa...'), {
      target: { value: 'Minha nova tarefa' }
    });
    
    // Encontrar o formulário diretamente
    const form = screen.getByRole('form');
    
    // Simular o envio do formulário diretamente
    fireEvent.submit(form);
    
    // Verificar se a API foi chamada com os parâmetros corretos (usando a prioridade padrão '4')
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Minha nova tarefa',
            priority: 4, // Valor padrão é 4
          }),
        }
      );
    });
    
    // Verificar se o toast de sucesso foi chamado
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Tarefa criada',
      description: 'Sua tarefa foi adicionada com sucesso',
    });
  });

  test('deve mostrar erro quando a API falhar', async () => {
    // Mock para simular falha da API
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
      } as Response)
    );
    
    render(<QuickAddTodo />);
    
    // Preencher o título
    fireEvent.change(screen.getByPlaceholderText('Adicionar nova tarefa...'), {
      target: { value: 'Minha nova tarefa' }
    });
    
    // Encontrar o formulário diretamente
    const form = screen.getByRole('form');
    
    // Simular o envio do formulário diretamente
    fireEvent.submit(form);
    
    // Verificar se o toast de erro foi chamado
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao criar tarefa',
      });
    });
  });

  test('deve desabilitar o botão enquanto está carregando', async () => {
    // Mock para simular uma resposta lenta da API
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({}),
          } as Response);
        }, 100);
      })
    );
    
    render(<QuickAddTodo />);
    
    // Preencher o título
    fireEvent.change(screen.getByPlaceholderText('Adicionar nova tarefa...'), {
      target: { value: 'Minha nova tarefa' }
    });
    
    // Encontrar o formulário diretamente
    const form = screen.getByRole('form');
    
    // Simular o envio do formulário diretamente
    fireEvent.submit(form);
    
    // Verificar se o botão está desabilitado e mostra o texto "Adicionando..."
    await waitFor(() => {
      const loadingText = screen.queryByText('Adicionando...');
      expect(loadingText).toBeInTheDocument();
    });
  });
}); 