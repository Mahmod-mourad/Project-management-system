"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { PDFExportDialog } from "@/components/ui/pdf-export-dialog" // Added PDF export dialog import
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { Download, FileText, TrendingUp, Users, Package, CreditCard } from "lucide-react"
import type { DateRange } from "react-day-picker"

// Mock data for reports
const salesReportData = [
  { month: "يناير", sales: 45000, profit: 12000, orders: 120 },
  { month: "فبراير", sales: 52000, profit: 15000, orders: 140 },
  { month: "مارس", sales: 48000, profit: 13500, orders: 135 },
  { month: "أبريل", sales: 61000, profit: 18000, orders: 165 },
  { month: "مايو", sales: 55000, profit: 16500, orders: 150 },
  { month: "يونيو", sales: 67000, profit: 20000, orders: 180 },
]

const inventoryReportData = [
  { category: "أجهزة كمبيوتر", value: 125000, percentage: 35 },
  { category: "ملحقات", value: 85000, percentage: 24 },
  { category: "شاشات", value: 95000, percentage: 27 },
  { category: "طابعات", value: 50000, percentage: 14 },
]

const userActivityData = [
  { day: "السبت", logins: 45, activeUsers: 38 },
  { day: "الأحد", logins: 52, activeUsers: 42 },
  { day: "الاثنين", logins: 48, activeUsers: 40 },
  { day: "الثلاثاء", logins: 61, activeUsers: 48 },
  { day: "الأربعاء", logins: 55, activeUsers: 45 },
  { day: "الخميس", logins: 67, activeUsers: 52 },
  { day: "الجمعة", logins: 43, activeUsers: 35 },
]

const topProductsData = [
  { name: "لابتوب ديل XPS 13", sales: 25, revenue: 112500 },
  { name: "شاشة سامسونج 27 بوصة", sales: 18, revenue: 21600 },
  { name: "كيبورد ميكانيكي", sales: 45, revenue: 12600 },
  { name: "ماوس لوجيتك", sales: 32, revenue: 11200 },
]

const COLORS = ["#0891b2", "#6366f1", "#22c55e", "#facc15", "#ef4444"]

