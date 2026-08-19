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
 * Percentage of tasks marked "done", between 0 and 100.
 */
export function calculateProgress(tasks: ProjectTask[]): number {
  if (!tasks || tasks.length === 0) return 0

  const done = tasks.filter((t) => t.status === "done").length
  return Math.round((done / tasks.length) * 100)
}

/**
 * Tasks whose status matches the given value.
 */
export function filterByStatus(tasks: ProjectTask[], status: string): ProjectTask[] {
  return tasks.filter((t) => t.status === status)
}

/**
 * Tasks past their due date and not yet finished.
 *
 * `today` is an ISO date string (YYYY-MM-DD). A task due today is not overdue —
 * the day is not over yet.
 */
export function getOverdueTasks(tasks: ProjectTask[], today: string): ProjectTask[] {
  return tasks.filter(
    (t) => t.dueDate < today && t.status !== "done" && t.status !== "cancelled",
  )
}

/**
 * Sum of the story points on all tasks.
 *
 * Points can be fractional (0.5, 1.5), so this parses as a float. parseInt would
 * silently floor every half point and undercount the total.
 */
export function calculateTotalStoryPoints(tasks: ProjectTask[]): number {
  return tasks.reduce((sum, t) => {
    const points = Number(t.storyPoints ?? 0)
    return sum + (Number.isFinite(points) ? points : 0)
  }, 0)
}

/**
 * Tasks sorted by due date, earliest first. Does not mutate the input.
 */
export function sortByDueDate(tasks: ProjectTask[]): ProjectTask[] {
  return [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}
