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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface Sale {
  id: string
  customerName: string
  customerEmail: string
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: "completed" | "pending" | "cancelled"
  paymentMethod: "cash" | "card" | "transfer"
  saleDate: string
  salesPerson: string
}

interface SaleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (sale: Omit<Sale, "id">) => void
  sale?: Sale | null
}

const mockProducts = [
  { name: "لابتوب ديل XPS 13", price: 4500 },
  { name: "ماوس لوجيتك", price: 350 },
  { name: "شاشة سامسونج 27 بوصة", price: 1200 },
  { name: "كيبورد ميكانيكي", price: 280 },
]

const salesPersons = ["فاطمة أحمد", "سارة حسن", "محمد علي", "أحمد محمد"]

export function SaleDialog({ isOpen, onClose, onSave, sale }: SaleDialogProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    items: [{ productName: "", quantity: 1, price: 0 }],
    status: "pending" as Sale["status"],
    paymentMethod: "cash" as Sale["paymentMethod"],
    saleDate: new Date().toISOString().split("T")[0],
    salesPerson: "",
  })

  useEffect(() => {
    if (sale) {
      setFormData({
        customerName: sale.customerName,
        customerEmail: sale.customerEmail,
        items: sale.items,
        status: sale.status,
        paymentMethod: sale.paymentMethod,
        saleDate: sale.saleDate,
        salesPerson: sale.salesPerson,
      })
    } else {
      setFormData({
        customerName: "",
        customerEmail: "",
        items: [{ productName: "", quantity: 1, price: 0 }],
        status: "pending",
        paymentMethod: "cash",
        saleDate: new Date().toISOString().split("T")[0],
        salesPerson: "",
      })
    }
  }, [sale, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    onSave({ ...formData, totalAmount })
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-fill price when product is selected
    if (field === "productName") {
      const product = mockProducts.find((p) => p.name === value)
      if (product) {
        newItems[index].price = product.price
      }
    }

    setFormData((prev) => ({ ...prev, items: newItems }))
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productName: "", quantity: 1, price: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }))
    }
  }

  const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">{sale ? "تفاصيل عملية البيع" : "إضافة عملية بيع جديدة"}</DialogTitle>
          <DialogDescription className="text-right">
            {sale ? "عرض وتعديل تفاصيل عملية البيع" : "إضافة عملية بيع جديدة"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-right">بيانات العميل</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customerName" className="text-right">
                      اسم العميل
                    </Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customerEmail" className="text-right">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-right">المنتجات</CardTitle>
                  <Button type="button" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة منتج
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label className="text-right text-xs">المنتج</Label>
                      <Select
                        value={item.productName}
                        onValueChange={(value) => handleItemChange(index, "productName", value)}
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProducts.map((product) => (
                            <SelectItem key={product.name} value={product.name} className="text-right">
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-right text-xs">الكمية</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value) || 1)}
                        className="text-right"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-right text-xs">السعر</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, "price", Number.parseFloat(e.target.value) || 0)}
                        className="text-right"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-right text-xs">المجموع</Label>
                      <div className="text-sm font-medium text-center py-2">
                        {(item.quantity * item.price).toLocaleString()}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="text-right font-bold text-lg">المجموع الكلي: {totalAmount.toLocaleString()} ر.س</div>
              </CardContent>
            </Card>

            {/* Sale Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-right">تفاصيل البيع</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status" className="text-right">
                      الحالة
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value as Sale["status"])}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending" className="text-right">
                          معلقة
                        </SelectItem>
                        <SelectItem value="completed" className="text-right">
                          مكتملة
                        </SelectItem>
                        <SelectItem value="cancelled" className="text-right">
                          ملغية
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentMethod" className="text-right">
                      طريقة الدفع
                    </Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleInputChange("paymentMethod", value as Sale["paymentMethod"])}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash" className="text-right">
                          نقداً
                        </SelectItem>
                        <SelectItem value="card" className="text-right">
                          بطاقة
                        </SelectItem>
                        <SelectItem value="transfer" className="text-right">
                          تحويل
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="saleDate" className="text-right">
                      تاريخ البيع
                    </Label>
                    <Input
                      id="saleDate"
                      type="date"
                      value={formData.saleDate}
                      onChange={(e) => handleInputChange("saleDate", e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="salesPerson" className="text-right">
                      موظف المبيعات
                    </Label>
                    <Select
                      value={formData.salesPerson}
                      onValueChange={(value) => handleInputChange("salesPerson", value)}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر موظف المبيعات" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesPersons.map((person) => (
                          <SelectItem key={person} value={person} className="text-right">
                            {person}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">{sale ? "تحديث" : "حفظ"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
