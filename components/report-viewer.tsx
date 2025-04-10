"use client"

import ReactMarkdown from "react-markdown"
import { Card } from "@/components/ui/card"

interface ReportViewerProps {
  content: string
}

export function ReportViewer({ content }: ReportViewerProps) {
  return (
    <Card className="prose dark:prose-invert max-w-none p-6">
      <ReactMarkdown>{content}</ReactMarkdown>
    </Card>
  )
}
