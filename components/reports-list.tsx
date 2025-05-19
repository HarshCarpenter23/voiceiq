"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, FileText, Search } from "lucide-react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { serialize } from 'next-mdx-remote/serialize'
import { useReportStore } from "@/store/reportStore"
import { useRouter } from "next/navigation"
interface Report {
  id: string
  caller_name: string
  request_type: string
  date: string
  caller_sentiment: string
  report_generated: string
}

export function ReportsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { setSelectedReport } = useReportStore()

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://172.105.54.63:8000/logs/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await res.json()
      console.log("✅ Data received:", data)
      setReports(data.data || [])
    } catch (err) {
      console.error(" Failed to fetch reports:", err)
      setError("Failed to load reports.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Parse markdown using MDX serializer
  const parseMarkdownWithMDX = async (markdown: string) => {
    if (!markdown) return { title: "", mdxSource: null };

    // Extract title (assuming first line is title)
    const lines = markdown.split(/\r?\n/);
    const title = lines[0] || "Report";

    try {
      // Serialize the markdown content with MDX
      const mdxSource = await serialize(markdown, {
        // MDX options
        mdxOptions: {
          remarkPlugins: [],
          rehypePlugins: [],
        },
      });

      return { title, mdxSource };
    } catch (error) {
      console.error("Error parsing markdown with MDX:", error);
      return { title, mdxSource: null };
    }
  }

  const generatePDF = async (report: Report) => {
    // Initialize PDF document
    const doc = new jsPDF();

    // Parse the markdown using MDX
    const { title } = await parseMarkdownWithMDX(report.report_generated);

    // Extract plain text content for PDF
    // For PDF generation, we'll still need to convert MDX to plain text/structure
    const content = report.report_generated || "";
    const lines = content.split(/\r?\n/);
    const reportTitle = lines[0] || "Report";

    // Add header with caller info
    doc.setFillColor(41, 98, 255); // Blue header
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');

    // Add title
    doc.setTextColor(255, 255, 255); // White text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(reportTitle, 20, 20);

    // Add caller info
    doc.setFontSize(12);
    doc.text(`Caller: ${report.caller_name || "Unknown"}`, 20, 30);

    // Reset text color for main content
    doc.setTextColor(0, 0, 0);

    // Parse content sections using regex patterns
    let yPosition = 50; // Start position after header

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 20;
      }

      // Check for headings (# Heading)
      if (line.match(/^#{1,3}\s/)) {
        // Add space before new section
        yPosition += 10;

        const headingMatch = line.match(/^(#+)/);
        const headingLevel = headingMatch ? headingMatch[0].length : 1;
        const headingText = line.replace(/^#+\s+/, '');

        // Set font size based on heading level
        const fontSize = 18 - (headingLevel * 2);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize);
        doc.setTextColor(41, 98, 255); // Blue for headings
        doc.text(headingText, 20, yPosition);

        yPosition += 8;
        continue;
      }

      // Regular text content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Black for content

      // Handle bullet points
      let textLine = line;
      let indent = 0;

      if (line.match(/^\s*[-*]\s/)) {
        textLine = `• ${line.replace(/^\s*[-*]\s/, '')}`;
        indent = 5;
      }
      // Handle checkboxes
      else if (line.match(/^\s*- \[[ x]\]\s/)) {
        const isChecked = line.includes('[x]');
        textLine = `${isChecked ? '☑' : '☐'} ${line.replace(/^\s*- \[[ x]\]\s/, '')}`;
        indent = 5;
      }

      // Split long text to fit page width
      const textLines = doc.splitTextToSize(textLine, 170 - indent);

      doc.text(textLines, 20 + indent, yPosition);
      yPosition += textLines.length * 7; // Add space based on number of lines
    }

    // Add footer - fix for the TypeScript error
    const pageCount = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150); // Gray for footer
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

      // Add timestamp
      const timestamp = new Date().toLocaleString();
      doc.text(`Generated: ${timestamp}`, 20, doc.internal.pageSize.getHeight() - 10);
    }

    // Download the PDF
    const fileName = `${report.caller_name || 'report'}-${report.id.slice(0, 8)}.pdf`;
    doc.save(fileName);
  }

  const filteredReports = reports.filter(
    (report) =>
      report.caller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.request_type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Function to determine sentiment color
  const getSentimentColor = (sentiment: string) => {
    if (!sentiment) return "gray";

    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes("happy") || lowerSentiment.includes("positive")) {
      return "green";
    } else if (lowerSentiment.includes("neutral")) {
      return "blue";
    } else if (lowerSentiment.includes("angry") || lowerSentiment.includes("negative") || lowerSentiment.includes("sad")) {
      return "red";
    } else {
      return "gray";
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Reports</CardTitle>
            <CardDescription>A list of all your generated reports.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caller Name</TableHead>
              <TableHead>Request Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading reports...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No reports found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => {
                const sentimentColor = getSentimentColor(report.caller_sentiment);

                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <Button onClick={() => {
                        setSelectedReport(report)
                        router.push(`/reports/${report.id}`)
                      }}>
                        {report.caller_name}
                      </Button>

                    </TableCell>
                    <TableCell>{report.request_type || "N/A"}</TableCell>
                    <TableCell>{report.date || "N/A"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sentimentColor === "green"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : sentimentColor === "red"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            : sentimentColor === "blue"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                          }`}
                      >
                        {report.caller_sentiment || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => generatePDF(report)}
                        title="Download PDF Report"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download PDF</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}