import prisma from './prisma';

export type Todo = {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: number;
  completed: boolean;
  created_at: string;
  updated_at: string | null;
  project_name?: string;
  project_color?: string;
  kanban_column?:
    | "backlog"
    | "planning"
    | "inProgress"
    | "validation"
    | "completed"
    | null;
  kanban_order?: number | null;
  points?: number;
  attachments?: any[];
  estimated_time?: number | null;
};

// Função auxiliar para verificar se uma tarefa é válida para hoje
// Considera data e horário para determinar se ainda não venceu
function isTaskValidForToday(task: any): boolean {
  if (!task.due_date) return false;
  
  const now = new Date();
  const taskDueDate = new Date(task.due_date);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Verifica se é para hoje (mesmo dia)
  const isToday = taskDueDate >= today && taskDueDate < tomorrow;
  
  // Verifica se o horário ainda não passou
  const notExpired = taskDueDate >= now;
  
  // Verifica se não está concluída
  const notCompleted = !task.completed;
  
  return isToday && notExpired && notCompleted;
}

export async function getTodayTasks(userId: number): Promise<Todo[]> {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await prisma.todos.findMany({
    where: {
      user_id: userId,
      due_date: {
        gte: today,
        lt: tomorrow
      },
      completed: false
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    },
    orderBy: [
      { kanban_order: 'asc' },
      { priority: 'asc' },
      { due_date: 'asc' }
    ]
  });

  return tasks.map(task => ({
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at?.toISOString() || null,
    due_date: task.due_date?.toISOString() || null,
    project_name: task.todo_projects[0]?.projects?.name || undefined,
    project_color: task.todo_projects[0]?.projects?.color || undefined,
    attachments: task.attachments as any[]
  }));
}

export async function getInboxTasks(userId: number): Promise<Todo[]> {
  const tasks = await prisma.todos.findMany({
    where: {
      user_id: userId,
      completed: false
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    },
    orderBy: [
      { kanban_order: 'asc' },
      { created_at: 'desc' }
    ]
  });

  return tasks.map(task => ({
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at?.toISOString() || null,
    due_date: task.due_date?.toISOString() || null,
    project_name: task.todo_projects[0]?.projects?.name || undefined,
    project_color: task.todo_projects[0]?.projects?.color || undefined,
    attachments: task.attachments as any[]
  }));
}

export async function getCompletedTasks(userId: number): Promise<Todo[]> {
  const tasks = await prisma.todos.findMany({
    where: {
      user_id: userId,
      completed: true
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    },
    orderBy: [
      { kanban_order: 'asc' },
      { updated_at: 'desc' }
    ],
    take: 50
  });

  return tasks.map(task => ({
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at?.toISOString() || null,
    due_date: task.due_date?.toISOString() || null,
    project_name: task.todo_projects[0]?.projects?.name || undefined,
    project_color: task.todo_projects[0]?.projects?.color || undefined,
    attachments: task.attachments as any[]
  }));
}

export async function createTask({
  userId,
  title,
  description,
  dueDate,
  priority = 4,
  projectId = null,
  kanbanColumn = null,
  kanbanOrder = null,
  points = 3,
  attachments = [],
  estimatedTime = null,
}: {
  userId: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: number;
  projectId?: number | null;
  kanbanColumn?: string | null;
  kanbanOrder?: number | null;
  points?: number;
  attachments?: any[];
  estimatedTime?: number | null;
}): Promise<Todo> {
  let normalizedDueDate: Date | null = null;
  
  if (dueDate) {
    try {
      const date = new Date(dueDate);
      if (!isNaN(date.getTime())) {
        normalizedDueDate = date;
      }
    } catch (error) {
      normalizedDueDate = null;
    }
  }

  let normalizedAttachments = [];
  try {
    if (Array.isArray(attachments)) {
      normalizedAttachments = attachments;
    } else if (typeof attachments === "string") {
      try {
        normalizedAttachments = JSON.parse(attachments);
      } catch (e) {
        normalizedAttachments = [];
      }
    }
  } catch (error) {
    normalizedAttachments = [];
  }

  const task = await prisma.todos.create({
    data: {
      user_id: userId,
      title,
      description,
      due_date: normalizedDueDate,
      priority,
      kanban_column: kanbanColumn,
      kanban_order: kanbanOrder,
      points,
      attachments: normalizedAttachments,
      estimated_time: estimatedTime,
      ...(projectId && {
        todo_projects: {
          create: {
            project_id: projectId
          }
        }
      })
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    }
  });

  return {
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at?.toISOString() || null,
    due_date: task.due_date?.toISOString() || null,
    project_name: task.todo_projects[0]?.projects?.name || undefined,
    project_color: task.todo_projects[0]?.projects?.color || undefined,
    attachments: normalizedAttachments
  };
}

