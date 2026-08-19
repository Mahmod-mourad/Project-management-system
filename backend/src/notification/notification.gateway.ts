import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { JwtService } from "@nestjs/jwt"
import { Logger } from "@nestjs/common"

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/notifications",
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(NotificationGateway.name)
  private userSockets = new Map<string, Set<string>>() // userId -> Set of socketIds

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token
      if (!token) {
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify(token)
      const userId = payload.sub
      const tenantId = payload.tenant_id

      // Store user connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set())
      }
      this.userSockets.get(userId)!.add(client.id)

      // Join tenant room for tenant-wide notifications
      client.join(`tenant:${tenantId}`)
      client.join(`user:${userId}`)

      // Store user info in socket
      client.data.userId = userId
      client.data.tenantId = tenantId

      this.logger.log(`User ${userId} connected with socket ${client.id}`)
    } catch (error) {
      this.logger.error("Connection authentication failed:", error)
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id)
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId)
      }
    }
    this.logger.log(`Socket ${client.id} disconnected`)
  }

  handleJoinProject(client: Socket, data: { projectId: string }) {
    client.join(`project:${data.projectId}`)
    this.logger.log(`Socket ${client.id} joined project ${data.projectId}`)
  }

  handleLeaveProject(client: Socket, data: { projectId: string }) {
    client.leave(`project:${data.projectId}`)
    this.logger.log(`Socket ${client.id} left project ${data.projectId}`)
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data)
  }

  // Send notification to all users in a tenant
  sendToTenant(tenantId: string, event: string, data: unknown) {
    this.server.to(`tenant:${tenantId}`).emit(event, data)
  }

  // Send notification to all users in a project
  sendToProject(projectId: string, event: string, data: unknown) {
    this.server.to(`project:${projectId}`).emit(event, data)
  }

  // Broadcast system-wide notifications
  broadcast(event: string, data: unknown) {
    this.server.emit(event, data)
  }
}
