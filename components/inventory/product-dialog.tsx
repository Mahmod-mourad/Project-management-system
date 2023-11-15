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

interface Product {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  minStock: number
  price: number
  cost: number
  supplier: string
  status: "in-stock" | "low-stock" | "out-of-stock"
  lastUpdated: string
}

interface ProductDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Omit<Product, "id" | "status" | "lastUpdated">) => void
  product?: Product | null
}

const categories = ["أجهزة كمبيوتر", "ملحقات", "شاشات", "طابعات", "شبكات", "برمجيات", "أخرى"]

const suppliers = [
  "شركة التقنية المتقدمة",
  "متجر الإلكترونيات",
  "شركة الشاشات المحدودة",
  "مورد الأجهزة الذكية",
  "شركة البرمجيات",
]

export function ProductDialog({ isOpen, onClose, onSave, product }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    minStock: 0,
    price: 0,
    cost: 0,
    supplier: "",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        quantity: product.quantity,
        minStock: product.minStock,
        price: product.price,
        cost: product.cost,
        supplier: product.supplier,
      })
    } else {
      setFormData({
        name: "",
        sku: "",
        category: "",
        quantity: 0,
        minStock: 0,
        price: 0,
        cost: 0,
        supplier: "",
      })
    }
  }, [product, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">{product ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
          <DialogDescription className="text-right">
            {product ? "تعديل بيانات المنتج الحالي" : "إضافة منتج جديد إلى المخزون"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-right">
                  اسم المنتج
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
                <Label htmlFor="sku" className="text-right">
                  رمز المنتج
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  className="text-right"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-right">
                الفئة
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-right">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="text-right">
                  الكمية الحالية
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", Number.parseInt(e.target.value) || 0)}
                  className="text-right"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minStock" className="text-right">
                  الحد الأدنى للمخزون
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => handleInputChange("minStock", Number.parseInt(e.target.value) || 0)}
                  className="text-right"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-right">
                  سعر البيع (ر.س)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                  className="text-right"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost" className="text-right">
                  التكلفة (ر.س)
                </Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", Number.parseFloat(e.target.value) || 0)}
                  className="text-right"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplier" className="text-right">
                المورد
              </Label>
              <Select value={formData.supplier} onValueChange={(value) => handleInputChange("supplier", value)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر المورد" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier} className="text-right">
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">{product ? "تحديث" : "إضافة"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
