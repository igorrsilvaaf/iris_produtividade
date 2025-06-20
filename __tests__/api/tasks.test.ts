import { NextRequest, NextResponse } from 'next/server';
import * as authLib from '@/lib/auth';
import * as todosLib from '@/lib/todos';
import { GET, PUT, PATCH, DELETE } from '@/app/api/tasks/[id]/route';

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}));

jest.mock('@/lib/todos', () => ({
  getTaskById: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

describe('API de Tarefas - Endpoints para Kanban', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (authLib.getSession as jest.Mock).mockResolvedValue({
      user: { id: 1 }
    });

    (NextResponse.json as jest.Mock).mockImplementation((data) => data);
  });

  describe('GET /api/tasks/[id]', () => {
    test('retorna uma tarefa individual com campos kanban', async () => {
      const mockTask = {
        id: 1,
        title: 'Tarefa Teste',
        description: 'Descrição da tarefa',
        kanban_column: 'planning',
        kanban_order: 2,
        completed: false
      };

      (todosLib.getTaskById as jest.Mock).mockResolvedValue(mockTask);

      const request = { 
        url: '/api/tasks/1'
      } as unknown as NextRequest;
      const context = { params: { id: '1' } };
      const response = await GET(request, context);

      expect(todosLib.getTaskById).toHaveBeenCalledWith(1, 1);
      expect(NextResponse.json).toHaveBeenCalledWith(mockTask);
      expect(response).toEqual(mockTask);
    });
  });

  describe('PATCH /api/tasks/[id]', () => {
    test('atualiza os campos kanban_column e kanban_order de uma tarefa', async () => {
      const mockRequestBody = {
        kanban_column: 'inProgress',
        kanban_order: 3
      };

      const mockExistingTask = {
        id: 1,
        title: 'Tarefa Teste',
        kanban_column: 'planning',
        kanban_order: 2
      };

      const mockUpdatedTask = {
        ...mockExistingTask,
        ...mockRequestBody
      };

      (todosLib.getTaskById as jest.Mock).mockResolvedValue(mockExistingTask);
      (todosLib.updateTask as jest.Mock).mockResolvedValue(mockUpdatedTask);
      
      const mockJson = jest.fn().mockResolvedValue(mockRequestBody);
      const request = { json: mockJson } as unknown as NextRequest;
      const context = { params: { id: '1' } };
      const response = await PATCH(request, context);

      expect(todosLib.getTaskById).toHaveBeenCalledWith(1, 1);
      expect(todosLib.updateTask).toHaveBeenCalledWith(
        1, 
        1, 
        expect.objectContaining({
          kanban_column: 'inProgress',
          kanban_order: expect.any(Number)
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(mockUpdatedTask);
      expect(response).toEqual(mockUpdatedTask);
    });

    test('atualiza apenas o campo kanban_column de uma tarefa', async () => {
      const mockRequestBody = {
        kanban_column: 'completed'
      };

      const mockExistingTask = {
        id: 1,
        title: 'Tarefa Teste',
        kanban_column: 'inProgress',
        kanban_order: 3
      };

      const mockUpdatedTask = {
        ...mockExistingTask,
        ...mockRequestBody,
        completed: true 
      };

      (todosLib.getTaskById as jest.Mock).mockResolvedValue(mockExistingTask);
      (todosLib.updateTask as jest.Mock).mockResolvedValue(mockUpdatedTask);
      
      const mockJson = jest.fn().mockResolvedValue(mockRequestBody);
      const request = { json: mockJson } as unknown as NextRequest;
      const context = { params: { id: '1' } };
      const response = await PATCH(request, context);

      expect(todosLib.getTaskById).toHaveBeenCalledWith(1, 1);
      expect(todosLib.updateTask).toHaveBeenCalledWith(
        1, 
        1, 
        expect.objectContaining({
          kanban_column: 'completed'
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(mockUpdatedTask);
      expect(response).toEqual(mockUpdatedTask);
    });
  });

  describe('PUT /api/tasks/[id]', () => {
    test('atualiza completamente uma tarefa incluindo campos kanban', async () => {
      const mockRequestBody = {
        title: 'Tarefa Atualizada',
        description: 'Nova descrição',
        due_date: '2023-12-31',
        priority: 'high',
        completed: true,
        kanban_column: 'completed',
        kanban_order: 1,
        points: 3,
        attachments: [],
        estimated_time: 120
      };

      const mockExistingTask = {
        id: 1,
        title: 'Tarefa Original',
        kanban_column: 'inProgress',
        kanban_order: 3
      };

      const mockUpdatedTask = {
        ...mockExistingTask,
        ...mockRequestBody
      };

      (todosLib.getTaskById as jest.Mock).mockResolvedValue(mockExistingTask);
      (todosLib.updateTask as jest.Mock).mockResolvedValue(mockUpdatedTask);
      
      const mockJson = jest.fn().mockResolvedValue(mockRequestBody);
      const request = { json: mockJson } as unknown as NextRequest;
      const context = { params: { id: '1' } };

      const response = await PUT(request, context);

      expect(todosLib.getTaskById).toHaveBeenCalledWith(1, 1);
      expect(todosLib.updateTask).toHaveBeenCalledWith(
        1, 
        1, 
        expect.objectContaining({
          title: 'Tarefa Atualizada',
          description: 'Nova descrição',
          kanban_column: 'completed'
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(mockUpdatedTask);
      expect(response).toEqual(mockUpdatedTask);
    });
  });

  describe('DELETE /api/tasks/[id]', () => {
    test('exclui uma tarefa', async () => {
      const mockExistingTask = {
        id: 1,
        title: 'Tarefa para Excluir',
        kanban_column: 'backlog',
        kanban_order: 0
      };

      (todosLib.getTaskById as jest.Mock).mockResolvedValue(mockExistingTask);
      (todosLib.deleteTask as jest.Mock).mockResolvedValue(undefined);
      
      const request = {} as NextRequest;
      const context = { params: { id: '1' } };

      const response = await DELETE(request, context);

      expect(todosLib.getTaskById).toHaveBeenCalledWith(1, 1);
      expect(todosLib.deleteTask).toHaveBeenCalledWith(1, 1);
      expect(NextResponse.json).toHaveBeenCalledWith({ message: "Task deleted successfully" });
      expect(response).toEqual({ message: "Task deleted successfully" });
    });
  });
}); 