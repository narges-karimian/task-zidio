import type { TaskPriority, TaskStatus } from '~/types/task'

export type TaskSort = 'newest' | 'oldest' | 'due-asc' | 'due-desc'

export function useDashboardControls() {
  const search = useState('dashboard-search', () => '')
  const statusFilter = useState<TaskStatus | 'all'>('dashboard-status-filter', () => 'all')
  const priorityFilter = useState<TaskPriority | 'all'>('dashboard-priority-filter', () => 'all')
  const sortBy = useState<TaskSort>('dashboard-sort', () => 'newest')
  const showFilters = useState('dashboard-show-filters', () => false)
  const showCreate = useState('dashboard-show-create', () => false)

  function clearFilters() {
    statusFilter.value = 'all'
    priorityFilter.value = 'all'
    sortBy.value = 'newest'
  }

  return { search, statusFilter, priorityFilter, sortBy, showFilters, showCreate, clearFilters }
}
