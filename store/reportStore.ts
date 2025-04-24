import { create } from "zustand"

interface Report {
  id: string
  caller_name: string
  request_type: string
  date: string
  caller_sentiment: string
  report_generated: string
}

interface ReportStore {
  selectedReport: Report | null
  setSelectedReport: (report: Report) => void
}

export const useReportStore = create<ReportStore>((set) => ({
  selectedReport: null,
  setSelectedReport: (report) => set({ selectedReport: report }),
}))
