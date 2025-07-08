"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  fromDate: string
  toDate: string
  onFromDateChange: (date: string) => void
  onToDateChange: (date: string) => void
  onClear: () => void
}

export function DateRangePicker({ fromDate, toDate, onFromDateChange, onToDateChange, onClear }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingType, setSelectingType] = useState<"from" | "to">("from")
  const [mounted, setMounted] = useState(false)

  // Fix SSR hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDisplayDate = (dateString: string) => {
    if (!dateString || !mounted) return null
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null

      const day = date.getDate()
      const month = date.toLocaleDateString("en-US", { month: "short" })
      const year = date.getFullYear().toString().slice(-2)
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
      return { day, month, year, dayName, full: `${day} ${month}'${year}` }
    } catch (error) {
      console.error("Error formatting date:", error)
      return null
    }
  }

  const fromDateFormatted = formatDisplayDate(fromDate)
  const toDateFormatted = formatDisplayDate(toDate)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getNextMonth = (date: Date) => {
    const nextMonth = new Date(date)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return nextMonth
  }

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]

    if (selectingType === "from") {
      onFromDateChange(dateString)
      setSelectingType("to")
    } else {
      onToDateChange(dateString)
      setIsOpen(false)
      setSelectingType("from")
    }
  }

  const isDateSelected = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return dateString === fromDate || dateString === toDate
  }

  const isDateInRange = (date: Date) => {
    if (!fromDate || !toDate) return false
    const dateString = date.toISOString().split("T")[0]
    return dateString > fromDate && dateString < toDate
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <div className="flex-1 h-16 bg-gray-100 rounded-xl animate-pulse" />
        <div className="flex-1 h-16 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  const currentMonthDays = getDaysInMonth(currentMonth)
  const nextMonth = getNextMonth(currentMonth)
  const nextMonthDays = getDaysInMonth(nextMonth)

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal h-auto p-3 rounded-xl",
              !fromDate && "text-muted-foreground",
            )}
          >
            <div className="flex items-center gap-2 w-full">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <div className="text-xs text-blue-500 font-medium">From Date</div>
                {fromDateFormatted ? (
                  <div>
                    <div className="font-semibold text-lg">{fromDateFormatted.full}</div>
                    <div className="text-xs text-gray-500">{fromDateFormatted.dayName}</div>
                  </div>
                ) : (
                  <div className="text-sm">Select date</div>
                )}
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal h-auto p-3 rounded-xl",
              !toDate && "text-muted-foreground",
            )}
          >
            <div className="flex items-center gap-2 w-full">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <div className="text-xs text-blue-500 font-medium">To Date</div>
                {toDateFormatted ? (
                  <div>
                    <div className="font-semibold text-lg">{toDateFormatted.full}</div>
                    <div className="text-xs text-gray-500">{toDateFormatted.dayName}</div>
                  </div>
                ) : (
                  <div className="text-sm">Select date</div>
                )}
              </div>
            </div>
          </Button>

          {(fromDate || toDate) && (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="rounded-xl"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">
              {selectingType === "from" ? "Select From Date" : "Select To Date"}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-4">
            {/* Current Month */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="h-6 w-6">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-semibold text-sm">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
                <div className="w-6" />
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
                {currentMonthDays.map((date, index) => (
                  <div key={index} className="p-1">
                    {date ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDateClick(date)}
                        className={cn(
                          "h-8 w-8 p-0 font-normal rounded-full",
                          isDateSelected(date) && "bg-blue-500 text-white hover:bg-blue-600",
                          isDateInRange(date) && "bg-blue-100 text-blue-900",
                          date.toDateString() === new Date().toDateString() && "border border-blue-500",
                        )}
                      >
                        {date.getDate()}
                      </Button>
                    ) : (
                      <div className="h-8 w-8" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Month */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-6" />
                <div className="font-semibold text-sm">
                  {nextMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="h-6 w-6">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
                {nextMonthDays.map((date, index) => (
                  <div key={index} className="p-1">
                    {date ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDateClick(date)}
                        className={cn(
                          "h-8 w-8 p-0 font-normal rounded-full",
                          isDateSelected(date) && "bg-blue-500 text-white hover:bg-blue-600",
                          isDateInRange(date) && "bg-blue-100 text-blue-900",
                          date.toDateString() === new Date().toDateString() && "border border-blue-500",
                        )}
                      >
                        {date.getDate()}
                      </Button>
                    ) : (
                      <div className="h-8 w-8" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={onClear} className="text-xs">
              Clear Dates
            </Button>
            <div className="text-xs text-gray-500">
              {selectingType === "from" ? "Select from date first" : "Select to date"}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
