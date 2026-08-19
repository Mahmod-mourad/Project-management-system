import { Injectable } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { NotificationGateway } from "./notification.gateway"

export interface Notification {
  id: string
  tenant_id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  data?: any
  created_at: string
}

@Injectable()
export class NotificationService {
  constructor(
    private supabaseService: SupabaseService,
    private notificationGateway: NotificationGateway,
  ) {}

  async create(notification: Omit<Notification, "id" | "created_at" | "read">) {
    const { data, error } = await this.supabaseService.client
      .from("notifications")
      .insert({ ...notification, read: false })
      .select()
      .single()

    if (error) throw error

    // Send real-time notification
    this.notificationGateway.sendToUser(notification.user_id, "notification", data)

    return data
  }

  async findAll(tenantId: string, userId: string) {
    const { data, error } = await this.supabaseService.client
      .from("notifications")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  async markAsRead(tenantId: string, userId: string, notificationId: string) {
    const { data, error } = await this.supabaseService.client
      .from("notifications")
      .update({ read: true })
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .eq("id", notificationId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async markAllAsRead(tenantId: string, userId: string) {
    const { error } = await this.supabaseService.client
      .from("notifications")
      .update({ read: true })
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .eq("read", false)

    if (error) throw error
    return { message: "All notifications marked as read" }
  }

  // Helper methods for common notification types
  async notifyTaskAssigned(tenantId: string, userId: string, taskTitle: string, assignedBy: string) {
    return this.create({
      tenant_id: tenantId,
      user_id: userId,
      title: "مهمة جديدة",
      message: `تم تعيين مهمة "${taskTitle}" لك من قبل ${assignedBy}`,
      type: "info",
      data: { type: "task_assigned", task_title: taskTitle },
    })
  }

  async notifyProjectUpdate(tenantId: string, userId: string, projectName: string, updateType: string) {
    return this.create({
      tenant_id: tenantId,
      user_id: userId,
      title: "تحديث المشروع",
      message: `تم ${updateType} في مشروع "${projectName}"`,
      type: "info",
      data: { type: "project_update", project_name: projectName },
    })
  }

  async notifySystemAlert(tenantId: string, userId: string, message: string) {
    return this.create({
      tenant_id: tenantId,
      user_id: userId,
      title: "تنبيه النظام",
      message,
      type: "warning",
      data: { type: "system_alert" },
    })
  }
}
