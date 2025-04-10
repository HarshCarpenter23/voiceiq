export interface Report {
  id: string
  title: string
  audioFile: string
  date: string
  status: string
  duration: string
  fileSize: string
  content: string
}

const sampleReports: Report[] = [
  {
    id: "sample-report",
    title: "Customer Service Call Analysis",
    audioFile: "customer-service-call-1234.mp3",
    date: "April 8, 2025",
    status: "Completed",
    duration: "12:34",
    fileSize: "24.5 MB",
    content: `# Customer Service Call Analysis

## Overview
This report provides an analysis of the customer service call recorded on April 8, 2025. The call was between a customer service representative (CSR) and a customer regarding a billing issue.

## Call Summary
- **Call Duration**: 12:34
- **Customer Sentiment**: Initially frustrated, ended neutral
- **Issue Resolution**: Partial resolution, follow-up required
- **Sensitive Information**: All PII has been masked in this report

## Key Insights

### Customer Concerns
1. Unexpected charges on monthly bill
2. Previous credit not applied to account
3. Confusion about service plan details

### CSR Performance
- **Greeting**: Professional and prompt
- **Active Listening**: Demonstrated good listening skills
- **Problem Solving**: Identified billing error correctly
- **Resolution**: Provided partial resolution with clear next steps

### Compliance Check
- Credit card information properly masked (XXXX-XXXX-XXXX-1234)
- Address information not collected
- Identity verification followed protocol

## Recommendations
1. Follow up with customer within 24 hours to confirm credit application
2. Review billing system for similar errors affecting other customers
3. Consider additional training for explaining service plan details

## Transcript Highlights

> **CSR**: "Thank you for calling customer service. My name is [REDACTED]. How can I help you today?"
>
> **Customer**: "I'm calling about my bill. There's a charge here I don't recognize for $49.99."
>
> **CSR**: "I understand your concern. Let me look into that for you right away..."
>
> [...]
>
> **CSR**: "I've identified the error. That charge was applied incorrectly. I'll remove it from your account immediately."
>
> **Customer**: "What about the credit from last month? That still hasn't been applied."
>
> [...]
>
> **CSR**: "I've submitted the request for the credit. It should appear on your next statement. Is there anything else I can help with today?"

## Action Items
- [ ] Process billing adjustment
- [ ] Apply previous credit
- [ ] Schedule follow-up call
- [ ] Update customer account notes`,
  },
  {
    id: "report-2",
    title: "Support Ticket Analysis",
    audioFile: "support-ticket-5678.mp3",
    date: "April 7, 2025",
    status: "Completed",
    duration: "08:45",
    fileSize: "18.2 MB",
    content: "# Support Ticket Analysis\n\n## Overview\nThis report analyzes the support ticket call...",
  },
  {
    id: "report-3",
    title: "Sales Call Evaluation",
    audioFile: "sales-call-9012.mp3",
    date: "April 6, 2025",
    status: "Completed",
    duration: "15:22",
    fileSize: "30.1 MB",
    content: "# Sales Call Evaluation\n\n## Overview\nThis report evaluates the sales call performance...",
  },
  {
    id: "report-4",
    title: "Customer Feedback Analysis",
    audioFile: "customer-feedback-3456.mp3",
    date: "April 5, 2025",
    status: "Completed",
    duration: "10:15",
    fileSize: "20.8 MB",
    content: "# Customer Feedback Analysis\n\n## Overview\nThis report analyzes customer feedback...",
  },
  {
    id: "report-5",
    title: "Team Meeting Summary",
    audioFile: "team-meeting-recording.mp3",
    date: "April 4, 2025",
    status: "Completed",
    duration: "45:30",
    fileSize: "92.3 MB",
    content: "# Team Meeting Summary\n\n## Overview\nThis report summarizes the team meeting discussion...",
  },
]

export function getSampleReports(): Report[] {
  return sampleReports
}

export function getSampleReport(id: string): Report | undefined {
  return sampleReports.find((report) => report.id === id)
}
