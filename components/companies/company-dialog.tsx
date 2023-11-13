"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Company {
  id: string
  name: string
  nameAr: string
  industry: string
  employees: number
  location: string
  phone: string
  email: string
  website: string
  status: "active" | "inactive"
  contractValue: number
  lastContact: string
}

interface CompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company | null
  onSave: (company: Omit<Company, "id">) => void
}

export function CompanyDialog({ open, onOpenChange, company, onSave }: CompanyDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    industry: "",
    employees: 0,
    location: "",
    phone: "",
    email: "",
    website: "",
    status: "active" as "active" | "inactive",
    contractValue: 0,
    lastContact: "",
  })

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        nameAr: company.nameAr,
        industry: company.industry,
        employees: company.employees,
        location: company.location,
        phone: company.phone,
        email: company.email,
        website: company.website,
        status: company.status,
        contractValue: company.contractValue,
        lastContact: company.lastContact,
      })
    } else {
      setFormData({
        name: "",
        nameAr: "",
        industry: "",
        employees: 0,
        location: "",
        phone: "",
        email: "",
        website: "",
        status: "active",
        contractValue: 0,
        lastContact: new Date().toISOString().split("T")[0],
      })
    }
  }, [company, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{company ? "تعديل بيانات الشركة" : "إضافة شركة جديدة"}</DialogTitle>
          <DialogDescription>{company ? "تعديل معلومات الشركة" : "إضافة شركة جديدة إلى النظام"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameAr">الاسم بالعربية</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">الاسم بالإنجليزية</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">القطاع</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القطاع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">التكنولوجيا</SelectItem>
                    <SelectItem value="Trading">التجارة</SelectItem>
                    <SelectItem value="Construction">البناء والتشييد</SelectItem>
                    <SelectItem value="Healthcare">الرعاية الصحية</SelectItem>
                    <SelectItem value="Education">التعليم</SelectItem>
                    <SelectItem value="Finance">المالية</SelectItem>
                    <SelectItem value="Manufacturing">التصنيع</SelectItem>
                    <SelectItem value="Other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employees">عدد الموظفين</Label>
                <Input
                  id="employees"
                  type="number"
                  value={formData.employees}
                  onChange={(e) => setFormData({ ...formData, employees: Number.parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">الموقع الإلكتروني</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractValue">قيمة العقد</Label>
                <Input
                  id="contractValue"
                  type="number"
                  value={formData.contractValue}
                  onChange={(e) => setFormData({ ...formData, contractValue: Number.parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastContact">آخر تواصل</Label>
                <Input
                  id="lastContact"
                  type="date"
                  value={formData.lastContact}
                  onChange={(e) => setFormData({ ...formData, lastContact: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">{company ? "تحديث" : "إضافة"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
