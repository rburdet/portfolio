"use client"

import * as React from "react"
import { format, subDays, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

interface ActivityHeatmapProps {
  dates: Date[]
  className?: string
}

export function ActivityHeatmap({ dates, className }: ActivityHeatmapProps) {
  // Generate the last 365 days
  const today = new Date()
  const days = Array.from({ length: 365 }, (_, i) => subDays(today, i))

  // Count activities for each day
  const activityCounts = days.map(day => {
    return dates.filter(date => isSameDay(date, day)).length
  })

  // Get the maximum count for color intensity
  const maxCount = Math.max(...activityCounts)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const count = activityCounts[i]
          const intensity = count > 0 ? Math.min(count / maxCount, 1) : 0
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square w-3 rounded-sm",
                count === 0 && "bg-muted",
                count > 0 && "bg-primary",
                "transition-colors"
              )}
              style={{
                opacity: count > 0 ? 0.2 + (intensity * 0.8) : 1
              }}
              title={`${format(day, "MMM d, yyyy")}: ${count} workout${count !== 1 ? 's' : ''}`}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <span>More</span>
      </div>
    </div>
  )
} 