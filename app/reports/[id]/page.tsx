"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import ChatBox from "@/components/chat-box"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, FileAudio, MessageCircle, Clock, Phone, Info, ArrowDownCircle } from "lucide-react"
import { cn } from "@/lib/utils"

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
    callEvents: []
  })

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
        
        // Parse call log for events to display in timeline
        const callEvents = parseCallLogEvents(result.call_log || "");
        
        // Extract metadata if available
        setMetadata({
          date: result.call_date || new Date().toLocaleDateString(),
          duration: result.call_duration || "Unknown",
          caller: result.caller_name || "Unknown caller",
          callEvents: callEvents
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

  // Parse call log to extract meaningful events for timeline display
  const parseCallLogEvents = (rawLog) => {
    // Simple example parsing - in production you'd want more sophisticated parsing
    const events = [];
    
    // Try to extract timestamps and events from logs
    const lines = rawLog.split('\n').filter(line => line.trim().length > 0);
    
    lines.forEach((line, index) => {
      // Look for timestamp patterns like [10:45:32]
      const timestampMatch = line.match(/\[(\d{2}:\d{2}:\d{2})\]/);
      
      if (timestampMatch) {
        const timestamp = timestampMatch[1];
        const eventText = line.replace(/\[\d{2}:\d{2}:\d{2}\]/, '').trim();
        
        // Categorize events
        let eventType = "info";
        if (eventText.toLowerCase().includes("connected")) eventType = "connected";
        if (eventText.toLowerCase().includes("disconnected")) eventType = "disconnected";
        if (eventText.toLowerCase().includes("error")) eventType = "error";
        if (eventText.toLowerCase().includes("waiting")) eventType = "waiting";
        
        events.push({
          time: timestamp,
          text: eventText,
          type: eventType
        });
      }
    });
    
    // If parsing failed to extract events, create some placeholder events
    if (events.length === 0) {
      // Extract time parts from the duration if available
      const durationParts = metadata.duration.split(':');
      const minutes = durationParts.length > 0 ? parseInt(durationParts[0]) : 0;
      
      events.push(
        { time: "00:00:00", text: "Call initiated", type: "connected" },
        { time: `00:0${Math.floor(minutes/3)}:00`, text: "Discussion of product features", type: "info" },
        { time: `00:0${Math.floor(minutes*2/3)}:00`, text: "Support issue resolution", type: "info" },
        { time: metadata.duration, text: "Call completed", type: "disconnected" }
      );
    }
    
    return events;
  };

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
            <div className="space-y-6 pb-10">
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
          </TabsContent>

          <TabsContent value="chatbot" className="focus:outline-none">
            <div className="bg-card rounded-lg p-4 h-[calc(100vh-280px)] min-h-[500px] border">
              <ChatBox />
            </div>
          </TabsContent>

          <TabsContent value="calllog" className="focus:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
              {/* Call Timeline - Mac-inspired design */}
              <div className="col-span-2 bg-background rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-background border-b px-6 py-4 flex items-center justify-between">
                  <h3 className="font-medium text-sm">Call Timeline</h3>
                  <button className="text-xs text-primary hover:underline">Export</button>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">
                  <div className="relative pl-8 pb-2">
                    <div className="absolute left-3 top-1 bottom-0 w-px bg-border"></div>
                    
                    {metadata.callEvents.map((event, index) => (
                      <div key={index} className="mb-6 relative">
                        <div className={cn(
                          "absolute left-[-25px] top-0 h-5 w-5 rounded-full flex items-center justify-center",
                          event.type === "connected" ? "bg-green-100 text-green-600" : 
                          event.type === "disconnected" ? "bg-red-100 text-red-600" :
                          event.type === "error" ? "bg-amber-100 text-amber-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          <div className="h-2 w-2 rounded-full bg-current"></div>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">{event.time}</div>
                        <div className="text-sm">{event.text}</div>
                      </div>
                    ))}
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
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <ArrowDownCircle size={14} />
                        <span className="hover:underline cursor-pointer">Download Audio</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <ArrowDownCircle size={14} />
                        <span className="hover:underline cursor-pointer">Export Transcript</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <ArrowDownCircle size={14} />
                        <span className="hover:underline cursor-pointer">Export Call Log</span>
                      </div>
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