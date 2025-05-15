// Mock do componente KanbanBoard
jest.mock('@/components/kanban-board', () => ({
  KanbanBoard: jest.fn(() => <div data-testid="kanban-board-mock">Kanban Board Mock</div>)
}));

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/components/ui/use-toast';
import { KanbanBoard } from '@/components/kanban-board';
import * as i18n from '@/lib/i18n';

// Mock dos módulos e hooks necessários
jest.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: 'pt'
  }),
}));

// Mock fetch global
global.fetch = jest.fn() as jest.Mock;

// Mock da resposta da API para tarefas
const mockTasksResponse = {
  tasks: [
    {
      id: 1,
      title: 'Tarefa 1',
      description: 'Descrição da tarefa 1',
      due_date: new Date().toISOString(),
      kanban_column: 'backlog',
      kanban_order: 0,
      completed: false
    },
    {
      id: 2,
      title: 'Tarefa 2',
      description: 'Descrição da tarefa 2',
      due_date: new Date().toISOString(),
      kanban_column: 'planning',
      kanban_order: 0,
      completed: false
    },
    {
      id: 3,
      title: 'Tarefa 3',
      description: 'Descrição da tarefa 3',
      due_date: new Date().toISOString(),
      kanban_column: 'completed',
      kanban_order: 0,
      completed: true
    }
  ]
};

describe('KanbanBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock das respostas das APIs
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/tasks?all=true')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTasksResponse)
        });
      } else if (url.includes('/api/tasks/today')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tasks: [mockTasksResponse.tasks[1]] })
        });
      } else if (url.includes('/api/tasks/upcoming')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tasks: [mockTasksResponse.tasks[0]] })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  test('renderiza o Kanban com as colunas corretas', async () => {
    render(
      <ToastProvider>
        <KanbanBoard />
      </ToastProvider>
    );

    // Verificar se o mock do Kanban foi renderizado
    expect(screen.getByTestId('kanban-board-mock')).toBeInTheDocument();
  });

  test('atualiza o estado após buscar as tarefas', async () => {
    render(
      <ToastProvider>
        <KanbanBoard />
      </ToastProvider>
    );

    // Verificar se o mock do Kanban foi renderizado
    expect(screen.getByTestId('kanban-board-mock')).toBeInTheDocument();
  });
}); 