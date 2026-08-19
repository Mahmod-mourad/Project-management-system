import axios, { type AxiosInstance } from "axios"

import type {
  CreateProjectInput,
  CreateTenantInput,
  CreateTaskInput,
  CreateUserInput,
  Project,
  ProjectStats,
  Task,
  Tenant,
  TenantStats,
  User,
} from "./types"

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null
  private tenantId: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Request interceptor to add auth token and tenant ID
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        if (this.tenantId) {
          config.headers["x-tenant-id"] = this.tenantId
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status

        // 401 means the token is gone or expired: drop it and start over.
        // 403 means the token is fine but this account may not do this — keeping
        // the session and letting the caller show the message is the right move.
        if (status === 401) {
          this.clearAuth()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        // Normalise what callers catch. Axios errors carry the useful text three
        // levels deep, so every call site was digging it out for itself.
        const message =
          error.response?.data?.message ||
          error.message ||
          "The request failed. Please try again."

        return Promise.reject(
          Object.assign(new Error(Array.isArray(message) ? message.join(", ") : message), {
            status,
            cause: error,
          }),
        )
      },
    )
  }

  setAuth(token: string, tenantId: string) {
    this.token = token
    this.tenantId = tenantId

    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
      localStorage.setItem("tenant_id", tenantId)
    }
  }

  clearAuth() {
    this.token = null
    this.tenantId = null

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("tenant_id")
      // The auth provider caches the signed-in user here. Leaving it behind
      // after a 401 or a logout means the next page load restores a stale user.
      localStorage.removeItem("auth-user")
    }
  }

  initializeAuth() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      const tenantId = localStorage.getItem("tenant_id")

      if (token && tenantId) {
        this.token = token
        this.tenantId = tenantId
      }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post("/auth/login", { email, password })
    return response.data
  }

  async logout() {
    const response = await this.client.post("/auth/logout")
    this.clearAuth()
    return response.data
  }

  async getProfile() {
    const response = await this.client.get("/auth/profile")
    return response.data
  }

  // Notification endpoints
  async getNotifications() {
    const response = await this.client.get("/notifications")
    return response.data
  }

  async markNotificationRead(id: string) {
    const response = await this.client.patch(`/notifications/${id}/read`)
    return response.data
  }

  async markAllNotificationsRead() {
    const response = await this.client.post("/notifications/mark-all-read")
    return response.data
  }

  // Tenant endpoints
  async getTenants(): Promise<Tenant[]> {
    const response = await this.client.get("/tenants")
    return response.data
  }

  async getTenant(id: string): Promise<Tenant> {
    const response = await this.client.get(`/tenants/${id}`)
    return response.data
  }

  async createTenant(input: CreateTenantInput): Promise<Tenant> {
    const response = await this.client.post("/tenants", input)
    return response.data
  }

  async updateTenant(id: string, input: Partial<CreateTenantInput>): Promise<Tenant> {
    const response = await this.client.patch(`/tenants/${id}`, input)
    return response.data
  }

  async getTenantStats(id: string): Promise<TenantStats> {
    const response = await this.client.get(`/tenants/${id}/stats`)
    return response.data
  }

  // Project endpoints
  async getProjects(): Promise<Project[]> {
    const response = await this.client.get("/projects")
    return response.data
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.client.get(`/projects/${id}`)
    return response.data
  }

  async createProject(projectData: CreateProjectInput): Promise<Project> {
    const response = await this.client.post("/projects", projectData)
    return response.data
  }

  async updateProject(id: string, projectData: Partial<CreateProjectInput>): Promise<Project> {
    const response = await this.client.patch(`/projects/${id}`, projectData)
    return response.data
  }

  async deleteProject(id: string) {
    const response = await this.client.delete(`/projects/${id}`)
    return response.data
  }

  async getProjectStats(id: string): Promise<ProjectStats> {
    const response = await this.client.get(`/projects/${id}/stats`)
    return response.data
  }

  // Task endpoints
  async getTasks(projectId?: string): Promise<Task[]> {
    const params = projectId ? { project_id: projectId } : {}
    const response = await this.client.get("/tasks", { params })
    return response.data
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.client.get(`/tasks/${id}`)
    return response.data
  }

  async createTask(taskData: CreateTaskInput): Promise<Task> {
    const response = await this.client.post("/tasks", taskData)
    return response.data
  }

  async updateTask(id: string, taskData: Partial<CreateTaskInput>): Promise<Task> {
    const response = await this.client.patch(`/tasks/${id}`, taskData)
    return response.data
  }

  async deleteTask(id: string) {
    const response = await this.client.delete(`/tasks/${id}`)
    return response.data
  }

  async getTasksByStatus() {
    const response = await this.client.get("/tasks/by-status")
    return response.data
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await this.client.get("/users")
    return response.data
  }

  /**
   * Adds a user to the signed-in tenant. Administrators only.
   *
   * This replaces register(), which posted to the public /auth/register with a
   * tenant_id chosen by the caller. The tenant now comes from the session.
   */
  async createUser(input: CreateUserInput): Promise<User> {
    const response = await this.client.post("/users", input)
    return response.data
  }

  async getUser(id: string) {
    const response = await this.client.get(`/users/${id}`)
    return response.data
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await this.client.patch(`/users/${id}`, userData)
    return response.data
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/users/${id}`)
    return response.data
  }
}

export const apiClient = new ApiClient()

// Initialize auth on client side
if (typeof window !== "undefined") {
  apiClient.initializeAuth()
}
