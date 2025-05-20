"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import ChatBox from "@/components/chat-box"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ReportPage() {
  const params = useParams()
  const [transcription, setTranscription] = useState("")
  const [calllog, setCalllog] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

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
      } catch (err: any) {
        setError(err.message)
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
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading report data...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <Tabs defaultValue="chatbit" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
          <TabsTrigger value="chatbit">Chatbot</TabsTrigger>
          <TabsTrigger value="tarsseption">Transcription</TabsTrigger>
          <TabsTrigger value="calllog">Call log</TabsTrigger>
        </TabsList>

        <TabsContent value="chatbit">
          <ChatBox />
        </TabsContent>

        <TabsContent value="tarsseption">
          <div className="min-h-5 text-gray-200 flex items-center justify-center px-6">
            <p className="max-w-2xl text-lg leading-relaxed font-light tracking-wide">
              {transcription}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="calllog">
          <div className="p-4 border rounded-md whitespace-pre-wrap">
            {error ? `Error: ${error}` : calllog}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
