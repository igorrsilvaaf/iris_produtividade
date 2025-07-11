import prisma from "./prisma"

export type Label = {
  id: number
  user_id: number
  name: string
  color: string
  created_at: string
}

export async function getLabels(userId: number): Promise<Label[]> {
  const labels = await prisma.labels.findMany({
    where: { user_id: userId },
    orderBy: { name: 'asc' }
  })

  return labels
}

export async function getLabel(labelId: number, userId: number): Promise<Label | null> {
  const label = await prisma.labels.findFirst({
    where: { 
      id: labelId, 
      user_id: userId 
    }
  })

  return label
}

export async function createLabel(userId: number, name: string, color = "#808080"): Promise<Label> {
  const label = await prisma.labels.create({
    data: {
      user_id: userId,
      name: name,
      color: color
    }
  })

  return label
}

export async function updateLabel(labelId: number, userId: number, updates: Partial<Label>): Promise<Label> {
  const label = await prisma.labels.update({
    where: { 
      id: labelId,
      user_id: userId 
    },
    data: {
      ...(updates.name && { name: updates.name }),
      ...(updates.color && { color: updates.color })
    }
  })

  return label
}

export async function deleteLabel(labelId: number, userId: number): Promise<void> {
  await prisma.labels.delete({
    where: { 
      id: labelId,
      user_id: userId 
    }
  })
}

export async function getLabelTasks(labelId: number, userId: number): Promise<any[]> {
  const tasks = await prisma.todos.findMany({
    where: {
      user_id: userId,
      todo_labels: {
        some: {
          label_id: labelId
        }
      }
    },
    orderBy: [
      { completed: 'asc' },
      { priority: 'asc' },
      { due_date: 'asc' }
    ]
  })

  return tasks
}

export async function addLabelToTask(taskId: number, labelId: number): Promise<void> {
  await prisma.todo_labels.upsert({
    where: {
      todo_id_label_id: {
        todo_id: taskId,
        label_id: labelId
      }
    },
    create: {
      todo_id: taskId,
      label_id: labelId
    },
    update: {}
  })
}

export async function removeLabelFromTask(taskId: number, labelId: number): Promise<void> {
  await prisma.todo_labels.delete({
    where: {
      todo_id_label_id: {
        todo_id: taskId,
        label_id: labelId
      }
    }
  })
}

export async function getTaskLabels(taskId: number): Promise<Label[]> {
  const labels = await prisma.labels.findMany({
    where: {
      todo_labels: {
        some: {
          todo_id: taskId
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return labels
}

