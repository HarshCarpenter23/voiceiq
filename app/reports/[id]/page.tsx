"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import ChatBox from "@/components/chat-box"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, FileAudio, MessageCircle, Clock, Phone, Info, ArrowDownCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import * as htmlToImage from 'html-to-image' // Fixed import
import { jsPDF } from "jspdf"

export default function ReportPage() {
  const params = useParams()
  const [transcription, setTranscription] = useState("")
  const [calllog, setCalllog] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [metadata, setMetadata] = useState({
    date: "",
    duration: "",
    caller: "",
    issueSummary: ""
  })

  const transcriptionRef = useRef<HTMLDivElement>(null)
  const issueSummaryRef = useRef<HTMLDivElement>(null)

  const exportToPdf = async (ref: React.RefObject<HTMLDivElement>, fileName: string) => {
    if (!ref.current) return

    try {
      const element = ref.current
      // Fixed method call
      const dataUrl = await htmlToImage.toPng(element)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm'
      })

      // Get the dimensions of the PDF page
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Calculate the dimensions of the image to fit the page
      const imgProps = pdf.getImageProperties(dataUrl)
      const imgWidth = pageWidth - 20 // 10mm margin on each side
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width

      // Add the image to the PDF
      pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight)

      // Add metadata to the PDF
      pdf.setFontSize(10)
      pdf.setTextColor(150)
      pdf.text(`Exported from VoiceIQ - ${new Date().toLocaleString()}`, 10, pageHeight - 10)

      // Save the PDF
      pdf.save(`${fileName}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const exportTranscription = () => {
    if (transcriptionRef.current) {
      exportToPdf(transcriptionRef, `transcription-${params.id}`)
    }
  }

  const exportIssueSummary = () => {
    if (issueSummaryRef.current) {
      exportToPdf(issueSummaryRef, `issue-summary-${params.id}`)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://voiceiq-db.indominuslabs.in/logs/${params.id}`)
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }
        const data = await res.json()
        const result = data.data[0]

        setTranscription(result.transcription || "No transcription available")
        setCalllog(result.call_log || "No call log available")
        
        // Extract metadata if available
        setMetadata({
          date: result.call_date || new Date().toLocaleDateString(),
          duration: result.call_duration || "Unknown",
          caller: result.caller_name || "Unknown caller",
          issueSummary: result.issue_summary || "No issue details available"
        })
      } catch (err) {
        setError(err.message || "Failed to fetch report data")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary/30 animate-pulse mx-auto mb-4"></div>
            <p className="text-sm font-medium text-muted-foreground">Loading report data</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-md">
            <p className="text-sm font-medium text-destructive mb-2">Unable to load report</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // Format transcription for better readability
  const formattedTranscription = transcription
    .split(/(?<=[.!?])\s+/)
    .filter(segment => segment.trim().length > 0)
    .map((segment, index) => ({
      id: index,
      text: segment.trim(),
      speaker: index % 2 === 0 ? "Agent" : "Customer" // Alternate speakers as example
    }));

  return (
    <DashboardShell>
      <div className="max-w-5xl w-full mx-auto px-4">
        {/* Call Metadata */}
        <div className="mb-8 mt-2">
          <h1 className="text-2xl font-light mb-4">Call Report</h1>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarIcon size={14} className="text-muted-foreground/70" />
              <span>{metadata.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-muted-foreground/70" />
              <span>{metadata.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-muted-foreground/70" />
              <span>{metadata.caller}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="transcription" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-lg mb-8">
            <TabsTrigger 
              value="transcription" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileAudio size={16} />
              <span>Transcription</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chatbot" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <MessageCircle size={16} />
              <span>Chatbot</span>
            </TabsTrigger>
            <TabsTrigger 
              value="calllog" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Info size={16} />
              <span>Call Details</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transcription" className="focus:outline-none">
            <div className="space-y-6 pb-10" ref={transcriptionRef}>
              {/* <div className="mb-6">
                <h2 className="text-xl font-semibold">Call Transcription</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} />
                    <span>{metadata.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{metadata.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{metadata.caller}</span>
                  </div>
                </div>
              </div> */}
              
              {formattedTranscription.map((segment) => (
                <div 
                  key={segment.id} 
                  className={cn(
                    "flex gap-4",
                    segment.speaker === "Customer" ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs text-primary-foreground",
                    segment.speaker === "Agent" ? "bg-primary" : "bg-muted-foreground"
                  )}>
                    {segment.speaker[0]}
                  </div>
                  <div className={cn(
                    "max-w-[80%] py-3 px-4 rounded-2xl text-sm",
                    segment.speaker === "Agent" 
                      ? "bg-muted/50 text-foreground" 
                      : "bg-muted text-foreground"
                  )}>
                    <p className="font-medium text-xs mb-1 text-muted-foreground">
                      {segment.speaker}
                    </p>
                    <p>{segment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mb-6">
              <button 
                onClick={exportTranscription}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowDownCircle size={16} />
                <span>Export Transcription</span>
              </button>
            </div>
          </TabsContent>

          <TabsContent value="chatbot" className="focus:outline-none">
            <div className="bg-card rounded-lg p-4 h-[calc(100vh-280px)] min-h-[500px] border">
              <ChatBox />
            </div>
          </TabsContent>

          <TabsContent value="calllog" className="focus:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
              {/* Issue Summary - replaces Call Timeline */}
              <div className="col-span-2 bg-background rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-background border-b px-6 py-4 flex items-center justify-between">
                  <h3 className="font-medium text-sm">Issue Summary</h3>
                  <button 
                    onClick={exportIssueSummary}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ArrowDownCircle size={14} />
                    <span>Export</span>
                  </button>
                </div>
                <div className="p-6 overflow-y-auto h-[calc(100%-56px)]" ref={issueSummaryRef}>
                  <div className="text-sm leading-relaxed space-y-4">
                    <h2 className="text-xl font-semibold mb-2">Call Issue Summary</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={14} />
                        <span>{metadata.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{metadata.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{metadata.caller}</span>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                      <p>{metadata.issueSummary}</p>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Key Points</h4>
                      <ul className="space-y-2">
                        {metadata.issueSummary.split('.').filter(sentence => sentence.trim().length > 10).map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs">{index + 1}</span>
                            </div>
                            <p className="text-sm">{point.trim()}.</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call Analytics - Mac-inspired design */}
              <div className="col-span-1 space-y-6">
                <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-background border-b px-4 py-3">
                    <h3 className="font-medium text-sm">Call Summary</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Call Type</p>
                        <p className="text-sm font-medium">Customer Support</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Call Result</p>
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <p className="text-sm font-medium">Resolved</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Topics Discussed</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-muted">Product Features</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-muted">Technical Support</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-muted">Account Setup</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-background border-b px-4 py-3">
                    <h3 className="font-medium text-sm">Audio Analysis</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Agent Talk Time</span>
                          <span className="font-medium">65%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Customer Talk Time</span>
                          <span className="font-medium">35%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Sentiment</span>
                          <span className="font-medium">Positive</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-background border-b px-4 py-3">
                    <h3 className="font-medium text-sm">Resources</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <button 
                        onClick={exportTranscription}
                        className="flex items-center gap-2 text-sm text-primary w-full hover:underline"
                      >
                        <ArrowDownCircle size={14} />
                        <span>Export Transcript</span>
                      </button>
                      <button 
                        onClick={exportIssueSummary}
                        className="flex items-center gap-2 text-sm text-primary w-full hover:underline"
                      >
                        <ArrowDownCircle size={14} />
                        <span>Export Issue Summary</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}