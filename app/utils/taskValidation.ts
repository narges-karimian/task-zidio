import type { TaskInput, TaskPriority, TaskStatus } from '~/types/task'
import { priorityOptions, statusOptions } from '~/utils/taskPresentation'

export interface TaskDraft {
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  estimateMinutes: string | number | null
}

export type TaskValidationErrors = Partial<Record<
  'title' | 'status' | 'priority' | 'dueDate' | 'estimateMinutes' | 'timing', string
>>

export class TaskValidationError extends Error {
  constructor(readonly fields: TaskValidationErrors) {
    super('Invalid task input')
    this.name = 'TaskValidationError'
  }
}

function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1 || month < 1 || month > 12) return false

  const daysInMonth = [31, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return day >= 1 && day <= daysInMonth[month - 1]!
}

export function validateTaskDraft(draft: TaskDraft): { input: TaskInput | null, errors: TaskValidationErrors } {
  const errors: TaskValidationErrors = {}
  const title = draft.title.trim()
  const dueDate = draft.dueDate?.trim() || null
  const rawMinutes = draft.estimateMinutes === null ? '' : String(draft.estimateMinutes).trim()
  const estimateMinutes = rawMinutes ? Number(rawMinutes) : null

  if (!title) errors.title = 'عنوان وظیفه را وارد کنید.'
  if (!statusOptions.some(option => option.value === draft.status)) errors.status = 'وضعیت انتخاب‌شده معتبر نیست.'
  if (!priorityOptions.some(option => option.value === draft.priority)) errors.priority = 'اولویت انتخاب‌شده معتبر نیست.'
  if (dueDate && !isValidDate(dueDate)) errors.dueDate = 'تاریخ سررسید معتبر نیست.'
  if (estimateMinutes !== null && (!Number.isInteger(estimateMinutes) || estimateMinutes < 1 || estimateMinutes > 2147483647)) {
    errors.estimateMinutes = 'زمان تخمینی باید عدد صحیح مثبت و معتبر باشد.'
  }
  if (!dueDate && estimateMinutes === null) errors.timing = 'تاریخ سررسید یا زمان تخمینی لازم است.'

  if (Object.keys(errors).length) return { input: null, errors }
  return {
    input: {
      title,
      description: draft.description.trim(),
      status: draft.status as TaskStatus,
      priority: draft.priority as TaskPriority,
      dueDate,
      estimateMinutes,
    },
    errors,
  }
}

export function taskSaveFieldErrors(error: unknown): TaskValidationErrors {
  if (error instanceof TaskValidationError) return error.fields
  if (!error || typeof error !== 'object') return {}

  const failure = error as { code?: string, message?: string, details?: string }
  const detail = `${failure.message ?? ''} ${failure.details ?? ''}`
  if (failure.code === '23514') {
    if (detail.includes('tasks_title_not_blank')) return { title: 'عنوان وظیفه را وارد کنید.' }
    if (detail.includes('tasks_status_valid')) return { status: 'وضعیت انتخاب‌شده معتبر نیست.' }
    if (detail.includes('tasks_priority_valid')) return { priority: 'اولویت انتخاب‌شده معتبر نیست.' }
    if (detail.includes('tasks_estimate_minutes_positive')) return { estimateMinutes: 'زمان تخمینی باید عدد صحیح مثبت باشد.' }
    if (detail.includes('tasks_due_or_estimate_required')) return { timing: 'تاریخ سررسید یا زمان تخمینی لازم است.' }
  }
  if (failure.code === '23502' && detail.includes('title')) return { title: 'عنوان وظیفه را وارد کنید.' }
  if (failure.code === '22007' || failure.code === '22008') return { dueDate: 'تاریخ سررسید معتبر نیست.' }
  if (failure.code === '22003' || (failure.code === '22P02' && detail.includes('integer'))) {
    return { estimateMinutes: 'زمان تخمینی باید عدد صحیح مثبت و معتبر باشد.' }
  }
  return {}
}
