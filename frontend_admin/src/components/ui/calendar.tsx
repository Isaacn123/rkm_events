"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CalendarProps {
  mode?: "single" | "multiple" | "range"
  selected?: Date | Date[]
  onSelect?: (date: Date | undefined) => void
  initialFocus?: boolean
  className?: string
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, ...props }, ref) => {
    // This is a simplified calendar component
    // In a real implementation, you'd want to use a proper calendar library
    return (
      <div
        ref={ref}
        className={cn("p-3", className)}
        {...props}
      >
        <div className="text-center text-sm font-medium mb-2">
          Calendar Component
        </div>
        <div className="text-center text-xs text-gray-500">
          This is a placeholder calendar component.
          <br />
          For production use, consider using a library like react-datepicker or similar.
        </div>
      </div>
    )
  }
)
Calendar.displayName = "Calendar"

export { Calendar } 