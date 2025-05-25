"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Download,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Phone,
  AudioLines,
  Play,
  ArrowRightLeft,
  Eye,
  Network,
  Headset,
  UserRound,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DateRangePicker } from "@/components/date-range-picker"
import { useReportStore } from "@/store/reportStore"

// Simple date utility functions to replace luxon
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  } catch {
    return "N/A"
  }
}

const isDateInRange = (callDate: string, fromDate: string, toDate: string) => {
  if (!fromDate && !toDate) return true
  if (!callDate) return true

  try {
    const reportDate = new Date(callDate)
    const fromDateTime = fromDate ? new Date(fromDate + "T00:00:00") : null
    const toDateTime = toDate ? new Date(toDate + "T23:59:59") : null

    if (fromDateTime && toDateTime) {
      return reportDate >= fromDateTime && reportDate <= toDateTime
    } else if (fromDateTime) {
      return reportDate >= fromDateTime
    } else if (toDateTime) {
      return reportDate <= toDateTime
    }

    return true
  } catch {
    return true
  }
}

const ColumnHeader = ({
  column,
  icon,
  label,
  showSearch = true,
  columnFilters,
  columnSorts,
  handleColumnFilterChange,
  handleColumnSort,
}: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {icon}
        <span>{label}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={() => handleColumnSort(column)}
      >
        {columnSorts[column] === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : columnSorts[column] === "desc" ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3" />
        )}
      </Button>
    </div>
{showSearch &&
  (label.toLowerCase().includes("date") ? (
    <Input
      type="date"
      value={columnFilters[column] || ""}
      onChange={(e) => handleColumnFilterChange(column, e.target.value)}
      className="h-7 text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
    />
  ) : (
    <Input
      placeholder={`Filter ${label.toLowerCase()}...`}
      value={columnFilters[column] || ""}
      onChange={(e) => handleColumnFilterChange(column, e.target.value)}
      className="h-7 text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
    />
  ))
}
  </div>
)

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [reportsPerPage] = useState(20)
  const [sortConfig, setSortConfig] = useState({ key: "call_date", direction: "desc" })
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // Individual column filters
  const [columnFilters, setColumnFilters] = useState({
    call_date: "",
    call_type: "",
    caller_name: "",
    request_type: "",
    toll_free_did: "",
    customer_number: "",
    caller_sentiment: "",
  })

  // Individual column sort states
  const [columnSorts, setColumnSorts] = useState({
    call_date: "desc",
    call_type: null,
    caller_name: null,
    request_type: null,
    toll_free_did: null,
    customer_number: null,
    caller_sentiment: null,
  })

  const router = useRouter()
  const { setSelectedReport } = useReportStore()

  // Blob shape decorations
  const Blob = ({ className }: any) => (
    <div className={`absolute blur-3xl opacity-20 rounded-full mix-blend-multiply ${className}`}></div>
  )

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await fetch("https://voiceiq-db.indominuslabs.in/logs/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log("✅ Data received:", data)
      setReports(data.data || [])
    } catch (err) {
      console.error("❌ Failed to fetch reports:", err)
      setError("Failed to load reports.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Clear date filters
  const clearDateFilters = () => {
    setFromDate("")
    setToDate("")
    setCurrentPage(1)
  }

  // Handle column filter change
  const handleColumnFilterChange = (column: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }))
    setCurrentPage(1)
  }

  // Handle column sort
  const handleColumnSort = (column: string) => {
    const currentSort = columnSorts[column]
    let newSort = "asc"

    if (currentSort === "asc") {
      newSort = "desc"
    } else if (currentSort === "desc") {
      newSort = ""
    }

    // Reset all other column sorts
    const resetSorts = Object.keys(columnSorts).reduce((acc, key) => {
      acc[key] = key === column ? newSort : null
      return acc
    }, {} as any)

    setColumnSorts(resetSorts)

    // Update main sort config
    if (newSort) {
      setSortConfig({ key: column, direction: newSort })
    } else {
      setSortConfig({ key: "call_date", direction: "desc" })
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setColumnFilters({
      call_date: "",
      call_type: "",
      caller_name: "",
      request_type: "",
      toll_free_did: "",
      customer_number: "",
      caller_sentiment: "",
    })
    setSearchQuery("")
    setFromDate("")
    setToDate("")
    setCurrentPage(1)
  }

  // Simple PDF generation function
  const generatePDF = async (report: any) => {
    try {
      // Create a simple text content for download
      const content = `
VOICEIQ REPORT
==============

Caller: ${report.caller_name || "Unknown"}
Date: ${report.call_date || "N/A"}
Type: ${report.request_type || "N/A"}
Sentiment: ${report.caller_sentiment || "N/A"}

Transcription:
${report.transcription || "No transcription available"}

Call Log:
${report.call_log || "No call log available"}

Generated: ${new Date().toLocaleString()}
`

      // Create a blob and download
      const blob = new (window as any).Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `report-${report.caller_name || "unknown"}-${report.id?.slice(0, 8) || "report"}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate report. Please try again.")
    }
  }

  // Apply sorting
  const sortedReports = useMemo(() => {
    return [...reports].sort((a: any, b: any) => {
      let aValue = a[sortConfig.key] || ""
      let bValue = b[sortConfig.key] || ""

      // Handle special cases for different data types
      if (sortConfig.key === "call_date") {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = (bValue || "").toLowerCase()
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }, [reports, sortConfig])

  // Apply filters
  const filteredReports = useMemo(() => {
    return sortedReports.filter((report: any) => {
      // Global search filter
      const matchesGlobalSearch =
        (report.caller_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (report.request_type?.toLowerCase() || "").includes(searchQuery.toLowerCase())

      // Individual column filters
      const matchesDateFilter =
        !columnFilters.call_date ||
        (report.call_date && report.call_date.toLowerCase().includes(columnFilters.call_date.toLowerCase()))

      const matchesCallType =
        !columnFilters.call_type ||
        (report.call_type?.toLowerCase() || "").includes(columnFilters.call_type.toLowerCase())

      const matchesCallerName =
        !columnFilters.caller_name ||
        (report.caller_name?.toLowerCase() || "").includes(columnFilters.caller_name.toLowerCase())

      const matchesRequestType =
        !columnFilters.request_type ||
        (report.request_type?.toLowerCase() || "").includes(columnFilters.request_type.toLowerCase())

      const matchesTollFreeDid =
        !columnFilters.toll_free_did ||
        (report.toll_free_did?.toLowerCase() || "").includes(columnFilters.toll_free_did.toLowerCase())

      const matchesCustomerNumber =
        !columnFilters.customer_number ||
        (report.customer_number?.toLowerCase() || "").includes(columnFilters.customer_number.toLowerCase())

      const matchesSentiment =
        !columnFilters.caller_sentiment ||
        (report.caller_sentiment?.toLowerCase() || "").includes(columnFilters.caller_sentiment.toLowerCase())

      const matchesDateRange = isDateInRange(report.call_date, fromDate, toDate)

      return (
        matchesGlobalSearch &&
        matchesDateFilter &&
        matchesCallType &&
        matchesCallerName &&
        matchesRequestType &&
        matchesTollFreeDid &&
        matchesCustomerNumber &&
        matchesSentiment &&
        matchesDateRange
      )
    })
  }, [sortedReports, searchQuery, columnFilters, fromDate, toDate])

  // Function to determine sentiment color
  const getSentimentColor = (sentiment: any) => {
    if (!sentiment) return "gray"

    const lowerSentiment = sentiment.toLowerCase()
    if (lowerSentiment.includes("happy") || lowerSentiment.includes("positive")) {
      return "green"
    } else if (lowerSentiment.includes("neutral")) {
      return "blue"
    } else if (
      lowerSentiment.includes("angry") ||
      lowerSentiment.includes("negative") ||
      lowerSentiment.includes("sad")
    ) {
      return "red"
    } else {
      return "gray"
    }
  }

  // Get current reports for pagination
  const indexOfLastReport = currentPage * reportsPerPage
  const indexOfFirstReport = indexOfLastReport - reportsPerPage
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport)
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="relative overflow-hidden min-h-screen p-4">
      {/* Decorative blobs */}
      <Blob className="bg-blue-300 w-64 h-64 -top-20 -left-20" />
      <Blob className="bg-purple-300 w-72 h-72 -bottom-20 -right-20" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-black border border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  All Reports
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  A list of all your generated reports
                </CardDescription>
              </motion.div>

              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <motion.div
                  className="relative w-full md:w-64"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Global search..."
                    className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full focus:ring focus:ring-blue-200 dark:focus:ring-blue-900 transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </motion.div>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={clearAllFilters}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>

            {/* Date Range Filter Panel */}
            <AnimatePresence>
              {isFilterVisible && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-3 text-gray-500">Date Range Filter</p>
                      <DateRangePicker
                        fromDate={fromDate}
                        toDate={toDate}
                        onFromDateChange={setFromDate}
                        onToDateChange={setToDate}
                        onClear={clearDateFilters}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableHead className="font-semibold min-w-[200px]">
                        <ColumnHeader
                          column="call_date"
                          icon={<Phone className="h-4 w-4" />}
                          label="Date"
                          columnFilters={columnFilters}
                          columnSorts={columnSorts}
                          handleColumnFilterChange={handleColumnFilterChange}
                          handleColumnSort={handleColumnSort}
                        />
                      </TableHead>
                      <TableHead className="font-semibold min-w-[150px]">
                        <ColumnHeader
                          column="call_type"
                          icon={<ArrowRightLeft className="h-4 w-4" />}
                          label="In/External"
                          columnFilters={columnFilters}
                          columnSorts={columnSorts}
                          handleColumnFilterChange={handleColumnFilterChange}
                          handleColumnSort={handleColumnSort}
                        />
                      </TableHead>
                      <TableHead className="font-semibold min-w-[180px]">
                        <ColumnHeader
                          column="caller_name"
                          icon={<UserRound className="h-4 w-4" />}
                          label="Caller Name"
                          columnFilters={columnFilters}
                          columnSorts={columnSorts}
                          handleColumnFilterChange={handleColumnFilterChange}
                          handleColumnSort={handleColumnSort}
                        />
                      </TableHead>
                      <TableHead className="font-semibold min-w-[150px]">
                        <ColumnHeader
                          column="request_type"
                          icon={<Network className="h-4 w-4" />}
                          label="Request Type"
                          columnFilters={columnFilters}
                          columnSorts={columnSorts}
                          handleColumnFilterChange={handleColumnFilterChange}
                          handleColumnSort={handleColumnSort}
                        />
                      </TableHead>
                      <TableHead className="font-semibold min-w-[150px]">
                        <ColumnHeader
                          column="toll_free_did"
                          icon={<Headset className="h-4 w-4" />}
                          label="Toll Free/DID"
                          columnFilters={columnFilters}
                          columnSorts={columnSorts}
                          handleColumnFilterChange={handleColumnFilterChange}
                          handleColumnSort={handleColumnSort}
                        />
                      </TableHead>
                      <TableHead className="font-semibold min-w-[170px]">
                        <ColumnHeader
                          column="customer_number"
                          icon={<Phone className="h-4 w-4" />}
                          label="Customer Number"
                          columnFilters={columnFilters}
                          columnSorts={columnSorts}
                          handleColumnFilterChange={handleColumnFilterChange}
                          handleColumnSort={handleColumnSort}
                        />
                      </TableHead>
                      <TableHead className="font-semibold min-w-[150px]">
                        <ColumnHeader
                          column="caller_sentiment"
                          icon={<AudioLines className="h-4 w-4" />}
                          label="Sentiment"
                          columnFilters={columnFilters}
                          columnSorts={columnSorts}
                          handleColumnFilterChange={handleColumnFilterChange}
                          handleColumnSort={handleColumnSort}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-center min-w-[120px]">
                        <div className="flex justify-center items-center gap-1">
                          <Play className="h-4 w-4" />
                          <span>Actions</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-[0.9rem]">
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32">
                          <div className="flex flex-col items-center justify-center">
                            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-r-transparent animate-spin"></div>
                            <p className="mt-2 text-sm text-gray-500">Loading reports...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="rounded-full bg-red-100 p-3">
                              <svg
                                className="h-6 w-6 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938-9H18a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
                                />
                              </svg>
                            </div>
                            <p className="mt-2 text-red-500 font-medium">{error}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : currentReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="mt-2 text-gray-500">No reports found.</p>
                            {(fromDate || toDate || Object.values(columnFilters).some((f) => f)) && (
                              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentReports.map((report: any) => {
                        const sentimentColor = getSentimentColor(report.caller_sentiment)

                        return (
                          <TableRow
                            key={report.id}
                            className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all duration-200 text-[0.9rem]"
                          >
                            <TableCell className="text-gray-600 dark:text-gray-300">
                              {formatDate(report.call_date)}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                                {report.call_type === "in" ? (
                                  <>
                                    <PhoneIncoming className="w-4 h-4 text-green-500" />
                                    In
                                  </>
                                ) : report.call_type === "external" ? (
                                  <>
                                    <PhoneOutgoing className="w-4 h-4 text-red-500" />
                                    External
                                  </>
                                ) : (
                                  report.call_type || "N/A"
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                className="px-0 font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 text-[1.1rem]"
                                onClick={() => {
                                  setSelectedReport(report)
                                  router.push(`/reports/${report.id}`)
                                }}
                              >
                                {report.caller_name || "Unknown"}
                              </Button>
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300">
                              {report.request_type?.charAt(0).toUpperCase() + report.request_type?.slice(1) || "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300">
                              {report.toll_free_did || "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300">
                              {report.customer_number || "N/A"}
                            </TableCell>

                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 ${
                                  sentimentColor === "green"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                    : sentimentColor === "red"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                      : sentimentColor === "blue"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {report.caller_sentiment?.charAt(0).toUpperCase() + report.caller_sentiment?.slice(1) ||
                                  "Unknown"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-1 transition-opacity duration-200">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                                  onClick={() => {
                                    setSelectedReport(report)
                                    router.push(`/reports/${report.id}`)
                                  }}
                                  title="View Report"
                                >
                                  <Eye className="h-4 w-4 text-gray-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                                  onClick={() => generatePDF(report)}
                                  title="Download Report"
                                >
                                  <Download className="h-4 w-4 text-gray-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            {!loading && !error && filteredReports.length > 0 && (
              <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{indexOfFirstReport + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(indexOfLastReport, filteredReports.length)}</span> of{" "}
                  <span className="font-medium">{filteredReports.length}</span> reports
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNumber = i + 1
                    return (
                      <Button
                        key={`page-${pageNumber}`}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="icon"
                        className={`h-8 w-8 rounded-full ${currentPage === pageNumber ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}`}
                        onClick={() => paginate(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
