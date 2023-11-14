"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface UserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: Omit<User, "id">) => void
  user?: User | null
}

const roles = ["مدير النظام", "مدير المبيعات", "مدير المحاسبة", "محاسب", "موظف مبيعات", "مطور", "موظف"]

const departments = [
  "تقنية المعلومات",
  "المبيعات",
  "المحاسبة",
  "الموارد البشرية",
  "التسويق",
  "العمليات",
  "خدمة العملاء",
]

export function UserDialog({ isOpen, onClose, onSave, user }: UserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "active" as "active" | "inactive",
    department: "",
    joinDate: new Date().toISOString().split("T")[0],
    avatar: "/placeholder.svg?height=32&width=32",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
        joinDate: user.joinDate,
        avatar: user.avatar || "/placeholder.svg?height=32&width=32",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        status: "active",
        department: "",
        joinDate: new Date().toISOString().split("T")[0],
        avatar: "/placeholder.svg?height=32&width=32",
      })
    }
  }, [user, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">{user ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</DialogTitle>
          <DialogDescription className="text-right">
            {user ? "تعديل بيانات المستخدم الحالي" : "إضافة مستخدم جديد إلى النظام"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-right">
                الاسم الكامل
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="text-right"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-right">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="text-right"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role" className="text-right">
                الدور الوظيفي
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر الدور الوظيفي" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role} className="text-right">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department" className="text-right">
                القسم
              </Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept} className="text-right">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-right">
                الحالة
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value as "active" | "inactive")}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="text-right">
                    نشط
                  </SelectItem>
                  <SelectItem value="inactive" className="text-right">
                    غير نشط
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="joinDate" className="text-right">
                تاريخ الانضمام
              </Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) => handleInputChange("joinDate", e.target.value)}
                className="text-right"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">{user ? "تحديث" : "إضافة"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
