"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FileText, DollarSign, Calendar, Eye, Edit, Trash2, Download, Send } from "lucide-react"
import { InvoiceDialog } from "./invoice-dialog"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress: string
  issueDate: string
  dueDate: string
  status: "draft" | "sent" | "paid" | "overdue"
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  notes: string
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    clientName: "شركة الحلول التقنية",
    clientEmail: "info@techsolutions.com",
    clientAddress: "الرياض، السعودية",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    status: "paid",
    items: [
      {
        id: "1",
        description: "تطوير موقع إلكتروني",
        quantity: 1,
        unitPrice: 15000,
        total: 15000,
      },
      {
        id: "2",
        description: "صيانة شهرية",
        quantity: 3,
        unitPrice: 2000,
        total: 6000,
      },
    ],
    subtotal: 21000,
    tax: 3150,
    total: 24150,
    notes: "شكراً لتعاملكم معنا",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    clientName: "شركة التجارة العالمية",
    clientEmail: "contact@globaltrading.com",
    clientAddress: "دبي، الإمارات",
    issueDate: "2024-01-20",
    dueDate: "2024-02-20",
    status: "sent",
    items: [
      {
        id: "1",
        description: "استشارات تقنية",
        quantity: 10,
        unitPrice: 500,
        total: 5000,
      },
    ],
    subtotal: 5000,
    tax: 750,
    total: 5750,
    notes: "",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    clientName: "أساتذة البناء",
    clientEmail: "info@constructionmasters.com",
    clientAddress: "القاهرة، مصر",
    issueDate: "2024-01-10",
    dueDate: "2024-01-25",
    status: "overdue",
    items: [
      {
        id: "1",
        description: "نظام إدارة المشاريع",
        quantity: 1,
        unitPrice: 25000,
        total: 25000,
      },
    ],
    subtotal: 25000,
    tax: 3750,
    total: 28750,
    notes: "مطلوب الدفع فوراً",
  },
]

export function InvoicesManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || invoice.clientName.includes(searchTerm),
  )

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0)
  const pendingAmount = invoices.filter((i) => i.status === "sent").reduce((sum, i) => sum + i.total, 0)
  const overdueAmount = invoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.total, 0)

  const handleAddInvoice = () => {
    setEditingInvoice(null)
    setIsDialogOpen(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setIsDialogOpen(true)
  }

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter((i) => i.id !== id))
  }

  const handleSaveInvoice = (invoiceData: Omit<Invoice, "id">) => {
    if (editingInvoice) {
      setInvoices(invoices.map((i) => (i.id === editingInvoice.id ? { ...invoiceData, id: editingInvoice.id } : i)))
    } else {
      const newInvoice: Invoice = {
        ...invoiceData,
        id: Date.now().toString(),
      }
      setInvoices([...invoices, newInvoice])
    }
    setIsDialogOpen(false)
  }

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "مدفوعة"
      case "sent":
        return "مرسلة"
      case "overdue":
        return "متأخرة"
      case "draft":
        return "مسودة"
      default:
        return "غير محدد"
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">إدارة الفواتير</h1>
          <p className="text-slate-600 mt-2">إنشاء وإدارة فواتير العملاء</p>
        </div>
        <Button onClick={handleAddInvoice} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 ml-2" />
          فاتورة جديدة
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-slate-600">{invoices.filter((i) => i.status === "paid").length} مدفوعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات المحصلة</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-600">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبالغ المعلقة</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-slate-600">في انتظار الدفع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتأخرات</CardTitle>
            <div className="h-4 w-4 text-red-600 rounded-full bg-red-100"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-slate-600">تحتاج متابعة</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>إدارة جميع فواتير العملاء</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 space-x-reverse mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="البحث في الفواتير..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الفاتورة</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">تاريخ الإصدار</TableHead>
                  <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.clientName}</div>
                        <div className="text-sm text-slate-600">{invoice.clientEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString("ar-SA")}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString("ar-SA")}</TableCell>
                    <TableCell className="font-medium">{invoice.total.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>{getStatusText(invoice.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditInvoice(invoice)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InvoiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        invoice={editingInvoice}
        onSave={handleSaveInvoice}
      />
    </div>
  )
}
