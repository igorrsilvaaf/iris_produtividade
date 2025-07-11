import prisma from "./prisma"

export type Project = {
  id: number
  user_id: number
  name: string
  color: string
  is_favorite: boolean
  created_at: string
}

export async function getProjects(userId: number): Promise<Project[]> {
  const projects = await prisma.projects.findMany({
    where: {
      user_id: userId
    },
    orderBy: [
      { is_favorite: 'desc' },
      { name: 'asc' }
    ]
  });

  return projects.map(p => ({
    ...p,
    created_at: p.created_at.toISOString(),
    color: p.color || "#808080",
    is_favorite: p.is_favorite || false
  }));
}

export async function getProject(projectId: number, userId: number): Promise<Project | null> {
  const project = await prisma.projects.findFirst({
    where: {
      id: projectId,
      user_id: userId
    }
  });

  if (!project) {
    return null;
  }

  return {
    ...project,
    created_at: project.created_at.toISOString(),
    color: project.color || "#808080",
    is_favorite: project.is_favorite || false
  };
}

export async function getFavoriteProjects(userId: number): Promise<Project[]> {
  const projects = await prisma.projects.findMany({
    where: {
      user_id: userId,
      is_favorite: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  return projects.map(p => ({
    ...p,
    created_at: p.created_at.toISOString(),
    color: p.color || "#808080",
    is_favorite: p.is_favorite || false
  }));
}

export async function createProject(
  userId: number,
  name: string,
  color: string = "#808080",
): Promise<Project> {
  const project = await prisma.projects.create({
    data: {
      user_id: userId,
      name,
      color,
      is_favorite: false
    }
  });

  return {
    ...project,
    created_at: project.created_at.toISOString(),
    color: project.color || "#808080",
    is_favorite: project.is_favorite || false
  };
}

export async function updateProject(
  projectId: number,
  userId: number,
  updates: Partial<Project>,
): Promise<Project> {
  const project = await prisma.projects.update({
    where: {
      id: projectId,
      user_id: userId
    },
    data: {
      name: updates.name,
      color: updates.color,
      is_favorite: updates.is_favorite
    }
  });

  return {
    ...project,
    created_at: project.created_at.toISOString(),
    color: project.color || "#808080",
    is_favorite: project.is_favorite || false
  };
}

export async function toggleProjectFavorite(projectId: number, userId: number): Promise<Project> {
  const existingProject = await prisma.projects.findFirst({
    where: {
      id: projectId,
      user_id: userId
    }
  });

  if (!existingProject) {
    throw new Error("Project not found");
  }

  const project = await prisma.projects.update({
    where: {
      id: projectId,
      user_id: userId
    },
    data: {
      is_favorite: !existingProject.is_favorite
    }
  });

  return {
    ...project,
    created_at: project.created_at.toISOString(),
    color: project.color || "#808080",
    is_favorite: project.is_favorite || false
  };
}

export async function deleteProject(projectId: number, userId: number): Promise<void> {
  await prisma.projects.delete({
    where: {
      id: projectId,
      user_id: userId
    }
  });
}

export async function getProjectTasks(projectId: number, userId: number) {
  const tasks = await prisma.todos.findMany({
    where: {
      user_id: userId,
      todo_projects: {
        some: {
          project_id: projectId
        }
      }
    },
    include: {
      todo_projects: {
        include: {
          projects: true
        }
      }
    },
    orderBy: [
      { completed: 'asc' },
      { priority: 'asc' }
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

