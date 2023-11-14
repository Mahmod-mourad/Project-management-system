"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Employee {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  salary: number
  hireDate: string
  status: "active" | "inactive" | "on-leave"
  manager: string
  address: string
}

interface AttendanceData {
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  hoursWorked: number
  status: "present" | "absent" | "late" | "half-day"
}

interface AttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
  onSave: (attendance: AttendanceData) => void
}

export function AttendanceDialog({ open, onOpenChange, employees, onSave }: AttendanceDialogProps) {
  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "",
    checkOut: "",
    status: "present" as "present" | "absent" | "late" | "half-day",
  })

  const calculateHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(`2000-01-01T${checkIn}:00`)
    const end = new Date(`2000-01-01T${checkOut}:00`)
    const diff = end.getTime() - start.getTime()
    return Math.round((diff / (1000 * 60 * 60)) * 100) / 100
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedEmployee = employees.find((emp) => emp.employeeId === formData.employeeId)
    if (!selectedEmployee) return

    const hoursWorked = calculateHours(formData.checkIn, formData.checkOut)

    onSave({
      employeeId: formData.employeeId,
      employeeName: selectedEmployee.name,
      date: formData.date,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      hoursWorked,
      status: formData.status,
    })

    // Reset form
    setFormData({
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      checkIn: "",
      checkOut: "",
      status: "present",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تسجيل حضور وانصراف</DialogTitle>
          <DialogDescription>تسجيل حضور الموظف لليوم المحدد</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">الموظف</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((emp) => emp.status === "active")
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.employeeId}>
                        {employee.name} - {employee.employeeId}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">وقت الحضور</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">وقت الانصراف</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">حالة الحضور</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "present" | "absent" | "late" | "half-day") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">حاضر</SelectItem>
                  <SelectItem value="late">متأخر</SelectItem>
                  <SelectItem value="absent">غائب</SelectItem>
                  <SelectItem value="half-day">نصف يوم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.checkIn && formData.checkOut && (
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm text-slate-600">
                  ساعات العمل: {calculateHours(formData.checkIn, formData.checkOut)} ساعة
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">تسجيل الحضور</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
