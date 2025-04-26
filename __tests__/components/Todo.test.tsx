import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Todo } from '@/components/Todo';
import '@testing-library/jest-dom';

// Mock do useRouter
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
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
    t: jest.fn((key) => key),
  }),
}));

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Componente Todo', () => {
  const mockTodo = {
    id: 1,
    title: 'Tarefa de Teste',
    description: 'Descrição da tarefa de teste',
    due_date: new Date().toISOString(),
    priority: 2,
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: null,
    project_name: 'Projeto Teste',
    project_color: '#ff0000',
    points: 3
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('deve renderizar corretamente com as propriedades fornecidas', () => {
    render(<Todo todo={mockTodo} />);
    
    // Verificar se o título da tarefa está sendo exibido
    expect(screen.getByText('Tarefa de Teste')).toBeInTheDocument();
    
    // Verificar se a descrição está sendo exibida
    expect(screen.getByText('Descrição da tarefa de teste')).toBeInTheDocument();
    
    // Verificar se o nome do projeto está sendo exibido
    expect(screen.getByText('Projeto Teste')).toBeInTheDocument();
    
    // Verificar se os botões estão presentes
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('deve chamar onComplete quando o botão de completar é clicado', () => {
    const handleComplete = jest.fn();
    render(<Todo todo={mockTodo} onComplete={handleComplete} />);
    
    fireEvent.click(screen.getByText('Complete'));
    
    expect(handleComplete).toHaveBeenCalledWith(1);
  });

  test('deve chamar onDelete quando o botão de excluir é clicado', () => {
    const handleDelete = jest.fn();
    render(<Todo todo={mockTodo} onDelete={handleDelete} />);
    
    fireEvent.click(screen.getByText('Delete'));
    
    expect(handleDelete).toHaveBeenCalledWith(1);
  });

  test('deve chamar onClick quando o componente é clicado', () => {
    const handleClick = jest.fn();
    render(<Todo todo={mockTodo} onClick={handleClick} />);
    
    // Clicar no componente inteiro (div principal)
    fireEvent.click(screen.getByText('Tarefa de Teste'));
    
    expect(handleClick).toHaveBeenCalledWith(mockTodo);
  });

  test('deve mostrar tarefa como concluída quando completed=true', () => {
    const completedTodo = {
      ...mockTodo,
      completed: true
    };
    
    render(<Todo todo={completedTodo} />);
    
    // O título deve ter um estilo de texto riscado
    const titleElement = screen.getByText('Tarefa de Teste');
    expect(titleElement).toHaveClass('line-through');
    
    // O ícone de check deve estar presente
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    
    // O botão "Completar" não deve estar presente para tarefas já concluídas
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
  });

  test('deve marcar tarefa como concluída usando a API caso onComplete não seja fornecido', async () => {
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
      })
    );

    render(<Todo todo={mockTodo} />);
    
    fireEvent.click(screen.getByText('Complete'));
    
    await waitFor(() => {
      // Verifica se fetch foi chamado corretamente
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/tasks/${mockTodo.id}/toggle`,
        { method: "PATCH" }
      );
      
      // Verifica se o toast foi exibido
      expect(mockToast).toHaveBeenCalledWith({
        title: "Task updated",
        description: "Task status has been updated.",
      });
      
      // Verifica se a página foi atualizada
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  test('deve excluir tarefa usando a API caso onDelete não seja fornecido', async () => {
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
      })
    );

    render(<Todo todo={mockTodo} />);
    
    fireEvent.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      // Verifica se fetch foi chamado corretamente
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/tasks/${mockTodo.id}`,
        { method: "DELETE" }
      );
      
      // Verifica se o toast foi exibido
      expect(mockToast).toHaveBeenCalledWith({
        title: "taskDeleted",
        description: "Task has been deleted successfully.",
      });
      
      // Verifica se a página foi atualizada
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  test('deve mostrar erro ao excluir tarefa caso a API falhe', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error('API Error');
    });

    render(<Todo todo={mockTodo} />);
    
    fireEvent.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      // Verifica se o toast de erro foi exibido
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Failed to delete task",
        description: "Please try again.",
      });
    });
  });

  test('deve mostrar erro ao marcar tarefa como concluída caso a API falhe', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error('API Error');
    });

    render(<Todo todo={mockTodo} />);
    
    fireEvent.click(screen.getByText('Complete'));
    
    await waitFor(() => {
      // Verifica se o toast de erro foi exibido
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Failed to update task",
        description: "Please try again.",
      });
    });
  });

  test('deve renderizar corretamente diferentes prioridades e pontos', () => {
    const highPriorityTodo = {
      ...mockTodo,
      priority: 1,
      points: 5
    };

    render(<Todo todo={highPriorityTodo} />);
    
    // Verifica se a prioridade está correta
    expect(screen.getByText('P1')).toBeInTheDocument();
    
    // Verifica se os pontos estão corretos
    expect(screen.getByText('5 - Muito Difícil')).toBeInTheDocument();
  });

  test('deve carregar dados do localStorage quando nenhuma tarefa for fornecida', async () => {
    // Configura dados no localStorage
    const savedTodo = { ...mockTodo, id: 99, title: 'Tarefa do localStorage' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTodo));
    
    render(<Todo />);
    
    // Verifica se os dados do localStorage foram carregados e renderizados
    await waitFor(() => {
      expect(screen.getByText('Tarefa do localStorage')).toBeInTheDocument();
    });
    
    // Verifica se o localStorage foi consultado
    expect(localStorageMock.getItem).toHaveBeenCalledWith('todo-data');
  });

  test('deve retornar null quando nenhuma tarefa for fornecida e não houver dados no localStorage', () => {
    // Garante que o localStorage está vazio
    localStorageMock.getItem.mockReturnValue(null);
    
    const { container } = render(<Todo />);
    
    // Verifica se o componente não renderizou nada
    expect(container.firstChild).toBeNull();
  });

  test('deve formatar corretamente a data de hoje', () => {
    const today = new Date();
    const todayTodo = {
      ...mockTodo,
      due_date: today.toISOString()
    };
    
    render(<Todo todo={todayTodo} />);
    
    // Verifica se a data foi formatada como "Hoje"
    expect(screen.getByText('today')).toBeInTheDocument();
  });

  test('deve formatar corretamente a data de amanhã', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowTodo = {
      ...mockTodo,
      due_date: tomorrow.toISOString()
    };
    
    render(<Todo todo={tomorrowTodo} />);
    
    // Verifica se a data foi formatada como "Amanhã"
    expect(screen.getByText('tomorrow')).toBeInTheDocument();
  });
}); 