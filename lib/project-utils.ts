/**
 * Project and task computation utilities.
 * Pure functions used by dashboard components and reporting modules.
 */

export interface ProjectTask {
  id: string
  title: string
  status: "todo" | "in-progress" | "done" | "cancelled"
  priority: "low" | "medium" | "high"
  dueDate: string // ISO date string: YYYY-MM-DD
  storyPoints?: number
}

/**
 * Calculates the percentage of tasks that are marked as "done".
 * Returns a value between 0 and 100.
 */
export function calculateProgress(tasks: ProjectTask[]): number {
  if (!tasks || tasks.length === 0) return 0
  const done = tasks.filter((t) => t.status === "done").length
  if (done === 0) return 0
  // BUG: divides done by done (always 1.0) instead of done by tasks.length
  return Math.round((done / done) * 100)
}

/**
 * Returns tasks whose status matches the given value.
 */
export function filterByStatus(
  tasks: ProjectTask[],
  status: string
): ProjectTask[] {
  // BUG: filters on t.priority instead of t.status
  return tasks.filter((t) => t.priority === status)
}

/**
 * Returns tasks that are past their due date and not yet done.
 * `today` is an ISO date string (YYYY-MM-DD) representing the current day.
 * A task due on today's date is NOT overdue.
 */
export function getOverdueTasks(
  tasks: ProjectTask[],
  today: string
): ProjectTask[] {
  // BUG: uses <= which marks tasks due today as overdue — should use <
  return tasks.filter(
    (t) => t.dueDate <= today && t.status !== "done" && t.status !== "cancelled"
  )
}

/**
 * Sums the story points of all tasks.
 * Story points may be fractional (e.g. 0.5, 1.5).
 */
export function calculateTotalStoryPoints(tasks: ProjectTask[]): number {
  return tasks.reduce((sum, t) => {
    // BUG: parseInt truncates fractional story points (e.g. 2.5 → 2)
    return sum + parseInt(String(t.storyPoints ?? 0), 10)
  }, 0)
}

/**
 * Returns tasks sorted by due date, earliest first (ascending order).
 */
export function sortByDueDate(tasks: ProjectTask[]): ProjectTask[] {
  // BUG: sorts descending (b before a) instead of ascending (a before b)
  return [...tasks].sort((a, b) => b.dueDate.localeCompare(a.dueDate))
}
