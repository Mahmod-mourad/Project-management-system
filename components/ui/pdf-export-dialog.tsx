"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Settings, Calendar, Filter, Layout } from "lucide-react"

interface PDFExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  data?: any[]
  onExport: (options: ExportOptions) => void
}

interface ExportOptions {
  format: "pdf" | "excel" | "csv"
  orientation: "portrait" | "landscape"
  pageSize: "a4" | "a3" | "letter"
  includeCharts: boolean
  includeImages: boolean
  dateRange: {
    from: string
    to: string
  }
  columns: string[]
  title: string
  description: string
}

/** Defaults the export window to the last thirty days, as YYYY-MM-DD. */
function defaultDateRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 30)

  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

export function PDFExportDialog({ open, onOpenChange, title, data = [], onExport }: PDFExportDialogProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>(() => ({
    format: "pdf",
    orientation: "portrait",
    pageSize: "a4",
    includeCharts: true,
    includeImages: true,
    // Computed in the initialiser rather than inline: reading the clock during
    // render is impure, and it also produced a different default on the server
    // than on the client.
    dateRange: defaultDateRange(),
    columns: [],
    title: title,
    description: "",
  }))

  const availableColumns = data.length > 0 ? Object.keys(data[0]) : []

  const handleExport = () => {
    console.log("[v0] Exporting with options:", exportOptions)
    onExport(exportOptions)
    onOpenChange(false)
  }

  const updateOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions((prev) => ({ ...prev, [key]: value }))
  }

  const toggleColumn = (column: string) => {
    setExportOptions((prev) => ({
      ...prev,
      columns: prev.columns.includes(column) ? prev.columns.filter((c) => c !== column) : [...prev.columns, column],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تصدير {title}
          </DialogTitle>
          <DialogDescription>اختر إعدادات التصدير المناسبة لاحتياجاتك</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                إعدادات التصدير
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>نوع الملف</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: "pdf" | "excel" | "csv") => updateOption("format", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>اتجاه الصفحة</Label>
                  <Select
                    value={exportOptions.orientation}
                    onValueChange={(value: "portrait" | "landscape") => updateOption("orientation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">عمودي</SelectItem>
                      <SelectItem value="landscape">أفقي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>حجم الصفحة</Label>
                  <Select
                    value={exportOptions.pageSize}
                    onValueChange={(value: "a4" | "a3" | "letter") => updateOption("pageSize", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="a3">A3</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="includeCharts"
                    checked={exportOptions.includeCharts}
                    onCheckedChange={(checked) => updateOption("includeCharts", checked)}
                  />
                  <Label htmlFor="includeCharts">تضمين الرسوم البيانية</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="includeImages"
                    checked={exportOptions.includeImages}
                    onCheckedChange={(checked) => updateOption("includeImages", checked)}
                  />
                  <Label htmlFor="includeImages">تضمين الصور</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                نطاق التاريخ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">من تاريخ</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={exportOptions.dateRange.from}
                    onChange={(e) => updateOption("dateRange", { ...exportOptions.dateRange, from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">إلى تاريخ</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={exportOptions.dateRange.to}
                    onChange={(e) => updateOption("dateRange", { ...exportOptions.dateRange, to: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column Selection */}
          {availableColumns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  اختيار الأعمدة
                </CardTitle>
                <CardDescription>اختر الأعمدة التي تريد تضمينها في التصدير</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableColumns.map((column) => (
                    <div key={column} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`column-${column}`}
                        checked={exportOptions.columns.includes(column)}
                        onCheckedChange={() => toggleColumn(column)}
                      />
                      <Label htmlFor={`column-${column}`} className="text-sm">
                        {column}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => updateOption("columns", availableColumns)}>
                    تحديد الكل
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => updateOption("columns", [])}>
                    إلغاء التحديد
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="h-4 w-4" />
                معلومات المستند
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exportTitle">عنوان التقرير</Label>
                <Input
                  id="exportTitle"
                  value={exportOptions.title}
                  onChange={(e) => updateOption("title", e.target.value)}
                  placeholder="أدخل عنوان التقرير"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exportDescription">وصف التقرير</Label>
                <Textarea
                  id="exportDescription"
                  value={exportOptions.description}
                  onChange={(e) => updateOption("description", e.target.value)}
                  placeholder="أدخل وصف مختصر للتقرير"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="ml-2 h-4 w-4" />
            تصدير {exportOptions.format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
