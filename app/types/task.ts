export type TaskStatus = 'TODO' | 'In Progress' | 'Review' | 'Done'
export type TaskPriority = 'Low' | 'Medium' | 'High'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  estimateMinutes: number | null
  createdAt: string
  updatedAt: string
}

export type TaskInput = Pick<
  Task,
  'title' | 'description' | 'status' | 'priority' | 'dueDate' | 'estimateMinutes'
>
