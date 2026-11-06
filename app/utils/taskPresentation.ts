import type { Task, TaskPriority, TaskStatus } from '~/types/task'

export const statusLabels: Record<TaskStatus, string> = {
  TODO: 'برای انجام',
  'In Progress': 'در حال انجام',
  Review: 'در بازبینی',
  Done: 'انجام‌شده',
}

export const priorityLabels: Record<TaskPriority, string> = {
  Low: 'کم',
  Medium: 'متوسط',
  High: 'زیاد',
}

export const statusOptions = (Object.keys(statusLabels) as TaskStatus[])
  .map(value => ({ value, label: statusLabels[value] }))

export const priorityOptions = (Object.keys(priorityLabels) as TaskPriority[])
  .map(value => ({ value, label: priorityLabels[value] }))

export function formatDueDate(value: string | null): string {
  if (!value) return 'بدون سررسید'
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`))
}

export function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'Done') return false
  const now = new Date()
  const localToday = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')].join('-')
  return task.dueDate < localToday
}
