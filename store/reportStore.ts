import { create } from "zustand"

interface Report {
  id: string
  caller_name: string
  call_date: string
  request_type: string
  caller_sentiment: string
  transcription: string
  call_log: string
  report_generated: string
  [key: string]: any
}

interface ReportStore {
  selectedReport: Report | null
  setSelectedReport: (report: Report | null) => void
}

export const useReportStore = create<ReportStore>((set) => ({
  selectedReport: null,
  setSelectedReport: (report) => set({ selectedReport: report }),
}))
