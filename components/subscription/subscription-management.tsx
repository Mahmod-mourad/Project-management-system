"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Users, HardDrive, FileText, Headphones, Zap, Crown, Star } from "lucide-react"
import { useTenant } from "@/lib/tenant-context"

interface PlanFeature {
  name: string
  included: boolean
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  billing_cycle: "monthly" | "yearly"
  max_users: number | null
  max_storage_gb: number
  features: PlanFeature[]
  popular?: boolean
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    currency: "USD",
    billing_cycle: "monthly",
    max_users: 5,
    max_storage_gb: 10,
    features: [
      { name: "إدارة العملاء الأساسية", included: true },
      { name: "إدارة المبيعات", included: true },
      { name: "1,000 فاتورة شهرياً", included: true },
      { name: "الدعم عبر البريد الإلكتروني", included: true },
      { name: "إدارة المخزون", included: false },
      { name: "التقارير المتقدمة", included: false },
      { name: "إدارة الموارد البشرية", included: false },
      { name: "واجهة برمجة التطبيقات", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 149,
    currency: "USD",
    billing_cycle: "monthly",
    max_users: 25,
    max_storage_gb: 50,
    popular: true,
    features: [
      { name: "إدارة العملاء الأساسية", included: true },
      { name: "إدارة المبيعات", included: true },
      { name: "10,000 فاتورة شهرياً", included: true },
      { name: "الدعم ذو الأولوية", included: true },
      { name: "إدارة المخزون", included: true },
      { name: "التقارير المتقدمة", included: true },
      { name: "إدارة الموارد البشرية", included: false },
      { name: "واجهة برمجة التطبيقات", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    currency: "USD",
    billing_cycle: "monthly",
    max_users: null,
    max_storage_gb: 500,
    features: [
      { name: "إدارة العملاء الأساسية", included: true },
      { name: "إدارة المبيعات", included: true },
      { name: "فواتير غير محدودة", included: true },
      { name: "الدعم المخصص", included: true },
      { name: "إدارة المخزون", included: true },
      { name: "التقارير المتقدمة", included: true },
      { name: "إدارة الموارد البشرية", included: true },
      { name: "واجهة برمجة التطبيقات", included: true },
    ],
  },
]

export default function SubscriptionManagement() {
  const { tenant, subscription } = useTenant()
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const currentPlan = subscriptionPlans.find(
    (plan) => plan.name.toLowerCase() === subscription?.plan.name.toLowerCase(),
  )

  const getUsagePercentage = (used: number, limit: number | null) => {
    if (limit === null) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "starter":
        return <Zap className="h-5 w-5" />
      case "professional":
        return <Star className="h-5 w-5" />
      case "enterprise":
        return <Crown className="h-5 w-5" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  const handleUpgrade = (planId: string) => {
    console.log("[v0] Upgrading to plan:", planId)
    setSelectedPlan(planId)
    setIsUpgradeDialogOpen(true)
  }

  const confirmUpgrade = () => {
    console.log("[v0] Confirming upgrade to:", selectedPlan)
    // In a real app, this would process the upgrade
    setIsUpgradeDialogOpen(false)
    setSelectedPlan(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة الاشتراك</h1>
        <p className="text-muted-foreground">إدارة خطة الاشتراك والاستخدام</p>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">الاشتراك الحالي</TabsTrigger>
          <TabsTrigger value="plans">الخطط المتاحة</TabsTrigger>
          <TabsTrigger value="usage">الاستخدام</TabsTrigger>
          <TabsTrigger value="billing">الفواتير</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {subscription && currentPlan && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPlanIcon(currentPlan.name)}
                    <div>
                      <CardTitle className="text-xl">خطة {currentPlan.name}</CardTitle>
                      <CardDescription>
                        ${currentPlan.price}/شهر • {subscription.status === "trial" ? "فترة تجريبية" : "نشط"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                      {subscription.status === "active" ? "نشط" : subscription.status === "trial" ? "تجريبي" : "منتهي"}
                    </Badge>
                    {currentPlan.popular && <Badge variant="secondary">الأكثر شعبية</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">المستخدمون</span>
                      <span className="text-sm text-muted-foreground">15 / {currentPlan.max_users || "∞"}</span>
                    </div>
                    <Progress value={getUsagePercentage(15, currentPlan.max_users)} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">التخزين</span>
                      <span className="text-sm text-muted-foreground">45 GB / {currentPlan.max_storage_gb} GB</span>
                    </div>
                    <Progress value={getUsagePercentage(45, currentPlan.max_storage_gb)} className="h-2" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">الميزات المتاحة:</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {currentPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle
                          className={`h-4 w-4 ${feature.included ? "text-green-500" : "text-muted-foreground"}`}
                        />
                        <span className={`text-sm ${!feature.included ? "text-muted-foreground line-through" : ""}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleUpgrade("professional")}>ترقية الخطة</Button>
                  <Button variant="outline">إدارة الدفع</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? "border-primary" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">الأكثر شعبية</Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">{getPlanIcon(plan.name)}</div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">${plan.price}</div>
                    <div className="text-sm text-muted-foreground">/شهر</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{plan.max_users || "غير محدود"} مستخدم</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      <span>{plan.max_storage_gb} GB تخزين</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle
                          className={`h-4 w-4 ${feature.included ? "text-green-500" : "text-muted-foreground"}`}
                        />
                        <span className={!feature.included ? "text-muted-foreground line-through" : ""}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={subscription?.plan.name.toLowerCase() === plan.name.toLowerCase()}
                  >
                    {subscription?.plan.name.toLowerCase() === plan.name.toLowerCase()
                      ? "الخطة الحالية"
                      : "اختيار الخطة"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <Progress value={60} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">من أصل {subscription?.plan.max_users || "∞"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التخزين المستخدم</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45 GB</div>
                <Progress value={9} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">من أصل {subscription?.plan.max_storage_gb} GB</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الفواتير هذا الشهر</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,250</div>
                <Progress value={12.5} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">فواتير غير محدودة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">طلبات الدعم</CardTitle>
                <Headphones className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-1">هذا الشهر</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تاريخ الفواتير</CardTitle>
              <CardDescription>آخر الفواتير والمدفوعات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "2024-03-01", amount: 499, status: "paid", period: "مارس 2024" },
                  { date: "2024-02-01", amount: 499, status: "paid", period: "فبراير 2024" },
                  { date: "2024-01-01", amount: 499, status: "paid", period: "يناير 2024" },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">فاتورة {invoice.period}</p>
                      <p className="text-sm text-muted-foreground">{invoice.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">${invoice.amount}</span>
                      <Badge variant="default">مدفوع</Badge>
                      <Button variant="outline" size="sm">
                        تحميل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ترقية الاشتراك</DialogTitle>
            <DialogDescription>هل أنت متأكد من رغبتك في ترقية اشتراكك؟</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">سيتم تطبيق التغييرات فوراً وستتم محاسبتك بالسعر الجديد في الدورة القادمة.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={confirmUpgrade}>تأكيد الترقية</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