export async function updateTask(
  taskId: number,
  userId: number,
  updates: Partial<Todo>,
): Promise<Todo> {
  // Verificar se a tarefa existe e pertence ao usuário
  const existingTask = await prisma.todos.findFirst({
    where: {
      id: taskId,
      user_id: userId
    }
  });

  if (!existingTask) {
    throw new Error("Task not found or not owned by user");
  }

  let normalizedDueDate: Date | null = null;
  if (updates.due_date !== undefined) {
    try {
      if (updates.due_date !== null) {
        const date = new Date(updates.due_date);
        if (!isNaN(date.getTime())) {
          normalizedDueDate = date;
        }
      }
    } catch (error) {
      normalizedDueDate = null;
    }
  }

  let normalizedAttachments = undefined;
  if (updates.attachments !== undefined) {
    try {
      if (Array.isArray(updates.attachments)) {
        normalizedAttachments = updates.attachments;
      } else if (typeof updates.attachments === "string") {
        try {
          normalizedAttachments = JSON.parse(updates.attachments);
        } catch (e) {
          normalizedAttachments = [];
        }
      }
    } catch (error) {
      normalizedAttachments = [];
    }
  }

  const updateData: any = {
    updated_at: new Date(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.due_date !== undefined) updateData.due_date = normalizedDueDate;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.completed !== undefined) updateData.completed = updates.completed;
  if (updates.kanban_column !== undefined) updateData.kanban_column = updates.kanban_column;
  if (updates.kanban_order !== undefined) updateData.kanban_order = updates.kanban_order;
  if (updates.points !== undefined) updateData.points = updates.points;
  if (normalizedAttachments !== undefined) updateData.attachments = normalizedAttachments;
  if (updates.estimated_time !== undefined) updateData.estimated_time = updates.estimated_time;

  const task = await prisma.todos.update({
    where: {
      id: taskId
    },
    data: updateData,
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    }
  });

  return {
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at?.toISOString() || null,
    due_date: task.due_date?.toISOString() || null,
    project_name: task.todo_projects[0]?.projects?.name || undefined,
    project_color: task.todo_projects[0]?.projects?.color || undefined,
    attachments: task.attachments as any[]
  };
}

export async function toggleTaskCompletion(
  taskId: number,
  userId: number,
): Promise<Todo> {
  const now = new Date().toISOString();

  // Primeiro verificar se a tarefa existe e pertence ao usuário
  const existingTask = await prisma.todos.findFirst({
    where: {
      id: taskId,
      user_id: userId
    }
  });

  if (!existingTask) {
    throw new Error("Task not found or not owned by user");
  }

  // Executar a atualização
  const task = await prisma.todos.update({
    where: {
      id: taskId,
      user_id: userId
    },
    data: {
      completed: !existingTask.completed,
      updated_at: now
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    }
  });

  if (!task) {
    throw new Error("Failed to update task completion status");
  }

  return task as Todo;
}

export async function deleteTask(
  taskId: number,
  userId: number,
): Promise<void> {
  
  try {
    // Primeiro verificar se a tarefa existe e pertence ao usuário
    const existingTask = await prisma.todos.findFirst({
      where: {
        id: taskId,
        user_id: userId
      }
    });
    
    if (!existingTask) {
      throw new Error("Task not found or not owned by user");
    }
    
    // Deletar anexos relacionados
    await prisma.attachments.deleteMany({
      where: {
        entity_type: 'task',
        entity_id: taskId,
        user_id: userId
      }
    });
    
    // Deletar a tarefa
    await prisma.todos.delete({
      where: {
        id: taskId,
        user_id: userId
      }
    });
    
  } catch (error) {
    throw error;
  }
}

