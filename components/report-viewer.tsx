"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, Clock, FileText, User, AlertCircle, CheckCircle } from "lucide-react"

interface ReportViewerProps {
  content: string;
}

export function ReportViewer({ content }: ReportViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customerInfo: true,
    sensitiveInfo: false,
    issueSummary: true,
    resolution: true,
    outcome: true,
    additional: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Extract key information from content for summary display
  const customerName = content.match(/Full Name: ([^\n]+)/)?.[1] || "Not specified";
  const issueMatch = content.match(/Issue Summary:\s*([^\n]+)/);
  const issueShort = issueMatch ? issueMatch[1].replace(/^This was /, "") : "Not specified";
  const resolution = content.includes("[ ] Resolved during call") ? "Pending" : "Resolved";

  const Section = ({ id, title, icon, children }: { id: string, title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer bg-gray-50 dark:bg-gray-800 p-3 rounded-md"
        onClick={() => toggleSection(id)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium text-lg">{title}</h3>
        </div>
        {expandedSections[id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      
      {expandedSections[id] && (
        <div className="p-3 border-l-2 border-gray-200 dark:border-gray-700 ml-2 mt-2">
          {children}
        </div>
      )}
    </div>
  );

  const MarkdownSection = ({ content }: { content: string }) => (
    <div className="prose-sm dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );

  return (
    <Card className="max-w-none overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-850 p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText size={20} />
            Customer Support Report
          </h2>
          <Badge variant={resolution === "Resolved" ? "outline" : "outline"}>
            {resolution}
          </Badge>
        </div>
        <div className="mt-2 text-sm text-gray-500 flex gap-4">
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{customerName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="formatted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formatted">Formatted Report</TabsTrigger>
          <TabsTrigger value="transcript">Raw Transcript</TabsTrigger>
        </TabsList>
        
        <TabsContent value="formatted" className="p-4">
          <div className="space-y-1 mb-4">
            <h3 className="text-lg font-medium">{issueShort}</h3>
            <p className="text-sm text-gray-500">
              {resolution === "Resolved" ? 
                <span className="flex gap-1 items-center text-green-600"><CheckCircle size={14} /> Issue resolved during call</span> : 
                <span className="flex gap-1 items-center text-amber-600"><AlertCircle size={14} /> Requires follow-up</span>
              }
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <Section id="customerInfo" title="Customer Information" icon={<User size={18} />}>
            <div className="prose-sm dark:prose-invert">
              <ReactMarkdown>
                {content.match(/1\. Customer Information:([\s\S]*?)(?=2\. Sensitive Information:)/)?.[1] || ""}
              </ReactMarkdown>
            </div>
          </Section>
          
          <Section id="sensitiveInfo" title="Sensitive Information" icon={<AlertCircle size={18} />}>
            <div className="prose-sm dark:prose-invert">
              <ReactMarkdown>
                {content.match(/2\. Sensitive Information:([\s\S]*?)(?=3\. Issue Summary:)/)?.[1] || ""}
              </ReactMarkdown>
            </div>
          </Section>
          
          <Section id="issueSummary" title="Issue Summary" icon={<FileText size={18} />}>
            <div className="prose-sm dark:prose-invert">
              <ReactMarkdown>
                {content.match(/3\. Issue Summary:([\s\S]*?)(?=4\. Resolution Details:)/)?.[1] || ""}
              </ReactMarkdown>
            </div>
          </Section>
          
          <Section id="resolution" title="Resolution Details" icon={<CheckCircle size={18} />}>
            <div className="prose-sm dark:prose-invert">
              <ReactMarkdown>
                {content.match(/4\. Resolution Details:([\s\S]*?)(?=5\. Outcome:)/)?.[1] || ""}
              </ReactMarkdown>
            </div>
          </Section>
          
          <Section id="outcome" title="Outcome" icon={<CheckCircle size={18} />}>
            <div className="prose-sm dark:prose-invert">
              <ReactMarkdown>
                {content.match(/5\. Outcome:([\s\S]*?)(?=6\. Additional Insights:)/)?.[1] || ""}
              </ReactMarkdown>
            </div>
          </Section>
          
          <Section id="additional" title="Additional Insights" icon={<FileText size={18} />}>
            <div className="prose-sm dark:prose-invert">
              <ReactMarkdown>
                {content.match(/6\. Additional Insights:([\s\S]*?)$/)?.[1] || ""}
              </ReactMarkdown>
            </div>
          </Section>
        </TabsContent>
        
        <TabsContent value="transcript" className="p-4">
          {content ? (
            <div className="whitespace-pre-wrap font-mono text-sm p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center p-6 text-gray-500">
              No raw transcript available
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}