export function ReportsManagement() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [reportPeriod, setReportPeriod] = useState("monthly")
  const [exportDialog, setExportDialog] = useState({ open: false, title: "", data: [] as any[] })

  const handleExportReport = (reportType: string, title: string, data: any[]) => {
    console.log(`[v0] Opening export dialog for ${reportType}`)
    setExportDialog({ open: true, title, data })
  }

  const handlePDFExport = (options: any) => {
    console.log("[v0] Exporting PDF with options:", options)
    // Here you would implement actual PDF generation
    // For now, we'll simulate the export
    setTimeout(() => {
      alert(`تم تصدير ${options.title} بنجاح!`)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">التقارير والتحليلات</h1>
          <p className="text-muted-foreground mt-2">تقارير شاملة وتحليلات مفصلة لأداء الشركة</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">إجمالي المبيعات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">328,000 ر.س</div>
            <p className="text-xs text-muted-foreground flex items-center justify-end mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
              +12.5% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">عدد الطلبات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">890</div>
            <p className="text-xs text-muted-foreground flex items-center justify-end mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
              +8.2% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">العملاء النشطين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">1,234</div>
            <p className="text-xs text-muted-foreground flex items-center justify-end mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
              +15.3% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">قيمة المخزون</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">455,000 ر.س</div>
            <p className="text-xs text-muted-foreground flex items-center justify-end mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
              +3.1% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">تقارير المبيعات</TabsTrigger>
          <TabsTrigger value="inventory">تقارير المخزون</TabsTrigger>
          <TabsTrigger value="users">تقارير المستخدمين</TabsTrigger>
          <TabsTrigger value="financial">التقارير المالية</TabsTrigger>
        </TabsList>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="text-right">
                  <CardTitle>تطور المبيعات الشهرية</CardTitle>
                  <CardDescription>مقارنة المبيعات والأرباح على مدار الأشهر</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleExportReport("sales-trend", "تطور المبيعات الشهرية", salesReportData)}
                >
                  <Download className="h-4 w-4 ml-1" />
                  تصدير
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesReportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stackId="1" stroke="#0891b2" fill="#0891b2" />
                    <Area type="monotone" dataKey="profit" stackId="1" stroke="#6366f1" fill="#6366f1" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="text-right">
                  <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
                  <CardDescription>المنتجات الأكثر مبيعاً والإيرادات</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleExportReport("top-products", "أفضل المنتجات مبيعاً", topProductsData)}
                >
                  <Download className="h-4 w-4 ml-1" />
                  تصدير
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProductsData.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="text-right flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} وحدة مباعة</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold">{product.revenue.toLocaleString()} ر.س</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="text-right">
                <CardTitle>تحليل الطلبات الشهرية</CardTitle>
                <CardDescription>عدد الطلبات والمبيعات على مدار الأشهر</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => handleExportReport("orders-analysis", "تحليل الطلبات الشهرية", salesReportData)}
              >
                <Download className="h-4 w-4 ml-1" />
                تصدير
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesReportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#0891b2" name="عدد الطلبات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Reports */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="text-right">
                  <CardTitle>توزيع قيمة المخزون</CardTitle>
                  <CardDescription>توزيع قيمة المخزون حسب الفئات</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleExportReport("inventory-distribution", "توزيع قيمة المخزون", inventoryReportData)
                  }
                >
                  <Download className="h-4 w-4 ml-1" />
                  تصدير
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={inventoryReportData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inventoryReportData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="text-right">
                  <CardTitle>تفاصيل المخزون بالفئات</CardTitle>
                  <CardDescription>قيمة المخزون لكل فئة</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleExportReport("inventory-details", "تفاصيل المخزون بالفئات", inventoryReportData)}
                >
                  <Download className="h-4 w-4 ml-1" />
                  تصدير
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryReportData.map((category, index) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm font-bold">{category.value.toLocaleString()} ر.س</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Reports */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="text-right">
                  <CardTitle>نشاط المستخدمين الأسبوعي</CardTitle>
                  <CardDescription>تسجيلات الدخول والمستخدمين النشطين</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleExportReport("user-activity", "نشاط المستخدمين الأسبوعي", userActivityData)}
                >
                  <Download className="h-4 w-4 ml-1" />
                  تصدير
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="logins" stroke="#0891b2" name="تسجيلات الدخول" />
                    <Line type="monotone" dataKey="activeUsers" stroke="#6366f1" name="المستخدمين النشطين" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="text-right">
                  <CardTitle>إحصائيات المستخدمين</CardTitle>
                  <CardDescription>ملخص نشاط المستخدمين</CardDescription>
                </div>
                <Button size="sm" onClick={() => handleExportReport("user-stats", "إحصائيات المستخدمين", [])}>
                  <Download className="h-4 w-4 ml-1" />
                  تصدير
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="text-right">
                      <p className="font-medium">إجمالي المستخدمين</p>
                      <p className="text-sm text-muted-foreground">جميع المستخدمين المسجلين</p>
                    </div>
                    <div className="text-2xl font-bold">156</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="text-right">
                      <p className="font-medium">المستخدمين النشطين</p>
                      <p className="text-sm text-muted-foreground">نشطين خلال آخر 30 يوم</p>
                    </div>
                    <div className="text-2xl font-bold">142</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="text-right">
                      <p className="font-medium">مستخدمين جدد</p>
                      <p className="text-sm text-muted-foreground">انضموا هذا الشهر</p>
                    </div>
                    <div className="text-2xl font-bold">23</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="text-right">
                  <CardTitle>الأرباح والخسائر</CardTitle>
                  <CardDescription>تحليل الأرباح والخسائر الشهرية</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleExportReport("profit-loss", "الأرباح والخسائر", salesReportData)}
                >
                  <Download className="h-4 w-4 ml-1" />
                  تصدير
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesReportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="profit" fill="#22c55e" name="الأرباح" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="text-right">
                  <CardTitle>الملخص المالي</CardTitle>
                  <CardDescription>ملخص الوضع المالي الحالي</CardDescription>
                </div>
                <Button size="sm" onClick={() => handleExportReport("financial-summary", "الملخص المالي", [])}>
                  <Download className="h-4 w-4 ml-1" />
                  تصدير
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="text-right">
                      <p className="font-medium text-green-800">إجمالي الإيرادات</p>
                      <p className="text-sm text-green-600">هذا الشهر</p>
                    </div>
                    <div className="text-2xl font-bold text-green-800">328,000 ر.س</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="text-right">
                      <p className="font-medium text-blue-800">إجمالي الأرباح</p>
                      <p className="text-sm text-blue-600">هذا الشهر</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-800">95,000 ر.س</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="text-right">
                      <p className="font-medium text-yellow-800">المصروفات</p>
                      <p className="text-sm text-yellow-600">هذا الشهر</p>
                    </div>
                    <div className="text-2xl font-bold text-yellow-800">233,000 ر.س</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="text-right">
                      <p className="font-medium text-purple-800">هامش الربح</p>
                      <p className="text-sm text-purple-600">النسبة المئوية</p>
                    </div>
                    <div className="text-2xl font-bold text-purple-800">29%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <PDFExportDialog
        open={exportDialog.open}
        onOpenChange={(open) => setExportDialog((prev) => ({ ...prev, open }))}
        title={exportDialog.title}
        data={exportDialog.data}
        onExport={handlePDFExport}
      />
    </div>
  )
}
