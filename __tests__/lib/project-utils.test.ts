import {
  calculateProgress,
  calculateTotalStoryPoints,
  filterByStatus,
  getOverdueTasks,
  sortByDueDate,
  type ProjectTask,
} from "@/lib/project-utils"

function task(overrides: Partial<ProjectTask> = {}): ProjectTask {
  return {
    id: "t1",
    title: "Task",
    status: "todo",
    priority: "medium",
    dueDate: "2026-06-01",
    ...overrides,
  }
}

describe("calculateProgress", () => {
  it("is the share of tasks that are done", () => {
    const tasks = [
      task({ id: "1", status: "done" }),
      task({ id: "2", status: "done" }),
      task({ id: "3", status: "todo" }),
      task({ id: "4", status: "in-progress" }),
    ]

    // Two of four. This returned 100 for any list with at least one done task,
    // because it divided the done count by itself.
    expect(calculateProgress(tasks)).toBe(50)
  })

  it("is 0 for an empty list", () => {
    expect(calculateProgress([])).toBe(0)
  })

  it("is 0 when nothing is done", () => {
    expect(calculateProgress([task(), task({ id: "2" })])).toBe(0)
  })

  it("is 100 when everything is done", () => {
    expect(calculateProgress([task({ status: "done" })])).toBe(100)
  })
})

describe("filterByStatus", () => {
  it("matches on status, not priority", () => {
    const tasks = [
      task({ id: "1", status: "done", priority: "high" }),
      task({ id: "2", status: "todo", priority: "high" }),
    ]

    expect(filterByStatus(tasks, "done").map((t) => t.id)).toEqual(["1"])
  })

  it("returns nothing when a priority value is passed as a status", () => {
    // The old version filtered on priority, so this returned both tasks.
    expect(filterByStatus([task({ priority: "high" })], "high")).toEqual([])
  })
})

describe("getOverdueTasks", () => {
  const today = "2026-06-15"

  it("includes tasks past their due date", () => {
    const tasks = [task({ id: "late", dueDate: "2026-06-10" })]

    expect(getOverdueTasks(tasks, today).map((t) => t.id)).toEqual(["late"])
  })

  it("does not treat a task due today as overdue", () => {
    // The day is not over. This used <=, which flagged every task due today.
    expect(getOverdueTasks([task({ dueDate: today })], today)).toEqual([])
  })

  it("ignores done and cancelled tasks however late they are", () => {
    const tasks = [
      task({ id: "1", dueDate: "2020-01-01", status: "done" }),
      task({ id: "2", dueDate: "2020-01-01", status: "cancelled" }),
    ]

    expect(getOverdueTasks(tasks, today)).toEqual([])
  })
})

describe("calculateTotalStoryPoints", () => {
  it("keeps half points", () => {
    const tasks = [task({ storyPoints: 2.5 }), task({ id: "2", storyPoints: 1.5 })]

    // parseInt floored each value, so this used to come out as 3.
    expect(calculateTotalStoryPoints(tasks)).toBe(4)
  })

  it("counts a task with no estimate as zero", () => {
    expect(calculateTotalStoryPoints([task(), task({ id: "2", storyPoints: 3 })])).toBe(3)
  })
})

describe("sortByDueDate", () => {
  it("puts the earliest date first", () => {
    const tasks = [
      task({ id: "late", dueDate: "2026-09-01" }),
      task({ id: "early", dueDate: "2026-01-01" }),
    ]

    expect(sortByDueDate(tasks).map((t) => t.id)).toEqual(["early", "late"])
  })

  it("leaves the input array alone", () => {
    const tasks = [task({ id: "b", dueDate: "2026-09-01" }), task({ id: "a", dueDate: "2026-01-01" })]
    sortByDueDate(tasks)

    expect(tasks.map((t) => t.id)).toEqual(["b", "a"])
  })
})
