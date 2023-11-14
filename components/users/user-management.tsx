"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { UserDialog } from "./user-dialog"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  department: string
  joinDate: string
  avatar?: string
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "أحمد محمد",
    email: "ahmed@company.com",
    role: "مدير النظام",
    status: "active",
    department: "تقنية المعلومات",
    joinDate: "2023-01-15",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    name: "فاطمة أحمد",
    email: "fatima@company.com",
    role: "مدير المبيعات",
    status: "active",
    department: "المبيعات",
    joinDate: "2023-02-20",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "3",
    name: "محمد علي",
    email: "mohamed@company.com",
    role: "محاسب",
    status: "active",
    department: "المحاسبة",
    joinDate: "2023-03-10",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "4",
    name: "سارة حسن",
    email: "sara@company.com",
    role: "موظف مبيعات",
    status: "inactive",
    department: "المبيعات",
    joinDate: "2023-04-05",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "5",
    name: "عمر خالد",
    email: "omar@company.com",
    role: "مطور",
    status: "active",
    department: "تقنية المعلومات",
    joinDate: "2023-05-12",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUser = () => {
    setSelectedUser(null)
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const handleToggleStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user,
      ),
    )
  }

  const handleSaveUser = (userData: Omit<User, "id">) => {
    if (selectedUser) {
      // Edit existing user
      setUsers(users.map((user) => (user.id === selectedUser.id ? { ...userData, id: selectedUser.id } : user)))
    } else {
      // Add new user
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
      }
      setUsers([...users, newUser])
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-2">إدارة حسابات المستخدمين وصلاحياتهم</p>
        </div>
        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">إجمالي المستخدمين</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">المستخدمين النشطين</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">
              {users.filter((user) => user.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">المستخدمين غير النشطين</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">
              {users.filter((user) => user.status === "inactive").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">الأقسام</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{new Set(users.map((user) => user.department)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-right">قائمة المستخدمين</CardTitle>
            <div className="relative w-72">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث عن المستخدمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
          </div>
          <CardDescription className="text-right">إدارة وعرض جميع المستخدمين في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ الانضمام</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{user.email}</TableCell>
                  <TableCell className="text-right">{user.role}</TableCell>
                  <TableCell className="text-right">{user.department}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status === "active" ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{new Date(user.joinDate).toLocaleDateString("ar-SA")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-right">الإجراءات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-right" onClick={() => handleEditUser(user)}>
                          <Edit className="ml-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-right" onClick={() => handleToggleStatus(user.id)}>
                          {user.status === "active" ? (
                            <>
                              <UserX className="ml-2 h-4 w-4" />
                              إلغاء التفعيل
                            </>
                          ) : (
                            <>
                              <UserCheck className="ml-2 h-4 w-4" />
                              تفعيل
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-right text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Dialog */}
      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </div>
  )
}
