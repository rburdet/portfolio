"use client";

import * as React from "react";
import {
	format,
	isSameDay,
	startOfWeek,
	addWeeks,
	addDays,
	getMonth,
	getYear,
	startOfYear,
	isBefore,
	isAfter,
} from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
	dates: Date[];
	className?: string;
	startYear?: number;
}

const START_YEAR = 2024;

export function ActivityHeatmap({
	dates,
	className,
	startYear = START_YEAR,
}: ActivityHeatmapProps) {
	const currentYear = new Date().getFullYear();
	const availableYears = Array.from(
		{ length: currentYear - startYear + 1 },
		(_, i) => startYear + i,
	);

	const [selectedYear, setSelectedYear] = React.useState(currentYear);

	const numWeeks = 53;
	const selectedDays = [0, 1, 2, 3, 4, 5, 6];
	const daysToShow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	const startDate = startOfYear(new Date(selectedYear, 0, 1));
	const firstWeekStart = startOfWeek(startDate, { weekStartsOn: 0 });

	const weekStarts = Array.from({ length: numWeeks }, (_, i) =>
		addWeeks(firstWeekStart, i),
	);

	const today = new Date();
	today.setHours(23, 59, 59, 999);

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
	if (currentColSpan > 0) {
		monthLabels.push({
			label: format(weekStarts[weekStarts.length - 1], "MMM"),
			colSpan: currentColSpan,
		});
	}

	const yearStart = new Date(selectedYear, 0, 1);
	const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

	const totalWorkouts = dates.filter((date) => {
		return !isBefore(date, yearStart) && !isAfter(date, yearEnd);
	}).length;

	return (
		<div className={cn("flex flex-col space-y-4", className)}>
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					<span className="font-medium text-foreground">{totalWorkouts}</span>{" "}
					workouts in {selectedYear}
				</div>
				<div className="flex gap-1">
					{availableYears.map((year) => (
						<button
							type="button"
							key={year}
							onClick={() => setSelectedYear(year)}
							className={cn(
								"px-3 py-1 text-sm rounded-md transition-colors",
								selectedYear === year
									? "bg-primary text-primary-foreground"
									: "bg-muted hover:bg-muted/80 text-muted-foreground",
							)}
						>
							{year}
						</button>
					))}
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="border-separate border-spacing-1">
					<thead>
						<tr>
							<th className="w-8" />
							{monthLabels.map((month, idx) => (
								<th
									key={`${month.label}-${idx}`}
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
									const cellDate = addDays(weekStart, day);
									const isInSelectedYear = getYear(cellDate) === selectedYear;
									const isFutureDate = isAfter(cellDate, today);
									const isPastYear = isBefore(cellDate, yearStart);

									if (!isInSelectedYear || isPastYear) {
										return (
											<td key={cellDate.toISOString()} className="p-0">
												<div className="h-4 w-4" />
											</td>
										);
									}

									if (isFutureDate) {
										return (
											<td key={cellDate.toISOString()} className="p-0">
												<div
													className="h-4 w-4 rounded-sm bg-muted/20"
													title={`${format(cellDate, "MMM d, yyyy")}: Future`}
												/>
											</td>
										);
									}

									const count = dates.filter((date) =>
										isSameDay(date, cellDate),
									).length;

									const getIntensityColor = (c: number) => {
										if (c === 0) return "bg-muted/40";
										if (c === 1) return "bg-green-400";
										if (c === 2) return "bg-green-500";
										if (c === 3) return "bg-green-600";
										return "bg-green-700";
									};

									return (
										<td key={cellDate.toISOString()} className="p-0">
											<div
												className={cn(
													"h-4 w-4 rounded-sm transition-colors",
													getIntensityColor(count),
												)}
												title={`${format(cellDate, "MMM d, yyyy")}: ${count} workout${count !== 1 ? "s" : ""}`}
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
