"use client"

import * as React from "react"
import { format, isSameDay, startOfWeek, addWeeks, getMonth, getYear } from "date-fns"
import { cn } from "@/lib/utils"

interface ActivityHeatmapProps {
  dates: Date[]
  className?: string
}

export function ActivityHeatmap({ dates, className }: ActivityHeatmapProps) {
  // Show 52 weeks (1 year)
  const numWeeks = 52;
  // Show Sun, Tue, Thu, Sat
  const selectedDays = [0, 2, 4, 6];
  const daysToShow = ["Sun", "Tue", "Thu", "Sat"];

  // Generate week start dates (columns)
  const today = new Date();
  const weekStarts = Array.from({ length: numWeeks }, (_, i) =>
    startOfWeek(addWeeks(today, -numWeeks + i + 1), { weekStartsOn: 0 })
  );

  // Build month header with colSpan
  const monthLabels: { label: string; colSpan: number }[] = [];
  let lastMonth = -1;
  let lastYear = -1;
  let currentColSpan = 0;
  for (let i = 0; i < weekStarts.length; i++) {
    const m = getMonth(weekStarts[i]);
    const y = getYear(weekStarts[i]);
    if (m !== lastMonth || y !== lastYear) {
      if (currentColSpan > 0) {
        monthLabels.push({
          label: format(weekStarts[i - 1], "MMM"),
          colSpan: currentColSpan,
        });
      }
      lastMonth = m;
      lastYear = y;
      currentColSpan = 1;
    } else {
      currentColSpan++;
    }
  }
  // Push the last month
  if (currentColSpan > 0) {
    monthLabels.push({
      label: format(weekStarts[weekStarts.length - 1], "MMM"),
      colSpan: currentColSpan,
    });
  }

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-8"></th>
              {monthLabels.map((month, idx) => (
                <th
                  key={idx}
                  className="text-xs text-muted-foreground font-normal text-center"
                  colSpan={month.colSpan}
                >
                  {month.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedDays.map((day, rowIndex) => (
              <tr key={day}>
                <td className="text-xs text-muted-foreground pr-2 align-middle">
                  {daysToShow[rowIndex]}
                </td>
                {weekStarts.map((weekStart, colIndex) => {
                  const cellDate = new Date(weekStart);
                  cellDate.setDate(cellDate.getDate() + day);
                  const count = dates.filter(date => isSameDay(date, cellDate)).length;
                  const intensity = count > 0 ? Math.min(count, 4) : 0;
                  return (
                    <td key={colIndex} className="p-0">
                      <div
                        className={cn(
                          "h-4 w-4 rounded-sm",
                          count === 0 && "bg-muted/40",
                          count > 0 && "bg-primary",
                          "transition-colors"
                        )}
                        style={{
                          opacity: intensity === 0 ? 0.2 : 0.3 + (intensity * 0.175)
                        }}
                        title={`${format(cellDate, "MMM d, yyyy")}: ${count} workout${count !== 1 ? 's' : ''}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
