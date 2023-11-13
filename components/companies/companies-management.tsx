"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Building2, Users, MapPin, Mail, Edit, Trash2 } from "lucide-react"
import { CompanyDialog } from "./company-dialog"

interface Company {
  id: string
  name: string
  nameAr: string
  industry: string
  employees: number
  location: string
  phone: string
  email: string
  website: string
  status: "active" | "inactive"
  contractValue: number
  lastContact: string
}

const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Tech Solutions Inc",
    nameAr: "شركة الحلول التقنية",
    industry: "Technology",
    employees: 150,
    location: "الرياض، السعودية",
    phone: "+966 11 123 4567",
    email: "info@techsolutions.com",
    website: "www.techsolutions.com",
    status: "active",
    contractValue: 500000,
    lastContact: "2024-01-15",
  },
  {
    id: "2",
    name: "Global Trading Co",
    nameAr: "شركة التجارة العالمية",
    industry: "Trading",
    employees: 75,
    location: "دبي، الإمارات",
    phone: "+971 4 123 4567",
    email: "contact@globaltrading.com",
    website: "www.globaltrading.com",
    status: "active",
    contractValue: 750000,
    lastContact: "2024-01-10",
  },
  {
    id: "3",
    name: "Construction Masters",
    nameAr: "أساتذة البناء",
    industry: "Construction",
    employees: 200,
    location: "القاهرة، مصر",
    phone: "+20 2 123 4567",
    email: "info@constructionmasters.com",
    website: "www.constructionmasters.com",
    status: "inactive",
    contractValue: 300000,
    lastContact: "2023-12-20",
  },
]

export function CompaniesManagement() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.nameAr.includes(searchTerm) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeCompanies = companies.filter((c) => c.status === "active").length
  const totalContractValue = companies.reduce((sum, c) => sum + c.contractValue, 0)
  const totalEmployees = companies.reduce((sum, c) => sum + c.employees, 0)

  const handleAddCompany = () => {
    setEditingCompany(null)
    setIsDialogOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company)
    setIsDialogOpen(true)
  }

  const handleDeleteCompany = (id: string) => {
    setCompanies(companies.filter((c) => c.id !== id))
  }

  const handleSaveCompany = (companyData: Omit<Company, "id">) => {
    if (editingCompany) {
      setCompanies(companies.map((c) => (c.id === editingCompany.id ? { ...companyData, id: editingCompany.id } : c)))
    } else {
      const newCompany: Company = {
        ...companyData,
        id: Date.now().toString(),
      }
      setCompanies([...companies, newCompany])
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">إدارة الشركات</h1>
          <p className="text-slate-600 mt-2">إدارة معلومات الشركات والعملاء</p>
        </div>
        <Button onClick={handleAddCompany} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 ml-2" />
          إضافة شركة جديدة
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الشركات</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-slate-600">{activeCompanies} شركة نشطة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة العقود</CardTitle>
            <div className="h-4 w-4 text-green-600">$</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContractValue.toLocaleString()}</div>
            <p className="text-xs text-slate-600">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-slate-600">في جميع الشركات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الشركات النشطة</CardTitle>
            <div className="h-4 w-4 text-emerald-600 rounded-full bg-emerald-100"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCompanies}</div>
            <p className="text-xs text-slate-600">
              {Math.round((activeCompanies / companies.length) * 100)}% من الإجمالي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الشركات</CardTitle>
          <CardDescription>إدارة معلومات الشركات والعملاء</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 space-x-reverse mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="البحث في الشركات..."
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
                  <TableHead className="text-right">اسم الشركة</TableHead>
                  <TableHead className="text-right">القطاع</TableHead>
                  <TableHead className="text-right">الموقع</TableHead>
                  <TableHead className="text-right">الموظفين</TableHead>
                  <TableHead className="text-right">قيمة العقد</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{company.nameAr}</div>
                        <div className="text-sm text-slate-600">{company.name}</div>
                        <div className="text-xs text-slate-500 flex items-center mt-1">
                          <Mail className="w-3 h-3 ml-1" />
                          {company.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{company.industry}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 ml-1 text-slate-400" />
                        {company.location}
                      </div>
                    </TableCell>
                    <TableCell>{company.employees}</TableCell>
                    <TableCell>{company.contractValue.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <Badge variant={company.status === "active" ? "default" : "secondary"}>
                        {company.status === "active" ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button variant="ghost" size="sm" onClick={() => handleEditCompany(company)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCompany(company.id)}
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

      <CompanyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        company={editingCompany}
        onSave={handleSaveCompany}
      />
    </div>
  )
}