export async function getTaskById(
  taskId: number,
  userId: number,
): Promise<Todo | null> {
  const task = await prisma.todos.findFirst({
    where: {
      id: taskId,
      user_id: userId
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      },
      attachments: {
        orderBy: {
          created_at: 'desc'
        }
      }
    }
  });

  if (!task) {
    return null;
  }

  return {
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at?.toISOString() || null,
    due_date: task.due_date?.toISOString() || null,
    project_name: task.todo_projects[0]?.projects?.name || undefined,
    project_color: task.todo_projects[0]?.projects?.color || undefined,
    attachments: task.attachments.map(att => ({
      id: att.id,
      type: att.mime_type.startsWith('image/') ? 'image' : 'file',
      url: att.file_path,
      name: att.file_name,
      size: Number(att.file_size)
    }))
  };
}

export async function getTaskProject(
  taskId: number,
  userId: number,
): Promise<number | null> {
  // Verificar primeiro se a tarefa pertence ao usuário
  const taskCheck = await prisma.todos.findFirst({
    where: {
      id: taskId,
      user_id: userId
    }
  });

  // Se a tarefa não pertencer ao usuário, retorne null
  if (!taskCheck) {
    return null;
  }

  const project = await prisma.todo_projects.findFirst({
    where: {
      todo_id: taskId
    },
    include: {
      projects: true
    }
  });

  return project?.project_id || null;
}

export async function setTaskProject(
  taskId: number,
  userId: number,
  projectId: number | null,
): Promise<void> {
  if (!taskId || isNaN(taskId) || taskId <= 0) {
    throw new Error("Invalid task ID");
  }

  try {
    // Verificar primeiro se a tarefa pertence ao usuário
    const taskCheck = await prisma.todos.findFirst({
      where: {
        id: taskId,
        user_id: userId
      }
    });

    // Se a tarefa não pertencer ao usuário, lançar erro
    if (!taskCheck) {
      throw new Error("Task not found or not owned by user");
    }

    await prisma.todo_projects.deleteMany({
      where: {
        todo_id: taskId
      }
    });

    if (projectId !== null && projectId > 0) {
      await prisma.todo_projects.create({
        data: {
          todo_id: taskId,
          project_id: projectId
        }
      });
    }


  } catch (error) {
    console.error(`[setTaskProject] Erro ao definir projeto da tarefa:`, error);
    throw error;
  }
}

export async function getUpcomingTasks(userId: number): Promise<Todo[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Início do dia de hoje

  const tasks = await prisma.todos.findMany({
    where: {
      user_id: userId,
      due_date: {
        not: null,
        gte: today
      },
      completed: false
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    },
    orderBy: [
      { kanban_order: 'asc' },
      { due_date: 'asc' },
      { priority: 'asc' }
    ]
  });

  tasks.forEach((task: any) => {
;
  });

  return tasks.map(task => ({
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at?.toISOString() || null,
    due_date: task.due_date?.toISOString() || null,
    project_name: task.todo_projects[0]?.projects?.name || undefined,
    project_color: task.todo_projects[0]?.projects?.color || undefined,
    attachments: task.attachments as any[]
  }));
}

export async function searchTasks(
  userId: number,
  searchText: string,
): Promise<Todo[]> {
  if (!searchText || searchText.length < 2) {
    return [];
  }

  try {
    const normalizedSearchText = searchText.toLowerCase().trim();
    const pattern = `%${normalizedSearchText}%`;



    const userCheck =
      await prisma.users.findFirst({
        where: {
          id: userId
        }
      });
    if (!userCheck) {

      return [];
    }

    const taskCount =
      await prisma.todos.count({
        where: {
          user_id: userId
        }
      });


    const result = await prisma.todos.findMany({
      where: {
        user_id: userId,
        OR: [
          { title: { contains: normalizedSearchText, mode: 'insensitive' } },
          { description: { contains: normalizedSearchText, mode: 'insensitive' } }
        ]
      },
      orderBy: [
        { completed: 'asc' },
        { priority: 'asc' }
      ],
      take: 50
    });



    if (result.length > 0) {
      for (const task of result) {
        const projectInfo = await prisma.todo_projects.findFirst({
          where: {
            todo_id: task.id
          },
          include: {
            projects: true
          }
        });

        if (projectInfo) {
          task.project_name = projectInfo.projects?.name;
          task.project_color = projectInfo.projects?.color;
        }
      }
    }

    return result as Todo[];
  } catch (error) {
    console.error("[searchTasks] Erro:", error);
    return [];
  }
}

