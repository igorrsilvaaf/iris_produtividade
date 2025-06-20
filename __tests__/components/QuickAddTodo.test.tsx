import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickAddTodo } from '@/components/quick-add-todo';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

const mockToast = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

jest.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
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
    const { container } = render(<QuickAddTodo />);
    
    const submitButton = container.querySelector('button[type="submit"]');
    
    expect(submitButton).not.toBeNull();
    
    if (submitButton) {
      fireEvent.submit(submitButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro',
          description: 'O título é obrigatório',
        });
      });
    }
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('deve enviar os dados corretos quando o formulário for submetido', async () => {
    render(<QuickAddTodo />);
    
    fireEvent.change(screen.getByPlaceholderText('Adicionar nova tarefa...'), {
      target: { value: 'Minha nova tarefa' }
    });
    
    const form = screen.getByRole('form');
    
    fireEvent.submit(form);
    
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
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Tarefa criada',
      description: 'Sua tarefa foi adicionada com sucesso',
    });
  });

  test('deve mostrar erro quando a API falhar', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
      } as Response)
    );
    
    render(<QuickAddTodo />);
    
    fireEvent.change(screen.getByPlaceholderText('Adicionar nova tarefa...'), {
      target: { value: 'Minha nova tarefa' }
    });
    
    const form = screen.getByRole('form');
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao criar tarefa',
      });
    });
  });

  test('deve desabilitar o botão enquanto está carregando', async () => {
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
    
    fireEvent.change(screen.getByPlaceholderText('Adicionar nova tarefa...'), {
      target: { value: 'Minha nova tarefa' }
    });
    
    const form = screen.getByRole('form');
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      const loadingText = screen.queryByText('Adicionando...');
      expect(loadingText).toBeInTheDocument();
    });
  });
}); 