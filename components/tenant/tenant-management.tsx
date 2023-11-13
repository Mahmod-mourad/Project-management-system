"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Users, Settings, Plus, Edit, Globe, Shield } from "lucide-react"
import { useTenant } from "@/lib/tenant-context"

interface TenantData {
  id: string
  name: string
  subdomain: string
  status: "active" | "suspended" | "cancelled"
  users_count: number
  storage_used: number
  created_at: string
  subscription_plan: string
}

export default function TenantManagement() {
  const { tenant } = useTenant()
  const [tenants] = useState<TenantData[]>([
    {
      id: "1",
      name: "شركة التقنية المتقدمة",
      subdomain: "advanced-tech",
      status: "active",
      users_count: 15,
      storage_used: 45,
      created_at: "2024-01-15",
      subscription_plan: "Enterprise",
    },
    {
      id: "2",
      name: "مؤسسة الأعمال الذكية",
      subdomain: "smart-business",
      status: "active",
      users_count: 8,
      storage_used: 12,
      created_at: "2024-02-20",
      subscription_plan: "Professional",
    },
    {
      id: "3",
      name: "شركة الحلول المبتكرة",
      subdomain: "innovative-solutions",
      status: "suspended",
      users_count: 3,
      storage_used: 2,
      created_at: "2024-03-10",
      subscription_plan: "Starter",
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTenant, setNewTenant] = useState({
    name: "",
    subdomain: "",
    plan: "starter",
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      suspended: "destructive",
      cancelled: "secondary",
    } as const

    const labels = {
      active: "نشط",
      suspended: "معلق",
      cancelled: "ملغي",
    }

    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const handleCreateTenant = () => {
    console.log("[v0] Creating new tenant:", newTenant)
    // In a real app, this would make an API call
    setIsCreateDialogOpen(false)
    setNewTenant({ name: "", subdomain: "", plan: "starter" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة العملاء</h1>
          <p className="text-muted-foreground">إدارة جميع العملاء والمؤسسات المشتركة في النظام</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
              <DialogDescription>أدخل بيانات العميل الجديد لإنشاء حساب منفصل</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tenant-name">اسم الشركة</Label>
                <Input
                  id="tenant-name"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: شركة التقنية الحديثة"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subdomain">النطاق الفرعي</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="subdomain"
                    value={newTenant.subdomain}
                    onChange={(e) => setNewTenant((prev) => ({ ...prev, subdomain: e.target.value }))}
                    placeholder="modern-tech"
                  />
                  <span className="text-sm text-muted-foreground">.erp.com</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan">خطة الاشتراك</Label>
                <Select
                  value={newTenant.plan}
                  onValueChange={(value) => setNewTenant((prev) => ({ ...prev, plan: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter - $49/شهر</SelectItem>
                    <SelectItem value="professional">Professional - $149/شهر</SelectItem>
                    <SelectItem value="enterprise">Enterprise - $499/شهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateTenant}>إنشاء العميل</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="tenants">قائمة العملاء</TabsTrigger>
          <TabsTrigger value="settings">إعدادات النظام</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenants.length}</div>
                <p className="text-xs text-muted-foreground">+2 من الشهر الماضي</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">العملاء النشطون</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenants.filter((t) => t.status === "active").length}</div>
                <p className="text-xs text-muted-foreground">معدل النشاط 67%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenants.reduce((sum, t) => sum + t.users_count, 0)}</div>
                <p className="text-xs text-muted-foreground">عبر جميع العملاء</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">استخدام التخزين</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenants.reduce((sum, t) => sum + t.storage_used, 0)} GB</div>
                <p className="text-xs text-muted-foreground">من إجمالي 1TB</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-4">
          <div className="grid gap-4">
            {tenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <CardDescription>
                        {tenant.subdomain}.erp.com • {tenant.subscription_plan}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(tenant.status)}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">المستخدمون</p>
                      <p className="text-2xl font-bold">{tenant.users_count}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">التخزين المستخدم</p>
                      <p className="text-2xl font-bold">{tenant.storage_used} GB</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">تاريخ الإنشاء</p>
                      <p className="text-sm text-muted-foreground">{tenant.created_at}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النظام العامة</CardTitle>
              <CardDescription>إعدادات تؤثر على جميع العملاء في النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>الحد الأقصى للمستخدمين لكل عميل</Label>
                  <Input type="number" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label>الحد الأقصى للتخزين (GB)</Label>
                  <Input type="number" defaultValue="1000" />
                </div>
                <div className="space-y-2">
                  <Label>فترة التجربة المجانية (أيام)</Label>
                  <Input type="number" defaultValue="14" />
                </div>
                <div className="space-y-2">
                  <Label>عملة الفواتير الافتراضية</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="eur">يورو (EUR)</SelectItem>
                      <SelectItem value="sar">ريال سعودي (SAR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>حفظ الإعدادات</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
