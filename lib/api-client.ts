import axios, { type AxiosInstance } from "axios"

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
        // BUG #9: Only handles 401, ignores 403, 500 and other errors
        if (error.response?.status === 401) {
          this.clearAuth()
          // Redirect to login if needed
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login"
          }
        }
        return Promise.reject(error)
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

  async register(userData: {
    email: string
    password: string
    full_name: string
    tenant_id: string
  }) {
    const response = await this.client.post("/auth/register", userData)
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

  // Tenant endpoints
  async getTenants() {
    const response = await this.client.get("/tenants")
    return response.data
  }

  async getTenant(id: string) {
    const response = await this.client.get(`/tenants/${id}`)
    return response.data
  }

  async getTenantStats(id: string) {
    const response = await this.client.get(`/tenants/${id}/stats`)
    return response.data
  }

  // Project endpoints
  async getProjects() {
    const response = await this.client.get("/projects")
    return response.data
  }

  async getProject(id: string) {
    const response = await this.client.get(`/projects/${id}`)
    return response.data
  }

  async createProject(projectData: any) {
    const response = await this.client.post("/projects", projectData)
    return response.data
  }

  async updateProject(id: string, projectData: any) {
    const response = await this.client.patch(`/projects/${id}`, projectData)
    return response.data
  }

  async deleteProject(id: string) {
    const response = await this.client.delete(`/projects/${id}`)
    return response.data
  }

  async getProjectStats(id: string) {
    const response = await this.client.get(`/projects/${id}/stats`)
    return response.data
  }

  // Task endpoints
  async getTasks(projectId?: string) {
    const params = projectId ? { project_id: projectId } : {}
    const response = await this.client.get("/tasks", { params })
    return response.data
  }

  async getTask(id: string) {
    const response = await this.client.get(`/tasks/${id}`)
    return response.data
  }

  async createTask(taskData: any) {
    const response = await this.client.post("/tasks", taskData)
    return response.data
  }

  async updateTask(id: string, taskData: any) {
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
  async getUsers() {
    const response = await this.client.get("/users")
    return response.data
  }

  async getUser(id: string) {
    const response = await this.client.get(`/users/${id}`)
    return response.data
  }

  async updateUser(id: string, userData: any) {
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
