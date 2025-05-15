import { GET, POST } from '@/app/api/tasks/route';
// Removido: import { NextResponse } from 'next/server'; // Agora virá do mock
import * as auth from '@/lib/auth';
import * as todos from '@/lib/todos';

// Mock de next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: async () => body,
      status: init?.status || 200,
      ok: (init?.status || 200) < 300,
      // @ts-ignore
      headers: new global.Headers(init?.headers), // Usar Headers global do JSDOM
      text: async () => JSON.stringify(body),
      clone: jest.fn().mockImplementation(function() { return { ...this }; }),
    })),
  },
  NextRequest: jest.fn(), // Mock NextRequest como uma função simples
}));

// Mock das dependências
jest.mock('@/lib/auth');
jest.mock('@/lib/todos');

// Mock de NextRequest
const mockRequest = (method: string, searchParams?: URLSearchParams, body?: any) => ({
  method,
  nextUrl: {
    searchParams: searchParams || new URLSearchParams(),
  },
  json: async () => body,
} as any); // Usamos 'as any' para simplificar a simulação do NextRequest

describe('API /api/tasks', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Configurar getSession para retornar null (sem sessão)
      (auth.getSession as jest.Mock).mockResolvedValue(null);

      const req = mockRequest('GET');
      const response = await GET(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(401);
      expect(jsonResponse.error).toBe('Unauthorized');
      expect(auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should return inbox tasks if authenticated and no params are provided', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      const mockTasks = [{ id: 'task-1', title: 'Inbox Task' }];
      
      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (todos.getInboxTasks as jest.Mock).mockResolvedValue(mockTasks);

      const req = mockRequest('GET');
      const response = await GET(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.tasks).toEqual(mockTasks);
      expect(auth.getSession).toHaveBeenCalledTimes(1);
      expect(todos.getInboxTasks).toHaveBeenCalledTimes(1);
      expect(todos.getInboxTasks).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return all tasks if authenticated and "all=true" is provided', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      const mockTasks = [{ id: 'task-1', title: 'All Task 1' }, { id: 'task-2', title: 'All Task 2' }];
      
      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (todos.getAllTasksForUser as jest.Mock).mockResolvedValue(mockTasks);

      const searchParams = new URLSearchParams();
      searchParams.set('all', 'true');
      const req = mockRequest('GET', searchParams);
      const response = await GET(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.tasks).toEqual(mockTasks);
      expect(auth.getSession).toHaveBeenCalledTimes(1);
      expect(todos.getAllTasksForUser).toHaveBeenCalledTimes(1);
      expect(todos.getAllTasksForUser).toHaveBeenCalledWith(mockUser.id);
      expect(todos.getInboxTasks).not.toHaveBeenCalled(); // Garantir que outras funções não foram chamadas
    });

    it('should return searched tasks if authenticated and "search" param is provided', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      const searchText = 'findme';
      const mockTasks = [{ id: 'task-search-1', title: 'Task found by findme' }];
      
      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (todos.searchTasks as jest.Mock).mockResolvedValue(mockTasks);

      const searchParams = new URLSearchParams();
      searchParams.set('search', searchText);
      const req = mockRequest('GET', searchParams);
      const response = await GET(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.tasks).toEqual(mockTasks);
      expect(auth.getSession).toHaveBeenCalledTimes(1);
      expect(todos.searchTasks).toHaveBeenCalledTimes(1);
      expect(todos.searchTasks).toHaveBeenCalledWith(mockUser.id, searchText);
      expect(todos.getAllTasksForUser).not.toHaveBeenCalled();
      expect(todos.getInboxTasks).not.toHaveBeenCalled();
    });

    it('should return completed tasks if authenticated and "completed=true" is provided', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      const mockTasks = [{ id: 'task-completed-1', title: 'Completed Task', completed: true }];
      
      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (todos.getCompletedTasks as jest.Mock).mockResolvedValue(mockTasks);

      const searchParams = new URLSearchParams();
      searchParams.set('completed', 'true');
      const req = mockRequest('GET', searchParams);
      const response = await GET(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.tasks).toEqual(mockTasks);
      expect(auth.getSession).toHaveBeenCalledTimes(1);
      expect(todos.getCompletedTasks).toHaveBeenCalledTimes(1);
      expect(todos.getCompletedTasks).toHaveBeenCalledWith(mockUser.id);
      expect(todos.searchTasks).not.toHaveBeenCalled();
    });

    it('should return overdue tasks if authenticated and "overdue=true" is provided', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      const mockOverdueTasks = [{ id: 'task-overdue-1', title: 'Overdue Task' }];
      
      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });
      // getTasksForNotifications retorna um objeto com overdueTasks e upcomingTasks
      (todos.getTasksForNotifications as jest.Mock).mockResolvedValue({ 
        overdueTasks: mockOverdueTasks, 
        upcomingTasks: [] 
      });

      const searchParams = new URLSearchParams();
      searchParams.set('overdue', 'true');
      const req = mockRequest('GET', searchParams);
      const response = await GET(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.tasks).toEqual(mockOverdueTasks);
      expect(auth.getSession).toHaveBeenCalledTimes(1);
      expect(todos.getTasksForNotifications).toHaveBeenCalledTimes(1);
      expect(todos.getTasksForNotifications).toHaveBeenCalledWith(mockUser.id);
      expect(todos.getCompletedTasks).not.toHaveBeenCalled();
    });

    it('should return 500 if getSession throws an error', async () => {
      (auth.getSession as jest.Mock).mockRejectedValue(new Error('Session error'));

      const req = mockRequest('GET');
      const response = await GET(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.error).toBe('Failed to fetch tasks'); // Mensagem genérica da rota
    });

    it('should return 500 if fetching tasks (e.g., getInboxTasks) throws an error', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (todos.getInboxTasks as jest.Mock).mockRejectedValue(new Error('DB error'));

      const req = mockRequest('GET');
      const response = await GET(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.error).toBe('Failed to fetch tasks');
    });

    // Outros testes para GET virão aqui
  });

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      (auth.getSession as jest.Mock).mockResolvedValue(null);
      
      const req = mockRequest('POST', undefined, { title: 'Test Task' });
      const response = await POST(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(401);
      expect(jsonResponse.error).toBe('Unauthorized');
      expect(auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if title is not provided in the request body', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });

      const req = mockRequest('POST', undefined, { description: 'Task without title' }); // Sem title
      const response = await POST(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.error).toBe('Title is required');
      expect(todos.createTask).not.toHaveBeenCalled();
    });

    it('should create a task with minimal valid data and return 200', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      const taskData = { title: 'New Minimal Task' };
      const createdTask = {
        id: 'task-new-1',
        ...taskData,
        userId: mockUser.id,
        description: undefined, // Esperado se não fornecido
        dueDate: null, // Esperado se não fornecido
        priority: 4, // Valor padrão
        projectId: null, // Esperado se não fornecido
        kanbanColumn: null, // Esperado se não fornecido
        points: 3, // Valor padrão
        attachments: [], // Esperado se não fornecido
        estimatedTime: null, // Esperado se não fornecido
        completed: false, 
      };

      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (todos.createTask as jest.Mock).mockResolvedValue(createdTask);

      const req = mockRequest('POST', undefined, taskData);
      const response = await POST(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.task).toEqual(createdTask);
      expect(todos.createTask).toHaveBeenCalledTimes(1);
      expect(todos.createTask).toHaveBeenCalledWith({
        userId: mockUser.id,
        title: taskData.title,
        description: undefined,
        dueDate: null,
        priority: 4, // Padrão
        projectId: null,
        kanbanColumn: null,
        points: 3, // Padrão
        attachments: [],
        estimatedTime: null,
      });
    });

    it('should create a task with all fields provided and return 200', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      const now = new Date();
      const taskData = {
        title: 'Full Task',
        description: 'Full description',
        due_date: now.toISOString(),
        priority: 1,
        project_id: 'project-1',
        kanban_column: 'inProgress',
        points: 5,
        attachments: [{ name: 'file.txt', url: 'http://example.com/file.txt', type: 'text/plain', size: 100 }],
        estimated_time: 3600, // 1 hora em segundos
      };
      const createdTask = {
        id: 'task-full-1',
        userId: mockUser.id,
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.due_date, // A rota usa due_date como dueDate
        priority: taskData.priority,
        projectId: taskData.project_id,
        kanbanColumn: taskData.kanban_column,
        points: taskData.points,
        attachments: taskData.attachments,
        estimatedTime: taskData.estimated_time,
        completed: false,
      };

      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (todos.createTask as jest.Mock).mockResolvedValue(createdTask);

      const req = mockRequest('POST', undefined, taskData);
      const response = await POST(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.task).toEqual(createdTask);
      expect(todos.createTask).toHaveBeenCalledTimes(1);
      expect(todos.createTask).toHaveBeenCalledWith({
        userId: mockUser.id,
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.due_date,
        priority: taskData.priority,
        projectId: taskData.project_id,
        kanbanColumn: taskData.kanban_column,
        points: taskData.points,
        attachments: taskData.attachments,
        estimatedTime: taskData.estimated_time,
      });
    });
    
    it('should return 500 if getSession throws an error during POST', async () => {
      (auth.getSession as jest.Mock).mockRejectedValue(new Error('Session error'));

      const req = mockRequest('POST', undefined, { title: 'Test Task' });
      const response = await POST(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      // A rota POST tem um try-catch externo que pode levar a uma mensagem de erro diferente
      // se o erro do getSession não for pego pelo primeiro if (!session)
      // No entanto, o mais provável é que caia no "Failed to create task" do catch mais externo.
      // Vamos verificar a mensagem exata retornada pela rota.
      // Pela lógica da rota, se getSession() falha, deve cair no catch externo.
      expect(jsonResponse.error).toBe('Failed to create task'); 
    });

    it('should return 500 if createTask throws an error', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (todos.createTask as jest.Mock).mockRejectedValue(new Error('DB create error'));

      const req = mockRequest('POST', undefined, { title: 'Test Task' });
      const response = await POST(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.error).toBe('Erro ao criar tarefa: DB create error');
    });

    it('should return 500 if request.json() throws an error (invalid JSON body)', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (auth.getSession as jest.Mock).mockResolvedValue({ user: mockUser });

      const req = {
        method: 'POST',
        nextUrl: { searchParams: new URLSearchParams() },
        json: async () => { throw new Error('Invalid JSON'); }, // Simular erro no parsing do JSON
      } as any;
      
      const response = await POST(req);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.error).toBe('Failed to create task'); // Erro genérico do catch externo
    });
  });
}); 