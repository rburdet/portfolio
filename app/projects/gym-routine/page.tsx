"use client"

import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { workoutRoutine } from "./workout-config"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { format, isSameDay } from "date-fns"
import { toast } from "sonner"
import { ActivityHeatmap } from "@/components/ui/activity-heatmap"

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const routineWeekMap = {
  1: "day1", // Monday
  2: "day2", // Tuesday
  3: "day3", // Wednesday
  4: "day4", // Thursday
  5: "day5", // Friday
};
const today = new Date();
const todayIndex = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
const todayRoutineId = `day${todayIndex}`;

export default function GymRoutinePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [completedDates, setCompletedDates] = useState<Date[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [activeDay, setActiveDay] = useState(todayRoutineId)
  
  // Fetch workout history when component mounts
  useEffect(() => {
    async function fetchWorkoutHistory() {
      try {
        setIsLoadingHistory(true)
        const userId = "user-1" // In a real app, this would be the logged-in user's ID
        
        const response = await fetch(`/api/workout/history?userId=${userId}`)
        
        if (response.ok) {
          const data = await response.json()
          
          // Convert string dates to Date objects
          const dates = data.dates.map((dateStr: string) => new Date(dateStr))
          setCompletedDates(dates)
        } else {
          console.error("Failed to fetch workout history")
        }
      } catch (error) {
        console.error("Error fetching workout history:", error)
      } finally {
        setIsLoadingHistory(false)
      }
    }
    
    fetchWorkoutHistory()
  }, [])
  

  // Convert completedDates to activity-graph data format
  const activityData = useMemo(() => {
    const data: Record<string, { title: string; parts: string[] }> = {};
    completedDates.forEach(date => {
      const dateStr = date.toISOString().split("T")[0];
      data[dateStr] = {
        title: "Workout completed",
        parts: ["level-2"] // You can adjust this for intensity if needed
      };
    });
    return data;
  }, [completedDates]);

  // Function to record a completed workout
  async function recordWorkout() {
    try {
      setIsLoading(true)
      
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const userId = "user-1" // In a real app, this would be the logged-in user's ID
      
      const response = await fetch("/api/workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          date: dateStr,
          dayId: activeDay,
          completed: true,
          exercises: []
        }),
      })
      
      if (response.ok) {
        toast.success(`Workout recorded for ${format(selectedDate, "PP")}`)
        setCompletedDates([...completedDates, selectedDate])
      } else {
        const error = await response.json()
        toast.error(`Failed to record workout: ${error.error}`)
      }
    } catch (error) {
      console.error("Error recording workout:", error)
      toast.error("Failed to record workout")
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date();
  const alreadyCompletedToday = completedDates.some(date => isSameDay(date, today));

  return (
    <div className="container px-4 py-16 md:py-24 pb-32">
      <Link href="/projects" className="text-muted-foreground hover:text-foreground mb-8 inline-block">
        ← Back to all projects
      </Link>
      <h1 className="text-4xl font-mono tracking-tight md:text-5xl mb-8">My Gym Routine</h1>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">7-Day Workout Routine</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={todayRoutineId} className="w-full" onValueChange={setActiveDay}>
                <TabsList className="flex w-full overflow-x-auto pb-2 md:pb-0 md:grid md:grid-cols-7">
                  {workoutRoutine.map((day, idx) => (
                    <TabsTrigger 
                      key={day.id} 
                      value={day.id}
                      className="whitespace-nowrap"
                    >
                      {weekdayNames[idx]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {workoutRoutine.map((day) => (
                  <TabsContent key={day.id} value={day.id}>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{day.title}</h3>
                          {day.description && <p className="text-muted-foreground">{day.description}</p>}
                        </div>
                      </div>

                      {/* Warmup Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Warmup</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40%]">Exercise</TableHead>
                              <TableHead className="w-[15%] text-center">Sets</TableHead>
                              <TableHead className="w-[30%] text-center">Reps</TableHead>
                              <TableHead className="w-[15%] text-center">Weight</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day.warmup.map((exercise, index) => (
                              <TableRow key={index}>
                                <TableCell>{exercise.name}</TableCell>
                                <TableCell className="text-center">{exercise.sets}</TableCell>
                                <TableCell className="text-center">{exercise.reps}</TableCell>
                                <TableCell className="text-center">{exercise.weight || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <Separator />

                      {/* Main Exercises Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Main Exercises</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40%]">Exercise</TableHead>
                              <TableHead className="w-[15%] text-center">Sets</TableHead>
                              <TableHead className="w-[30%] text-center">Reps</TableHead>
                              <TableHead className="w-[15%] text-center">Weight</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day.exercises.map((exercise, index) => (
                              <TableRow key={index}>
                                <TableCell>{exercise.name}</TableCell>
                                <TableCell className="text-center">{exercise.sets}</TableCell>
                                <TableCell className="text-center">{exercise.reps}</TableCell>
                                <TableCell className="text-center">{exercise.weight || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <Separator />

                      {/* Elongation Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Elongation</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40%]">Exercise</TableHead>
                              <TableHead className="w-[15%] text-center">Sets</TableHead>
                              <TableHead className="w-[30%] text-center">Reps</TableHead>
                              <TableHead className="w-[15%] text-center">Weight</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day.elongation.map((exercise, index) => (
                              <TableRow key={index}>
                                <TableCell>{exercise.name}</TableCell>
                                <TableCell className="text-center">{exercise.sets}</TableCell>
                                <TableCell className="text-center">{exercise.reps}</TableCell>
                                <TableCell className="text-center">{exercise.weight || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Track Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Use the tables above to track your weights and progress over time.
              </p>
              <p className="text-muted-foreground mt-4">
                <Link href="/exercises" className="text-primary hover:text-primary/80">
                  View exercise tracker
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Workout Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Your workout activity over the last year.
                </p>
                <div className="my-4">
                  <ActivityHeatmap dates={completedDates} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky button at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
        <div className="container flex justify-center">
          <Button 
            size="lg" 
            onClick={recordWorkout} 
            disabled={isLoading || alreadyCompletedToday}
            className="w-full max-w-md"
          >
            {alreadyCompletedToday
              ? "Today's Workout Already Logged"
              : isLoading
                ? "Recording..."
                : "Mark Today's Workout as Completed"}
          </Button>
        </div>
      </div>
    </div>
  )
} 