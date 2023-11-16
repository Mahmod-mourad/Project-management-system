"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { User, Mail, Phone, MapPin, Calendar, Shield, Bell, Lock, Camera, Save, Edit } from "lucide-react"

export function ProfileManagement() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "أحمد محمد علي",
    email: "admin@company.com",
    phone: "+966501234567",
    position: "مدير النظام",
    department: "تقنية المعلومات",
    address: "الرياض، المملكة العربية السعودية",
    joinDate: "2023-01-15",
    bio: "مدير نظم معلومات مع خبرة 10 سنوات في إدارة الأنظمة المؤسسية",
    avatar: "/professional-avatar.png",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    reports: true,
  })

  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: "30",
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to backend
    console.log("[v0] Profile saved:", profile)
  }

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
  }

  const handleSecurityChange = (field: string, value: string | boolean) => {
    setSecurity((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">الملف الشخصي</h1>
          <p className="text-slate-600">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
        </div>
        <Button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isEditing ? (
            <>
              <Save className="ml-2 h-4 w-4" />
              حفظ التغييرات
            </>
          ) : (
            <>
              <Edit className="ml-2 h-4 w-4" />
              تعديل الملف
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto w-24 h-24">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="text-lg">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0" variant="secondary">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardTitle className="text-xl">{profile.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <Badge variant="secondary">{profile.position}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-slate-500" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-slate-500" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span>{profile.address}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>انضم في {new Date(profile.joinDate).toLocaleDateString("ar-SA")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">المعلومات الشخصية</TabsTrigger>
              <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
              <TabsTrigger value="security">الأمان</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">المنصب</Label>
                    <Input
                      id="position"
                      value={profile.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">القسم</Label>
                    <Input
                      id="department"
                      value={profile.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">نبذة شخصية</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  إعدادات الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-slate-600">تلقي الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الإشعارات الفورية</Label>
                    <p className="text-sm text-slate-600">تلقي الإشعارات الفورية في المتصفح</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>رسائل SMS</Label>
                    <p className="text-sm text-slate-600">تلقي الإشعارات عبر الرسائل النصية</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تقارير دورية</Label>
                    <p className="text-sm text-slate-600">تلقي التقارير الدورية والإحصائيات</p>
                  </div>
                  <Switch
                    checked={notifications.reports}
                    onCheckedChange={(checked) => handleNotificationChange("reports", checked)}
                  />
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  إعدادات الأمان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>المصادقة الثنائية</Label>
                    <p className="text-sm text-slate-600">تفعيل المصادقة الثنائية لحماية إضافية</p>
                  </div>
                  <Switch
                    checked={security.twoFactor}
                    onCheckedChange={(checked) => handleSecurityChange("twoFactor", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تنبيهات تسجيل الدخول</Label>
                    <p className="text-sm text-slate-600">تلقي تنبيه عند تسجيل دخول جديد</p>
                  </div>
                  <Switch
                    checked={security.loginAlerts}
                    onCheckedChange={(checked) => handleSecurityChange("loginAlerts", checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">مهلة انتهاء الجلسة (بالدقائق)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => handleSecurityChange("sessionTimeout", e.target.value)}
                    className="w-32"
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Label>تغيير كلمة المرور</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Lock className="ml-2 h-4 w-4" />
                    تحديث كلمة المرور
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
