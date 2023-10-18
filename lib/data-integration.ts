import { apiClient } from "./api-client"

export interface SystemData {
  users: User[]
  companies: Company[]
  products: Product[]
  sales: Sale[]
  invoices: Invoice[]
  employees: Employee[]
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  industry: string
  status: "active" | "inactive"
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  supplier: string
  status: "in-stock" | "low-stock" | "out-of-stock"
}

export interface Sale {
  id: string
  customerName: string
  items: { productId: string; quantity: number; price: number }[]
  total: number
  paymentMethod: string
  date: string
  status: "completed" | "pending" | "cancelled"
}

export interface Invoice {
  id: string
  companyId: string
  items: { description: string; quantity: number; price: number }[]
  subtotal: number
  tax: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  dueDate: string
}

export interface Employee {
  id: string
  name: string
  position: string
  department: string
  salary: number
  hireDate: string
  status: "active" | "inactive"
}

// Data integration service connected to Supabase via API
class DataIntegrationService {
  private static instance: DataIntegrationService

  private constructor() {}

  public static getInstance(): DataIntegrationService {
    if (!DataIntegrationService.instance) {
      DataIntegrationService.instance = new DataIntegrationService()
    }
    return DataIntegrationService.instance
  }

  // Fetch all data from backend API
  public async getAllData(): Promise<SystemData> {
    try {
      const [users, companies, products, sales, invoices, employees] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/companies'),
        apiClient.get('/products'),
        apiClient.get('/sales'),
        apiClient.get('/invoices'),
        apiClient.get('/employees'),
      ])

      return {
        users,
        companies,
        products,
        sales,
        invoices,
        employees,
      }
    } catch (error) {
      console.error("Failed to fetch system data:", error)
      return {
        users: [],
        companies: [],
        products: [],
        sales: [],
        invoices: [],
        employees: [],
      }
    }
  }

  // Get analytics from backend
  public async getAnalytics() {
    try {
      return await apiClient.get('/analytics')
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalCompanies: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        totalSales: 0,
        pendingInvoices: 0,
        totalEmployees: 0,
      }
    }
  }

  // Add new item through API
  public async addItem<T>(endpoint: string, item: T): Promise<T> {
    return apiClient.post(endpoint, item)
  }

  // Update item through API
  public async updateItem<T extends { id: string }>(endpoint: string, id: string, updates: Partial<T>): Promise<T> {
    return apiClient.put(`${endpoint}/${id}`, updates)
  }

  // Delete item through API
  public async deleteItem(endpoint: string, id: string): Promise<void> {
    return apiClient.delete(`${endpoint}/${id}`)
  }
}

export const dataIntegration = DataIntegrationService.getInstance()

// Utility functions for cross-module data access
export const getSystemAnalytics = () => dataIntegration.getAnalytics()
export const getAllData = () => dataIntegration.getAllData()
export const updateSystemData = (endpoint: string, id: string, updates: any) =>
  dataIntegration.updateItem(endpoint, id, updates)
