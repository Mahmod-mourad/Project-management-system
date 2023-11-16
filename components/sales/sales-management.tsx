"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Eye, CreditCard, TrendingUp, ShoppingCart, DollarSign } from "lucide-react"
import { SaleDialog } from "./sale-dialog"

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

const mockSales: Sale[] = [
  {
    id: "1",
    customerName: "عبدالله أحمد",
    customerEmail: "abdullah@email.com",
    items: [
      { productName: "لابتوب ديل XPS 13", quantity: 1, price: 4500 },
      { productName: "ماوس لوجيتك", quantity: 1, price: 350 },
    ],
    totalAmount: 4850,
    status: "completed",
    paymentMethod: "card",
    saleDate: "2024-01-15",
    salesPerson: "فاطمة أحمد",
  },
  {
    id: "2",
    customerName: "مريم محمد",
    customerEmail: "mariam@email.com",
    items: [{ productName: "شاشة سامسونج 27 بوصة", quantity: 2, price: 1200 }],
    totalAmount: 2400,
    status: "pending",
    paymentMethod: "transfer",
    saleDate: "2024-01-14",
    salesPerson: "سارة حسن",
  },
  {
    id: "3",
    customerName: "خالد علي",
    customerEmail: "khalid@email.com",
    items: [
      { productName: "كيبورد ميكانيكي", quantity: 3, price: 280 },
      { productName: "ماوس لوجيتك", quantity: 2, price: 350 },
    ],
    totalAmount: 1540,
    status: "completed",
    paymentMethod: "cash",
    saleDate: "2024-01-13",
    salesPerson: "محمد علي",
  },
]

export function SalesManagement() {
  const [sales, setSales] = useState<Sale[]>(mockSales)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const filteredSales = sales.filter(
    (sale) =>
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.salesPerson.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalRevenue = sales
    .filter((sale) => sale.status === "completed")
    .reduce((sum, sale) => sum + sale.totalAmount, 0)
  const pendingSales = sales.filter((sale) => sale.status === "pending").length
  const completedSales = sales.filter((sale) => sale.status === "completed").length

  const handleAddSale = () => {
    setSelectedSale(null)
    setIsDialogOpen(true)
  }

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale)
    setIsDialogOpen(true)
  }

  const handleSaveSale = (saleData: Omit<Sale, "id">) => {
    if (selectedSale) {
      setSales(sales.map((sale) => (sale.id === selectedSale.id ? { ...saleData, id: selectedSale.id } : sale)))
    } else {
      const newSale: Sale = {
        ...saleData,
        id: Date.now().toString(),
      }
      setSales([...sales, newSale])
    }
    setIsDialogOpen(false)
  }

  const getStatusBadge = (status: Sale["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">مكتملة</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">معلقة</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">ملغية</Badge>
    }
  }

  const getPaymentMethodText = (method: Sale["paymentMethod"]) => {
    switch (method) {
      case "cash":
        return "نقداً"
      case "card":
        return "بطاقة"
      case "transfer":
        return "تحويل"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">إدارة المبيعات</h1>
          <p className="text-muted-foreground mt-2">إدارة ومتابعة عمليات البيع</p>
        </div>
        <Button onClick={handleAddSale} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة عملية بيع جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{totalRevenue.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">المبيعات المكتملة</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{completedSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">المبيعات المعلقة</CardTitle>
            <ShoppingCart className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{pendingSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">إجمالي المبيعات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{sales.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-right">قائمة المبيعات</CardTitle>
            <div className="relative w-72">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في المبيعات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
          </div>
          <CardDescription className="text-right">إدارة وعرض جميع عمليات البيع</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">طريقة الدفع</TableHead>
                <TableHead className="text-right">تاريخ البيع</TableHead>
                <TableHead className="text-right">موظف المبيعات</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{sale.customerName}</div>
                      <div className="text-sm text-muted-foreground">{sale.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{sale.totalAmount.toLocaleString()} ر.س</TableCell>
                  <TableCell className="text-right">{getStatusBadge(sale.status)}</TableCell>
                  <TableCell className="text-right">{getPaymentMethodText(sale.paymentMethod)}</TableCell>
                  <TableCell className="text-right">{new Date(sale.saleDate).toLocaleDateString("ar-SA")}</TableCell>
                  <TableCell className="text-right">{sale.salesPerson}</TableCell>
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
                        <DropdownMenuItem className="text-right" onClick={() => handleViewSale(sale)}>
                          <Eye className="ml-2 h-4 w-4" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-right" onClick={() => handleViewSale(sale)}>
                          <Edit className="ml-2 h-4 w-4" />
                          تعديل
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

      {/* Sale Dialog */}
      <SaleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveSale}
        sale={selectedSale}
      />
    </div>
  )
}
