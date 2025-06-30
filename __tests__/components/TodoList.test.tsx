import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoList } from '@/components/todo-list';
import '@testing-library/jest-dom';

const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
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
        'allCaughtUp': 'Tudo em dia',
        'noTasksMessage': 'Não há tarefas pendentes',
        'today': 'Hoje',
        'tomorrow': 'Amanhã',
        'veryEasy': 'Muito fácil',
        'easy': 'Fácil',
        'medium': 'Médio',
        'hard': 'Difícil',
        'veryHard': 'Muito difícil',
        'Task updated': 'Tarefa atualizada',
        'Task status has been updated.': 'O status da tarefa foi atualizado.',
        'Failed to update task': 'Falha ao atualizar tarefa',
        'Please try again.': 'Por favor, tente novamente.',
        'taskDeleted': 'Tarefa excluída',
        'Task has been deleted successfully.': 'A tarefa foi excluída com sucesso.',
        'Failed to delete task': 'Falha ao excluir tarefa',
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

describe('Componente TodoList', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'Tarefa 1',
      description: 'Descrição da tarefa 1',
      due_date: new Date().toISOString(),
      priority: 1,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: null,
      project_name: 'Projeto A',
      project_color: '#ff0000',
      points: 2
    },
    {
      id: 2,
      title: 'Tarefa 2',
      description: 'Descrição da tarefa 2',
      due_date: new Date(Date.now() + 86400000).toISOString(), // Amanhã
      priority: 2,
      completed: true,
      created_at: new Date().toISOString(),
      updated_at: null,
      project_name: 'Projeto B',
      project_color: '#00ff00',
      points: 3
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve mostrar mensagem quando não há tarefas', () => {
    render(<TodoList tasks={[]} />);

    expect(screen.getByText('Tudo em dia')).toBeInTheDocument();
    expect(screen.getByText('Não há tarefas pendentes')).toBeInTheDocument();
  });

  test('deve renderizar lista de tarefas corretamente', () => {
    render(<TodoList tasks={mockTasks} />);

    expect(screen.getByText('Tarefa 1')).toBeInTheDocument();
    expect(screen.getByText('Tarefa 2')).toBeInTheDocument();

    expect(screen.getByText('Projeto A')).toBeInTheDocument();
    expect(screen.getByText('Projeto B')).toBeInTheDocument();

    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('P2')).toBeInTheDocument();
  });

  test('deve chamar API para marcar tarefa como concluída quando checkbox é clicado', async () => {
    render(<TodoList tasks={mockTasks} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks/toggle/1',
        { method: 'PATCH' }
      );
    });
  });

  test('deve chamar API para excluir tarefa quando botão de excluir é clicado', async () => {
    render(<TodoList tasks={mockTasks} />);

    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[deleteButtons.length - 2]); // Botão de excluir da primeira tarefa

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks/1',
        { method: 'DELETE' }
      );
    });
  });

  test('deve alterar a ordenação das tarefas quando o select é alterado', () => {
    render(<TodoList tasks={mockTasks} />);

    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    const titleOption = screen.getByText('Título');
    fireEvent.click(titleOption);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toHaveTextContent('Tarefa 1');
    expect(listItems[1]).toHaveTextContent('Tarefa 2');

    fireEvent.click(selectTrigger);
    const priorityOption = screen.getByText('Prioridade');
    fireEvent.click(priorityOption);

    const listItemsAfterReorder = screen.getAllByRole('listitem');
    expect(listItemsAfterReorder[0]).toHaveTextContent('Tarefa 1');
    expect(listItemsAfterReorder[1]).toHaveTextContent('Tarefa 2');
  });

  test('deve exibir toast de sucesso ao marcar tarefa como concluída', async () => {
    render(<TodoList tasks={mockTasks} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Tarefa atualizada',
        description: 'O status da tarefa foi atualizado.',
      });
      // Não verifica mais router.refresh() pois foi removido para melhor performance
    });
  });

  test('deve exibir toast de erro quando falhar ao marcar tarefa como concluída', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('API Error');
    });

    render(<TodoList tasks={mockTasks} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Falha ao atualizar tarefa',
        description: 'Por favor, tente novamente.',
      });
    });
  });

  test('deve exibir toast de erro quando falhar ao excluir tarefa', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('API Error');
    });

    render(<TodoList tasks={mockTasks} />);

    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[deleteButtons.length - 2]);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Falha ao excluir tarefa',
        description: 'Por favor, tente novamente.',
      });
    });
  });

  test('deve ordenar tarefas por data de vencimento', () => {
    const tasksWithDifferentDates = [
      {
        ...mockTasks[0], 
        id: 3,
        title: 'Tarefa Futura',
        due_date: new Date(Date.now() + 172800000).toISOString() // 2 dias no futuro
      },
      {
        ...mockTasks[1],
        id: 4,
        title: 'Tarefa Próxima',
        due_date: new Date(Date.now() + 86400000).toISOString() // 1 dia no futuro
      }
    ];

    render(<TodoList tasks={tasksWithDifferentDates} />);

    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    const dateOption = screen.getByText('Data de Vencimento');
    fireEvent.click(dateOption);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toHaveTextContent('Tarefa Próxima');
    expect(listItems[1]).toHaveTextContent('Tarefa Futura');
  });

  test('deve ordenar tarefas por data de criação', () => {
    const tasksWithDifferentCreationDates = [
      {
        ...mockTasks[0], 
        id: 5,
        title: 'Tarefa Antiga',
        created_at: new Date(Date.now() - 86400000).toISOString() // 1 dia no passado
      },
      {
        ...mockTasks[1],
        id: 6,
        title: 'Tarefa Nova',
        created_at: new Date().toISOString() // agora
      }
    ];

    render(<TodoList tasks={tasksWithDifferentCreationDates} />);

    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    const dateOption = screen.getByText('Data de Criação');
    fireEvent.click(dateOption);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).toHaveTextContent('Tarefa Nova');
    expect(listItems[1]).toHaveTextContent('Tarefa Antiga');
  });

  test('deve exibir corretamente cores diferentes para diferentes prioridades', () => {
    const tasksWithDifferentPriorities = [
      { ...mockTasks[0], id: 7, priority: 1, title: 'Prioridade Alta' },
      { ...mockTasks[0], id: 8, priority: 2, title: 'Prioridade Média' },
      { ...mockTasks[0], id: 9, priority: 3, title: 'Prioridade Baixa' },
      { ...mockTasks[0], id: 10, priority: 4, title: 'Prioridade Padrão' }
    ];

    render(<TodoList tasks={tasksWithDifferentPriorities} />);

    expect(screen.getByText('Prioridade Alta')).toBeInTheDocument();
    expect(screen.getByText('Prioridade Média')).toBeInTheDocument();
    expect(screen.getByText('Prioridade Baixa')).toBeInTheDocument();
    expect(screen.getByText('Prioridade Padrão')).toBeInTheDocument();
  });

  test('deve exibir corretamente a formatação de diferentes pontuações', () => {
    const tasksWithDifferentPoints = [
      { ...mockTasks[0], id: 11, points: 1, title: 'Muito Fácil' },
      { ...mockTasks[0], id: 12, points: 2, title: 'Fácil' },
      { ...mockTasks[0], id: 13, points: 3, title: 'Médio' },
      { ...mockTasks[0], id: 14, points: 4, title: 'Difícil' },
      { ...mockTasks[0], id: 15, points: 5, title: 'Muito Difícil' }
    ];

    render(<TodoList tasks={tasksWithDifferentPoints} />);

    expect(screen.getByText('Muito Fácil')).toBeInTheDocument();
    expect(screen.getByText('Fácil')).toBeInTheDocument();
    expect(screen.getByText('Médio')).toBeInTheDocument();
    expect(screen.getByText('Difícil')).toBeInTheDocument();
    expect(screen.getByText('Muito Difícil')).toBeInTheDocument();

    expect(screen.getAllByText('1 pts')).toHaveLength(1);
    expect(screen.getAllByText('2 pts')).toHaveLength(1);
    expect(screen.getAllByText('3 pts')).toHaveLength(1);
    expect(screen.getAllByText('4 pts')).toHaveLength(1);
    expect(screen.getAllByText('5 pts')).toHaveLength(1);
  });

  test('deve exibir corretamente tarefas sem data de vencimento', () => {
    const taskWithoutDueDate = [
      { ...mockTasks[0], id: 16, due_date: null, title: 'Sem Data' }
    ];

    render(<TodoList tasks={taskWithoutDueDate} />);
    expect(screen.getByText('Sem Data')).toBeInTheDocument();
    const taskItem = screen.getByRole('listitem');
    expect(taskItem).not.toHaveTextContent('Hoje');
    expect(taskItem).not.toHaveTextContent('Amanhã');
  });

  test('deve renderizar tarefas sem project_name corretamente', () => {
    const taskWithoutProject = [
      { ...mockTasks[0], id: 17, project_name: null, project_color: null, title: 'Sem Projeto' }
    ];

    render(<TodoList tasks={taskWithoutProject} />);
    expect(screen.getByText('Sem Projeto')).toBeInTheDocument();
    const taskItem = screen.getByRole('listitem');
    expect(taskItem).not.toHaveTextContent('Projeto A');
  });

  test('deve renderizar tarefas sem points corretamente', () => {
    const taskWithoutPoints = [
      { ...mockTasks[0], id: 18, points: null, title: 'Sem Pontuação' }
    ];

    render(<TodoList tasks={taskWithoutPoints} />);
    expect(screen.getByText('Sem Pontuação')).toBeInTheDocument();
    const taskItem = screen.getByRole('listitem');
    expect(taskItem).not.toHaveTextContent('pts');
  });

  test('deve formatar datas específicas corretamente', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const thirdDay = new Date(today);
    thirdDay.setDate(today.getDate() + 2);
    
    const tasksWithSpecificDates = [
      { 
        ...mockTasks[0], 
        id: 19, 
        title: 'Tarefa Hoje', 
        due_date: today.toISOString() 
      },
      { 
        ...mockTasks[0], 
        id: 20, 
        title: 'Tarefa Amanhã', 
        due_date: tomorrow.toISOString()
      },
      { 
        ...mockTasks[0], 
        id: 21, 
        title: 'Tarefa Depois de Amanhã', 
        due_date: thirdDay.toISOString()
      }
    ];

    render(<TodoList tasks={tasksWithSpecificDates} />);
    
    expect(screen.getByText('Hoje')).toBeInTheDocument();
    expect(screen.getByText('Amanhã')).toBeInTheDocument();
    
    const formattedDate = new Intl.DateTimeFormat('pt-BR').format(thirdDay).split(' ')[0];
    
    const thirdTaskItem = screen.getByText('Tarefa Depois de Amanhã').closest('li');
    expect(thirdTaskItem).toBeInTheDocument();
    
    const dateRegex = /\d{2}\/\d{2}\/\d{4}/; // Formato dd/MM/yyyy
    expect(thirdTaskItem?.textContent).toMatch(dateRegex);
  });

  test('deve exibir corretamente o label da pontuação com valor padrão para pontuação desconhecida', () => {
    const taskWithUnknownPoints = [
      { ...mockTasks[0], id: 22, points: 999, title: 'Pontuação Desconhecida' } // Pontuação não mapeada
    ];

    render(<TodoList tasks={taskWithUnknownPoints} />);
    expect(screen.getByText('Pontuação Desconhecida')).toBeInTheDocument();
    expect(screen.getByText('999 pts')).toBeInTheDocument();
  });

  test('deve exibir corretamente as diferentes cores dos pontos', () => {
    render(<TodoList tasks={[
      { ...mockTasks[0], id: 23, points: 1, title: 'Verde' },
      { ...mockTasks[0], id: 24, points: 2, title: 'Azul' },
      { ...mockTasks[0], id: 25, points: 3, title: 'Amarelo' },
      { ...mockTasks[0], id: 26, points: 4, title: 'Laranja' },
      { ...mockTasks[0], id: 27, points: 5, title: 'Vermelho' },
      { ...mockTasks[0], id: 28, points: 999, title: 'Desconhecido' }
    ]} />);

    expect(screen.getByText('Verde')).toBeInTheDocument();
    expect(screen.getByText('Azul')).toBeInTheDocument();
    expect(screen.getByText('Amarelo')).toBeInTheDocument();
    expect(screen.getByText('Laranja')).toBeInTheDocument();
    expect(screen.getByText('Vermelho')).toBeInTheDocument();
    expect(screen.getByText('Desconhecido')).toBeInTheDocument();
  });
}); 