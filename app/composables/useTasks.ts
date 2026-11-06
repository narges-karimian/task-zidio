import type { Task, TaskInput, TaskPriority, TaskStatus } from '~/types/task'
import { TaskValidationError, validateTaskDraft } from '~/utils/taskValidation'

interface TaskRow {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  estimate_minutes: number | null
  created_at: string
  updated_at: string
}

type TaskChangesRow = Partial<Pick<
  TaskRow,
  'title' | 'description' | 'status' | 'priority' | 'due_date' | 'estimate_minutes'
>>

const taskColumns = 'id, title, description, status, priority, due_date, estimate_minutes, created_at, updated_at'
const taskIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const taskPageSize = 500

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    estimateMinutes: row.estimate_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function useTasks() {
  const supabase = useSupabaseClient()

  async function listTasks(): Promise<Task[]> {
    const rows: TaskRow[] = []
    let totalCount = 0

    do {
      const { data, count, error } = await supabase
        .from('tasks')
        .select(taskColumns, { count: 'exact' })
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .range(rows.length, rows.length + taskPageSize - 1)

      if (error) throw error
      if (count === null) throw new Error('Task count was unavailable')
      totalCount = count
      const pageRows = (data ?? []) as TaskRow[]
      if (!pageRows.length && rows.length < totalCount) {
        throw new Error('Task list was incomplete')
      }
      rows.push(...pageRows)
    } while (rows.length < totalCount)

    return rows.map(toTask)
  }

  async function getTask(id: string): Promise<Task | null> {
    if (!taskIdPattern.test(id)) return null

    const { data, error } = await supabase
      .from('tasks')
      .select(taskColumns)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data ? toTask(data as TaskRow) : null
  }

  async function createTask(input: TaskInput): Promise<Task> {
    const validation = validateTaskDraft(input)
    if (!validation.input) throw new TaskValidationError(validation.errors)
    const validInput = validation.input

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: validInput.title,
        description: validInput.description,
        status: validInput.status,
        priority: validInput.priority,
        due_date: validInput.dueDate,
        estimate_minutes: validInput.estimateMinutes,
      })
      .select(taskColumns)
      .single()

    if (error) throw error
    return toTask(data as TaskRow)
  }

  async function updateTask(id: string, changes: Partial<TaskInput>): Promise<Task | null> {
    if (!taskIdPattern.test(id)) return null

    if (changes.title !== undefined && changes.description !== undefined
      && changes.status !== undefined && changes.priority !== undefined
      && changes.dueDate !== undefined && changes.estimateMinutes !== undefined) {
      const validation = validateTaskDraft(changes as TaskInput)
      if (!validation.input) throw new TaskValidationError(validation.errors)
      changes = validation.input
    }

    const values: TaskChangesRow = {}
    if (changes.title !== undefined) values.title = changes.title
    if (changes.description !== undefined) values.description = changes.description
    if (changes.status !== undefined) values.status = changes.status
    if (changes.priority !== undefined) values.priority = changes.priority
    if (changes.dueDate !== undefined) values.due_date = changes.dueDate
    if (changes.estimateMinutes !== undefined) values.estimate_minutes = changes.estimateMinutes
    if (!Object.keys(values).length) return getTask(id)

    const { data, error } = await supabase
      .from('tasks')
      .update(values)
      .eq('id', id)
      .select(taskColumns)
      .maybeSingle()

    if (error) throw error
    return data ? toTask(data as TaskRow) : null
  }

  async function deleteTask(id: string): Promise<boolean> {
    if (!taskIdPattern.test(id)) return false

    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) throw error
    return data !== null
  }

  return { listTasks, getTask, createTask, updateTask, deleteTask }
}
