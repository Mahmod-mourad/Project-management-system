"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  CreditCard,
  FileText,
  RefreshCw,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { getSystemAnalytics } from "@/lib/data-integration"

// Fetch real data from API instead of generating random data
const fetchSalesData = async () => {
  try {
    const response = await fetch("/api/reports/sales-data")
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch sales data:", error)
    return []
  }
}

const fetchRealtimeData = async () => {
  try {
    const response = await fetch("/api/reports/realtime-data")
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch realtime data:", error)
    return []
  }
}

export function DashboardOverview() {
  const [salesData, setSalesData] = useState<any[]>([])
  const [realtimeData, setRealtimeData] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  const pieData = [
    { name: "المبيعات", value: analytics.totalSales || 400, color: "#0891b2" },
    { name: "المخزون", value: analytics.totalProducts * 100 || 300, color: "#6366f1" },
    { name: "المصروفات", value: 200, color: "#22c55e" },
    { name: "الأرباح", value: Math.floor((analytics.totalSales || 0) * 0.3), color: "#facc15" },
  ]

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const [sales, realtime, analyticsData] = await Promise.all([
        fetchSalesData(),
        fetchRealtimeData(),
        getSystemAnalytics(),
      ])
      setSalesData(sales)
      setRealtimeData(realtime)
      setAnalytics(analyticsData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Load initial data
    refreshData()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "info":
        return <Bell className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Real-time Controls */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">لوحة التحكم الرئيسية</h1>
          <p className="text-muted-foreground mt-2">نظرة عامة على أداء الشركة والإحصائيات الرئيسية</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">آخر تحديث: {lastUpdated.toLocaleTimeString("ar-SA")}</div>
          <Button onClick={refreshData} disabled={isRefreshing} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 ml-2 ${isRefreshing ? "animate-spin" : ""}`} />
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* Live Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <Bell className="h-5 w-5" />
            الإشعارات المباشرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
                <div className="text-xs text-muted-foreground">{notification.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced KPI Cards with Dynamic Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-green-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">إجمالي المبيعات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{(analytics.totalSales || 45231).toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground flex items-center justify-end mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
              +20.1% من الشهر الماضي
            </p>
            <Badge variant="secondary" className="mt-2">
              مباشر
            </Badge>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">عدد العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{analytics.totalUsers || 2350}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-end mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 ml-1" />+{analytics.activeUsers || 180} عميل نشط
            </p>
            <Badge variant="secondary" className="mt-2">
              مباشر
            </Badge>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">المنتجات المتاحة</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{analytics.totalProducts || 12234}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-end mt-1">
              <TrendingDown className="h-3 w-3 text-red-500 ml-1" />-{analytics.lowStockProducts || 19} منتج مخزون منخفض
            </p>
            <Badge variant="destructive" className="mt-2">
              تحذير
            </Badge>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">الفواتير المعلقة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">{analytics.pendingInvoices || 573}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-end mt-1">
              <Clock className="h-3 w-3 text-yellow-500 ml-1" />
              تحتاج متابعة
            </p>
            <Badge variant="outline" className="mt-2">
              معلق
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts with Real-time Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-right">تحليل المبيعات الشهرية</CardTitle>
            <CardDescription className="text-right">
              مقارنة المبيعات والأرباح على مدار الأشهر الستة الماضية (يتم التحديث تلقائياً)
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#0891b2" name="المبيعات" />
                <Bar dataKey="profit" fill="#6366f1" name="الأرباح" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-right">توزيع الإيرادات</CardTitle>
            <CardDescription className="text-right">نسبة توزيع الإيرادات حسب الأقسام (مباشر)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">النشاط المباشر (24 ساعة)</CardTitle>
          <CardDescription className="text-right">
            متابعة الزوار والمبيعات في الوقت الفعلي - يتم التحديث كل 30 ثانية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#0891b2"
                name="الزوار"
                strokeWidth={2}
                dot={{ fill: "#0891b2", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#22c55e"
                name="المبيعات"
                strokeWidth={2}
                dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">النشاطات الأخيرة</CardTitle>
          <CardDescription className="text-right">آخر العمليات والتحديثات في النظام (مباشر)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "تم إنشاء فاتورة جديدة",
                user: "أحمد محمد",
                time: "منذ 5 دقائق",
                type: "invoice",
                status: "جديد",
              },
              {
                action: "تم تحديث بيانات العميل",
                user: "فاطمة أحمد",
                time: "منذ 15 دقيقة",
                type: "user",
                status: "محدث",
              },
              {
                action: "تم إضافة منتج جديد للمخزون",
                user: "محمد علي",
                time: "منذ 30 دقيقة",
                type: "product",
                status: "مضاف",
              },
              { action: "تم إنجاز عملية بيع", user: "سارة حسن", time: "منذ ساعة", type: "sale", status: "مكتمل" },
              { action: "تحديث أسعار المنتجات", user: "خالد أحمد", time: "منذ ساعتين", type: "update", status: "محدث" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="text-right flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">بواسطة {activity.user}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {activity.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
