"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportViewer } from "@/components/report-viewer"
import { Download, FileText, Headphones } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getSampleReport } from "@/lib/sample-data"
import { jsPDF } from "jspdf"

interface Report {
  id: string
  caller_name: string
  request_type: string
  date: string
  caller_sentiment: string
  report_generated: string
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const unwrappedParams = use(params)
  const { id } = unwrappedParams
  
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("report")
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report[]>([])
  const [error, setError] = useState("");

const fetchParticularReport = async () => {
  if (!id) return;

  setLoading(true);

  try {
    const res = await fetch(`http://localhost:8000/get_report?uuid=${id}`, {
      method: "POST", // still POST, just passing uuid in query string
    });

    const data = await res.json();
    setLoading(false);

    toast({
      title: "Upload Successful",
      description: data.message || "The audio file has been processed successfully.",
    });
  } catch (error) {
    setLoading(false);
    toast({
      title: "Upload Failed",
      description: "An error occurred while uploading the file.",
      variant: "destructive",
    });
  }
};

useEffect(() => {
  fetchParticularReport();
}, []);


  const handleDownloadPDF = () => {
    if (!report || !report.report_generated) {
      toast({
        title: "Error",
        description: "Report content not available for download.",
        variant: "destructive",
      })
      return
    }

    // Initialize PDF document
    const doc = new jsPDF()
    
    // Set PDF properties
    doc.setFont("helvetica")
    doc.setFontSize(16)
    
    // Add title
    doc.text(report.title || "Report", 20, 20)
    
    // Add metadata
    doc.setFontSize(12)
    doc.text(`Generated on: ${report.date}`, 20, 30)
    doc.text(`Audio file: ${report.audioFile}`, 20, 40)
    doc.text(`Duration: ${report.duration}`, 20, 50)
    
    // Add content
    doc.setFontSize(12)
    const splitText = doc.splitTextToSize(report.content, 170)
    doc.text(splitText, 20, 70)
    
    // Download the PDF
    doc.save(`report-${id}.pdf`)
    
    toast({
      title: "PDF Downloaded",
      description: "Your report has been downloaded as a PDF.",
    })
  }

  if (!report) {
    return (
      <DashboardShell>
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Report not found</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={report.caller_name} text={`Sentiment: ${report.caller_sentiment}`}>
        <Button onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </DashboardHeader>

      <div className="grid gap-4">
        <Card className="p-6">
          <div className="mb-4 flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{report.audioFile}</h3>
              <p className="text-sm text-muted-foreground">
                {report.duration} • {report.fileSize}
              </p>
            </div>
          </div>

          <Tabs defaultValue="report" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="report">
                <FileText className="mr-2 h-4 w-4" />
                Report
              </TabsTrigger>
              <TabsTrigger value="audio">
                <Headphones className="mr-2 h-4 w-4" />
                Audio
              </TabsTrigger>
            </TabsList>
            <TabsContent value="report" className="mt-0">
              <ReportViewer content={report.content} />
            </TabsContent>
            <TabsContent value="audio" className="mt-0">
              <div className="rounded-md border p-4">
                <audio controls className="w-full" src="/placeholder.svg">
                  Your browser does not support the audio element.
                </audio>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardShell>
  )
}