export async function getTasksForNotifications(
  userId: number,
  daysAhead: number = 3,
  ignoreReadStatus: boolean = false,
): Promise<{
  overdueCount: number;
  dueTodayCount: number;
  upcomingCount: number;
  overdueTasks: Todo[];
  dueTodayTasks: Todo[];
  upcomingTasks: Todo[];
}> {
  
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  // Tasks vencidas (overdue)
  const overdueTasks = await prisma.todos.findMany({
    where: {
      user_id: userId,
      due_date: {
        not: null,
        lt: today
      },
      completed: false
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    },
    orderBy: [
      { due_date: 'asc' }
    ]
  });

  // Tasks para hoje (due today)
  const dueTodayTasks = await prisma.todos.findMany({
    where: {
      user_id: userId,
      due_date: {
        not: null,
        gte: today,
        lt: tomorrow
      },
      completed: false
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    },
    orderBy: [
      { due_date: 'asc' }
    ]
  });

  // Tasks futuras (upcoming)
  const upcomingTasks = await prisma.todos.findMany({
    where: {
      user_id: userId,
      due_date: {
        not: null,
        gte: tomorrow,
        lt: futureDate
      },
      completed: false
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    },
    orderBy: [
      { due_date: 'asc' }
    ]
  });

  const safeOverdueTasks = Array.isArray(overdueTasks) ? overdueTasks : [];
  const safeDueTodayTasks = Array.isArray(dueTodayTasks) ? dueTodayTasks : [];
  const safeUpcomingTasks = Array.isArray(upcomingTasks) ? upcomingTasks : [];

  return {
    overdueCount: safeOverdueTasks.length,
    dueTodayCount: safeDueTodayTasks.length,
    upcomingCount: safeUpcomingTasks.length,
    overdueTasks: safeOverdueTasks as Todo[],
    dueTodayTasks: safeDueTodayTasks as Todo[],
    upcomingTasks: safeUpcomingTasks as Todo[],
  };
}

export async function getAllTasksForUser(userId: number): Promise<Todo[]> {
  // Esta é uma representação da lógica que deve ser aplicada
  // na sua rota GET /api/tasks quando all=true
  const tasks = await prisma.todos.findMany({
    where: {
      user_id: userId
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    },
    orderBy: [
      { kanban_order: 'asc' },
      { created_at: 'desc' }
    ]
  });

  // Definir ordem das colunas kanban
  const kanbanColumnOrder = ['backlog', 'planning', 'inProgress', 'validation', 'completed'];

  // Ordenar manualmente por coluna kanban e depois por kanban_order
  const sortedTasks = tasks.sort((a, b) => {
    // Primeiro, ordenar por coluna kanban
    const aColumnIndex = a.kanban_column ? kanbanColumnOrder.indexOf(a.kanban_column) : kanbanColumnOrder.length;
    const bColumnIndex = b.kanban_column ? kanbanColumnOrder.indexOf(b.kanban_column) : kanbanColumnOrder.length;
    
    if (aColumnIndex !== bColumnIndex) {
      return aColumnIndex - bColumnIndex;
    }
    
    // Se estão na mesma coluna, ordenar por kanban_order
    const aOrder = a.kanban_order ?? 999999;
    const bOrder = b.kanban_order ?? 999999;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // Por último, ordenar por data de criação (mais recente primeiro)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return sortedTasks.map(task => ({
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at?.toISOString() || null,
    due_date: task.due_date?.toISOString() || null,
    project_name: task.todo_projects[0]?.projects?.name || undefined,
    project_color: task.todo_projects[0]?.projects?.color || undefined,
    attachments: task.attachments as any[]
  }));
}
