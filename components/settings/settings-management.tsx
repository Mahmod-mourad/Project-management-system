"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Building, Bell, Save } from "lucide-react"

export function SettingsManagement() {
  const [companySettings, setCompanySettings] = useState({
    name: "شركة الحلول المتقدمة",
    nameEn: "Advanced Solutions Company",
    email: "info@advancedsolutions.com",
    phone: "+966 11 123 4567",
    address: "الرياض، المملكة العربية السعودية",
    website: "www.advancedsolutions.com",
    taxNumber: "123456789012345",
    commercialRegister: "1010123456",
    logo: "",
  })

  const [userSettings, setUserSettings] = useState({
    name: "أحمد محمد",
    email: "admin@company.com",
    phone: "+966 50 123 4567",
    role: "مدير النظام",
    language: "ar",
    timezone: "Asia/Riyadh",
    theme: "light",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    salesAlerts: true,
    inventoryAlerts: true,
    hrAlerts: false,
    systemUpdates: true,
  })

  const [systemSettings, setSystemSettings] = useState({
    currency: "SAR",
    dateFormat: "dd/mm/yyyy",
    timeFormat: "24h",
    fiscalYearStart: "01-01",
    backupFrequency: "daily",
    sessionTimeout: "30",
    maxLoginAttempts: "5",
  })

  const handleSaveCompanySettings = () => {
    // Save company settings logic
    console.log("Company settings saved:", companySettings)
  }

  const handleSaveUserSettings = () => {
    // Save user settings logic
    console.log("User settings saved:", userSettings)
  }

  const handleSaveNotifications = () => {
    // Save notification settings logic
    console.log("Notification settings saved:", notifications)
  }

  const handleSaveSystemSettings = () => {
    // Save system settings logic
    console.log("System settings saved:", systemSettings)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">إعدادات النظام</h1>
          <p className="text-slate-600 mt-2">إدارة إعدادات النظام والشركة</p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            الشركة
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            المستخدم
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            النظام
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                معلومات الشركة
              </CardTitle>
              <CardDescription>إدارة المعلومات الأساسية للشركة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">اسم الشركة (عربي)</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyNameEn">اسم الشركة (إنجليزي)</Label>
                  <Input
                    id="companyNameEn"
                    value={companySettings.nameEn}
                    onChange={(e) => setCompanySettings({ ...companySettings, nameEn: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">رقم الهاتف</Label>
                  <Input
                    id="companyPhone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">العنوان</Label>
                <Textarea
                  id="companyAddress"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input
                    id="taxNumber"
                    value={companySettings.taxNumber}
                    onChange={(e) => setCompanySettings({ ...companySettings, taxNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercialRegister">رقم السجل التجاري</Label>
                <Input
                  id="commercialRegister"
                  value={companySettings.commercialRegister}
                  onChange={(e) => setCompanySettings({ ...companySettings, commercialRegister: e.target.value })}
                />
              </div>

              <Separator />

              <Button onClick={handleSaveCompanySettings} className="w-full">
                <Save className="w-4 h-4 ml-2" />
                حفظ إعدادات الشركة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Settings */}
        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                إعدادات المستخدم
              </CardTitle>
              <CardDescription>إدارة معلومات الحساب الشخصي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">الاسم الكامل</Label>
                  <Input
                    id="userName"
                    value={userSettings.name}
                    onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">البريد الإلكتروني</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userPhone">رقم الهاتف</Label>
                  <Input
                    id="userPhone"
                    value={userSettings.phone}
                    onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userRole">الدور</Label>
                  <Input id="userRole" value={userSettings.role} disabled />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">التفضيلات</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">اللغة</Label>
                    <Select
                      value={userSettings.language}
                      onValueChange={(value) => setUserSettings({ ...userSettings, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">المنطقة الزمنية</Label>
                    <Select
                      value={userSettings.timezone}
                      onValueChange={(value) => setUserSettings({ ...userSettings, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Riyadh">الرياض</SelectItem>
                        <SelectItem value="Asia/Dubai">دبي</SelectItem>
                        <SelectItem value="Africa/Cairo">القاهرة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">المظهر</Label>
                  <Select
                    value={userSettings.theme}
                    onValueChange={(value) => setUserSettings({ ...userSettings, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">فاتح</SelectItem>
                      <SelectItem value="dark">داكن</SelectItem>
                      <SelectItem value="system">تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <Button onClick={handleSaveUserSettings} className="w-full">
                <Save className="w-4 h-4 ml-2" />
                حفظ إعدادات المستخدم
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                إعدادات الإشعارات
              </CardTitle>
              <CardDescription>إدارة تفضيلات الإشعارات والتنبيهات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">طرق الإشعار</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">إشعارات البريد الإلكتروني</Label>
                      <p className="text-sm text-slate-600">تلقي الإشعارات عبر البريد الإلكتروني</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">إشعارات الرسائل النصية</Label>
                      <p className="text-sm text-slate-600">تلقي الإشعارات عبر الرسائل النصية</p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">الإشعارات الفورية</Label>
                      <p className="text-sm text-slate-600">تلقي الإشعارات الفورية في المتصفح</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">أنواع الإشعارات</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">تنبيهات المبيعات</Label>
                      <p className="text-sm text-slate-600">إشعارات عند إتمام عمليات البيع</p>
                    </div>
                    <Switch
                      checked={notifications.salesAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, salesAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">تنبيهات المخزون</Label>
                      <p className="text-sm text-slate-600">إشعارات عند نفاد المخزون</p>
                    </div>
                    <Switch
                      checked={notifications.inventoryAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, inventoryAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">تنبيهات الموارد البشرية</Label>
                      <p className="text-sm text-slate-600">إشعارات متعلقة بالموظفين</p>
                    </div>
                    <Switch
                      checked={notifications.hrAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, hrAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">تحديثات النظام</Label>
                      <p className="text-sm text-slate-600">إشعارات عند توفر تحديثات جديدة</p>
                    </div>
                    <Switch
                      checked={notifications.systemUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <Button onClick={handleSaveNotifications} className="w-full">
                <Save className="w-4 h-4 ml-2" />
                حفظ إعدادات الإشعارات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                إعدادات النظام
              </CardTitle>
              <CardDescription>إعدادات عامة للنظام والأمان</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">الإعدادات العامة</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">العملة الافتراضية</Label>
                    <Select
                      value={systemSettings.currency}
                      onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                        <SelectItem value="EUR">يورو (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                    <Select
                      value={systemSettings.dateFormat}
                      onValueChange={(value) => setSystemSettings({ ...systemSettings, dateFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/mm/yyyy">يوم/شهر/سنة</SelectItem>
                        <SelectItem value="mm/dd/yyyy">شهر/يوم/سنة</SelectItem>
                        <SelectItem value="yyyy-mm-dd">سنة-شهر-يوم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">تنسيق الوقت</Label>
                    <Select
                      value={systemSettings.timeFormat}
                      onValueChange={(value) => setSystemSettings({ ...systemSettings, timeFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24 ساعة</SelectItem>
                        <SelectItem value="12h">12 ساعة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiscalYear">بداية السنة المالية</Label>
                    <Input
                      id="fiscalYear"
                      value={systemSettings.fiscalYearStart}
                      onChange={(e) => setSystemSettings({ ...systemSettings, fiscalYearStart: e.target.value })}
                      placeholder="01-01"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">النسخ الاحتياطي والأمان</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">تكرار النسخ الاحتياطي</Label>
                    <Select
                      value={systemSettings.backupFrequency}
                      onValueChange={(value) => setSystemSettings({ ...systemSettings, backupFrequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">يومي</SelectItem>
                        <SelectItem value="weekly">أسبوعي</SelectItem>
                        <SelectItem value="monthly">شهري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">انتهاء الجلسة (دقيقة)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">الحد الأقصى لمحاولات تسجيل الدخول</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={systemSettings.maxLoginAttempts}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maxLoginAttempts: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">معلومات النظام</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>إصدار النظام</Label>
                    <Badge variant="outline">v1.0.0</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>آخر تحديث</Label>
                    <Badge variant="outline">2024-01-21</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <Button onClick={handleSaveSystemSettings} className="w-full">
                <Save className="w-4 h-4 ml-2" />
                حفظ إعدادات النظام
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
