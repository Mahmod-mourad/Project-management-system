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
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { ProductDialog } from "./product-dialog"

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

const mockProducts: Product[] = [
  {
    id: "1",
    name: "لابتوب ديل XPS 13",
    sku: "DELL-XPS-13-001",
    category: "أجهزة كمبيوتر",
    quantity: 25,
    minStock: 10,
    price: 4500,
    cost: 3200,
    supplier: "شركة التقنية المتقدمة",
    status: "in-stock",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "ماوس لوجيتك MX Master 3",
    sku: "LOG-MX-M3-001",
    category: "ملحقات",
    quantity: 5,
    minStock: 15,
    price: 350,
    cost: 250,
    supplier: "متجر الإلكترونيات",
    status: "low-stock",
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    name: "شاشة سامسونج 27 بوصة",
    sku: "SAM-MON-27-001",
    category: "شاشات",
    quantity: 0,
    minStock: 8,
    price: 1200,
    cost: 900,
    supplier: "شركة الشاشات المحدودة",
    status: "out-of-stock",
    lastUpdated: "2024-01-13",
  },
  {
    id: "4",
    name: "كيبورد ميكانيكي",
    sku: "MECH-KB-001",
    category: "ملحقات",
    quantity: 45,
    minStock: 20,
    price: 280,
    cost: 180,
    supplier: "متجر الإلكترونيات",
    status: "in-stock",
    lastUpdated: "2024-01-12",
  },
]

export function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalValue = products.reduce((sum, product) => sum + product.quantity * product.cost, 0)
  const lowStockCount = products.filter((product) => product.status === "low-stock").length
  const outOfStockCount = products.filter((product) => product.status === "out-of-stock").length

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((product) => product.id !== productId))
  }

  const handleSaveProduct = (productData: Omit<Product, "id" | "status" | "lastUpdated">) => {
    const status: Product["status"] =
      productData.quantity === 0
        ? "out-of-stock"
        : productData.quantity <= productData.minStock
          ? "low-stock"
          : "in-stock"

    if (selectedProduct) {
      setProducts(
        products.map((product) =>
          product.id === selectedProduct.id
            ? { ...productData, id: selectedProduct.id, status, lastUpdated: new Date().toISOString().split("T")[0] }
            : product,
        ),
      )
    } else {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        status,
        lastUpdated: new Date().toISOString().split("T")[0],
      }
      setProducts([...products, newProduct])
    }
    setIsDialogOpen(false)
  }

  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-100 text-green-800">متوفر</Badge>
      case "low-stock":
        return <Badge className="bg-yellow-100 text-yellow-800">مخزون منخفض</Badge>
      case "out-of-stock":
        return <Badge className="bg-red-100 text-red-800">نفد المخزون</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">إدارة المخزون</h1>
          <p className="text-muted-foreground mt-2">إدارة المنتجات والمخزون</p>
        </div>
        <Button onClick={handleAddProduct} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة منتج جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">قيمة المخزون</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{totalValue.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">مخزون منخفض</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{lowStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">نفد المخزون</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{outOfStockCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-right">قائمة المنتجات</CardTitle>
            <div className="relative w-72">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث عن المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
          </div>
          <CardDescription className="text-right">إدارة وعرض جميع المنتجات في المخزون</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم المنتج</TableHead>
                <TableHead className="text-right">رمز المنتج</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">الحد الأدنى</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="text-right font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{product.sku}</TableCell>
                  <TableCell className="text-right">{product.category}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell className="text-right">{product.minStock}</TableCell>
                  <TableCell className="text-right">{product.price.toLocaleString()} ر.س</TableCell>
                  <TableCell className="text-right">{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-right">{product.supplier}</TableCell>
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
                        <DropdownMenuItem className="text-right" onClick={() => handleEditProduct(product)}>
                          <Edit className="ml-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-right text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
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

      {/* Product Dialog */}
      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
      />
    </div>
  )
}
