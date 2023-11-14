"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Users, Calendar, DollarSign, Clock, Edit, Trash2, Eye } from "lucide-react"
import { EmployeeDialog } from "./employee-dialog"
import { AttendanceDialog } from "./attendance-dialog"

interface Employee {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  salary: number
  hireDate: string
  status: "active" | "inactive" | "on-leave"
  manager: string
  address: string
}

interface Attendance {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  hoursWorked: number
  status: "present" | "absent" | "late" | "half-day"
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    employeeId: "EMP001",
    name: "أحمد محمد علي",
    email: "ahmed@company.com",
    phone: "+966 50 123 4567",
    position: "مطور برمجيات أول",
    department: "تقنية المعلومات",
    salary: 12000,
    hireDate: "2023-01-15",
    status: "active",
    manager: "محمد أحمد",
    address: "الرياض، السعودية",
  },
  {
    id: "2",
    employeeId: "EMP002",
    name: "فاطمة سالم",
    email: "fatima@company.com",
    phone: "+966 55 234 5678",
    position: "مصممة واجهات",
    department: "التصميم",
    salary: 8000,
    hireDate: "2023-03-20",
    status: "active",
    manager: "سارة أحمد",
    address: "جدة، السعودية",
  },
  {
    id: "3",
    employeeId: "EMP003",
    name: "خالد عبدالله",
    email: "khalid@company.com",
    phone: "+966 56 345 6789",
    position: "محاسب",
    department: "المالية",
    salary: 7000,
    hireDate: "2022-11-10",
    status: "on-leave",
    manager: "عبدالرحمن محمد",
    address: "الدمام، السعودية",
  },
]

const mockAttendance: Attendance[] = [
  {
    id: "1",
    employeeId: "EMP001",
    employeeName: "أحمد محمد علي",
    date: "2024-01-21",
    checkIn: "08:00",
    checkOut: "17:00",
    hoursWorked: 9,
    status: "present",
  },
  {
    id: "2",
    employeeId: "EMP002",
    employeeName: "فاطمة سالم",
    date: "2024-01-21",
    checkIn: "08:30",
    checkOut: "17:30",
    hoursWorked: 9,
    status: "late",
  },
  {
    id: "3",
    employeeId: "EMP003",
    employeeName: "خالد عبدالله",
    date: "2024-01-21",
    checkIn: "",
    checkOut: "",
    hoursWorked: 0,
    status: "absent",
  },
]

export function HRManagement() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [attendance, setAttendance] = useState<Attendance[]>(mockAttendance)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.includes(searchTerm) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.includes(searchTerm),
  )

  const activeEmployees = employees.filter((e) => e.status === "active").length
  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0)
  const presentToday = attendance.filter((a) => a.status === "present" || a.status === "late").length
  const absentToday = attendance.filter((a) => a.status === "absent").length

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setIsEmployeeDialogOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsEmployeeDialogOpen(true)
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter((e) => e.id !== id))
  }

  const handleSaveEmployee = (employeeData: Omit<Employee, "id">) => {
    if (editingEmployee) {
      setEmployees(
        employees.map((e) => (e.id === editingEmployee.id ? { ...employeeData, id: editingEmployee.id } : e)),
      )
    } else {
      const newEmployee: Employee = {
        ...employeeData,
        id: Date.now().toString(),
      }
      setEmployees([...employees, newEmployee])
    }
    setIsEmployeeDialogOpen(false)
  }

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "on-leave":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "نشط"
      case "inactive":
        return "غير نشط"
      case "on-leave":
        return "في إجازة"
      default:
        return "غير محدد"
    }
  }

  const getAttendanceStatusColor = (status: Attendance["status"]) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "half-day":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAttendanceStatusText = (status: Attendance["status"]) => {
    switch (status) {
      case "present":
        return "حاضر"
      case "late":
        return "متأخر"
      case "absent":
        return "غائب"
      case "half-day":
        return "نصف يوم"
      default:
        return "غير محدد"
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">إدارة الموارد البشرية</h1>
          <p className="text-slate-600 mt-2">إدارة الموظفين والحضور والرواتب</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button onClick={() => setIsAttendanceDialogOpen(true)} variant="outline">
            <Clock className="w-4 h-4 ml-2" />
            تسجيل حضور
          </Button>
          <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 ml-2" />
            موظف جديد
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-slate-600">{activeEmployees} موظف نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalaries.toLocaleString()}</div>
            <p className="text-xs text-slate-600">ريال سعودي شهرياً</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحضور اليوم</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday}</div>
            <p className="text-xs text-slate-600">موظف حاضر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الغياب اليوم</CardTitle>
            <div className="h-4 w-4 text-red-600 rounded-full bg-red-100"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentToday}</div>
            <p className="text-xs text-slate-600">موظف غائب</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">الموظفين</TabsTrigger>
          <TabsTrigger value="attendance">الحضور والانصراف</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الموظفين</CardTitle>
              <CardDescription>إدارة معلومات الموظفين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الموظفين..."
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
                      <TableHead className="text-right">رقم الموظف</TableHead>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">المنصب</TableHead>
                      <TableHead className="text-right">القسم</TableHead>
                      <TableHead className="text-right">الراتب</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.employeeId}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-slate-600">{employee.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.salary.toLocaleString()} ر.س</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(employee.status)}>{getStatusText(employee.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditEmployee(employee)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee.id)}
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
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل الحضور والانصراف</CardTitle>
              <CardDescription>متابعة حضور الموظفين اليومي</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">وقت الحضور</TableHead>
                      <TableHead className="text-right">وقت الانصراف</TableHead>
                      <TableHead className="text-right">ساعات العمل</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString("ar-SA")}</TableCell>
                        <TableCell>{record.checkIn || "-"}</TableCell>
                        <TableCell>{record.checkOut || "-"}</TableCell>
                        <TableCell>{record.hoursWorked} ساعة</TableCell>
                        <TableCell>
                          <Badge className={getAttendanceStatusColor(record.status)}>
                            {getAttendanceStatusText(record.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EmployeeDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        employee={editingEmployee}
        onSave={handleSaveEmployee}
      />

      <AttendanceDialog
        open={isAttendanceDialogOpen}
        onOpenChange={setIsAttendanceDialogOpen}
        employees={employees}
        onSave={(attendanceData) => {
          const newRecord: Attendance = {
            ...attendanceData,
            id: Date.now().toString(),
          }
          setAttendance([...attendance, newRecord])
          setIsAttendanceDialogOpen(false)
        }}
      />
    </div>
  )
}
