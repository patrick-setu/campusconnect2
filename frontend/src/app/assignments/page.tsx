"use client"

import React, { useEffect, useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@/components/ui/Dialog"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { assignmentAPI } from "@/services/api"
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameDay, parseISO } from "date-fns"

// assignment tracker page
export default function AssignmentsPage() {
  const { user } = useRequireAuth(true)
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  // form values for the add assignment modal
  const [course, setCourse] = useState("")
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [dueDate, setDueDate] = useState("")

  // load assignments for the current user
  const loadAssignments = async () => {
    setLoading(true)
    try {
      const res = await assignmentAPI.getAssignments()
      if (res.success && res.data) {
        setAssignments(res.data.assignments)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssignments()
  }, [])

  // save new assignment then refresh the list
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await assignmentAPI.createAssignment({ course_code: course, title, details, due_date: dueDate })
      if (res.success) {
        setOpen(false)
        setCourse("")
        setTitle("")
        setDetails("")
        setDueDate("")
        await loadAssignments()
      } else {
        alert(res.message)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to create assignment')
    }
  }

  // which month the calendar is showing
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // month navigation
  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }
  
  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  // build the month grid
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  
  const weeks: Date[][] = []
  let current = startDate
  while (current <= monthEnd || weeks.length < 6) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(current)
      current = addDays(current, 1)
    }
    weeks.push(week)
    if (weeks.length > 6) break
  }

  // helper to get assignments by day
  const assignmentsForDay = (day: Date) =>
    assignments.filter((a) => {
      try {
        const d = parseISO(a.due_date)
        return isSameDay(d, day)
      } catch {
        return false
      }
    })

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Assignment Tracker</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => setOpen(true)} variant="primary">Add Assignment</Button>
          </div>
        </div>

        <Card className="p-4">
          {/* month navigation buttons */}
          <div className="flex items-center justify-between mb-4">
            <Button onClick={prevMonth} variant="ghost" className="p-2">
              <span className="sr-only">Previous month</span>
              ←
            </Button>
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button onClick={nextMonth} variant="ghost" className="p-2">
              <span className="sr-only">Next month</span>
              →
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-sm text-gray-600 mb-2">
            <div className="text-center font-medium">Mon</div>
            <div className="text-center font-medium">Tue</div>
            <div className="text-center font-medium">Wed</div>
            <div className="text-center font-medium">Thu</div>
            <div className="text-center font-medium">Fri</div>
            <div className="text-center font-medium">Sat</div>
            <div className="text-center font-medium">Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weeks.map((week, wi) => (
              <React.Fragment key={wi}>
                {week.map((day) => (
                  <div 
                    key={day.toISOString()} 
                    className={`border rounded p-2 min-h-[80px] relative ${
                      isSameDay(day, new Date()) ? 'bg-blue-50' : 
                      format(day, 'MM') !== format(currentDate, 'MM') ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1 flex justify-between items-center">
                      <span>{format(day, 'd')}</span>
                      {format(day, 'MM') !== format(currentDate, 'MM') && (
                        <span className="text-xs text-gray-400">{format(day, 'MMM')}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {assignmentsForDay(day).map((a) => (
                        <div key={a.id} className="text-sm bg-primary-50 text-primary-700 rounded px-2 py-1">
                          <div className="font-semibold">{a.title}</div>
                          {a.course_code && <div className="text-xs">{a.course_code}</div>}
                          <div className="text-xs text-gray-500">{format(parseISO(a.due_date), 'h:mm a')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </Card>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Add Assignment</DialogTitle>
          <form onSubmit={onSubmit}>
            <DialogContent>
              <div className="grid grid-cols-1 gap-3">
                <Input label="Class / Course Code" value={course} onChange={(e) => setCourse(e.target.value)} />
                <Input label="Assignment Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <label className="block text-sm font-medium text-gray-700">Details</label>
                <textarea className="block w-full px-3 py-2 border border-gray-300 rounded-md" value={details} onChange={(e) => setDetails(e.target.value)} />
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input type="datetime-local" className="block w-full px-3 py-2 border border-gray-300 rounded-md" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
              </div>
            </DialogContent>
            <DialogActions>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save</Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    </Layout>
  )
}
