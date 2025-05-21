"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Check, Clock, Filter, MoreHorizontal, Phone, Plus, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import type { Lead, LeadSource, LeadStatus } from "@/lib/types"

// Define types locally that are not exported from types
type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled"
type TaskPriority = "low" | "medium" | "high"
type Task = {
  id: string
  title: string
  description: string
  dueDate: string | Date
  priority: TaskPriority
  assignedTo: string
  leadId: string
  status: TaskStatus
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

export default function CRMDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [authIsLoading, setAuthIsLoading] = useState(true)

  useEffect(() => {
    if (!user && !authIsLoading) {
      router.push("/admin/login")
    }
  }, [user, router, authIsLoading])

  useEffect(() => {
    if (user) {
      setAuthIsLoading(false)
    }
  }, [user])

  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [dataIsLoading, setDataIsLoading] = useState(true)

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all")
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all")
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | "all">("all")
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<TaskPriority | "all">("all")

  // Dialog states
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [showViewLeadDialog, setShowViewLeadDialog] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Form states
  const [newLead, setNewLead] = useState<{
    name: string
    email: string
    phone: string
    interest: string
    source: LeadSource
    notes: string
  }>({
    name: "",
    email: "",
    phone: "",
    interest: "",
    source: "website",
    notes: "",
  })

  const [newTask, setNewTask] = useState<{
    title: string
    description: string
    dueDate: string
    priority: TaskPriority
    assignedTo: string
    leadId: string
  }>({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    assignedTo: "",
    leadId: "",
  })

  // Fetch leads and tasks from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataIsLoading(true)

        // Fetch leads
        const leadsResponse = await fetch("/api/leads")
        const leadsData = await leadsResponse.json()

        // Fetch tasks
        const tasksResponse = await fetch("/api/tasks")
        const tasksData = await tasksResponse.json()

        if (leadsData.leads) {
          setLeads(leadsData.leads)
          setFilteredLeads(leadsData.leads)
        }

        if (tasksData.tasks) {
          setTasks(tasksData.tasks)
          setFilteredTasks(tasksData.tasks)
        }
      } catch (error) {
        console.error("Error fetching CRM data:", error)
        toast({
          title: "Error",
          description: "Failed to load CRM data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setDataIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter leads based on search query and filters
  useEffect(() => {
    let filtered = leads

    // Apply search query filter
    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.phone.includes(searchQuery) ||
          lead.interest.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    // Apply source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((lead) => lead.source === sourceFilter)
    }

    setFilteredLeads(filtered)
  }, [searchQuery, statusFilter, sourceFilter, leads])

  // Filter tasks based on filters
  useEffect(() => {
    let filtered = tasks

    // Apply status filter
    if (taskStatusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === taskStatusFilter)
    }

    // Apply priority filter
    if (taskPriorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === taskPriorityFilter)
    }

    setFilteredTasks(filtered)
  }, [taskStatusFilter, taskPriorityFilter, tasks])

  // Handle adding a new lead
  const handleAddLead = async () => {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newLead,
          status: "new",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create lead")
      }

      // Add the new lead to the state
      const newLeadWithId: Lead = {
        id: data.leadId,
        ...newLead,
        status: "new",
        lastContact: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setLeads((prev) => [newLeadWithId, ...prev])
      setShowAddLeadDialog(false)

      // Reset form
      setNewLead({
        name: "",
        email: "",
        phone: "",
        interest: "",
        source: "website",
        notes: "",
      })

      toast({
        title: "Success",
        description: "Lead created successfully",
      })
    } catch (error) {
      console.error("Error creating lead:", error)
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle adding a new task
  const handleAddTask = async () => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTask,
          status: "pending",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create task")
      }

      // Add the new task to the state
      const newTaskWithId: Task = {
        id: data.taskId,
        ...newTask,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      setTasks((prev) => [newTaskWithId, ...prev])
      setShowAddTaskDialog(false)

      // Reset form
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        assignedTo: "",
        leadId: "",
      })

      toast({
        title: "Success",
        description: "Task created successfully",
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle updating lead status
  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update lead status")
      }

      // Update lead in state
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                status: newStatus,
                updatedAt: new Date(),
              }
            : lead,
        ),
      )

      toast({
        title: "Success",
        description: "Lead status updated successfully",
      })
    } catch (error) {
      console.error("Error updating lead status:", error)
      toast({
        title: "Error",
        description: "Failed to update lead status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle updating task status
  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          completedAt: newStatus === "completed" ? new Date() : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update task status")
      }

      // Update task in state
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: newStatus,
                completedAt: newStatus === "completed" ? new Date() : null,
                updatedAt: new Date(),
              }
            : task,
        ),
      )

      toast({
        title: "Success",
        description: "Task status updated successfully",
      })
    } catch (error) {
      console.error("Error updating task status:", error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // View lead details
  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead)
    setShowViewLeadDialog(true)
  }

  // Format date for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get status badge color
  const getLeadStatusColor = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "qualified":
        return "bg-green-100 text-green-800"
      case "unqualified":
        return "bg-red-100 text-red-800"
      case "converted":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get task priority badge color
  const getTaskPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get task status badge color
  const getTaskStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate if a task is overdue
  const isTaskOverdue = (task: Task) => {
    if (task.status === "completed" || task.status === "cancelled") return false
    const dueDate = new Date(task.dueDate)
    return dueDate < new Date()
  }

  if (dataIsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading CRM data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-500">Manage leads, tasks, and client relationships</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowAddLeadDialog(true)} className="bg-green-700 hover:bg-green-800">
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
          <Button onClick={() => setShowAddTaskDialog(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search leads..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="unqualified">Unqualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as LeadSource | "all")}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Source</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_sources">All Sources</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="property_portal">Property Portal</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="mb-1 text-lg font-medium">No leads found</h3>
              <p className="text-sm text-gray-500">
                {leads.length > 0 ? "Try adjusting your search or filters" : "Get started by adding your first lead"}
              </p>
              {leads.length === 0 && (
                <Button onClick={() => setShowAddLeadDialog(true)} className="mt-4 bg-green-700 hover:bg-green-800">
                  <Plus className="mr-2 h-4 w-4" /> Add Lead
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border">
              <div className="grid grid-cols-12 border-b bg-muted p-3 text-sm font-medium">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-2">Interest</div>
                <div className="col-span-1">Source</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Last Contact</div>
                <div className="col-span-1">Actions</div>
              </div>
              <div className="divide-y">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="grid grid-cols-12 items-center p-3 text-sm">
                    <div className="col-span-3 font-medium">{lead.name}</div>
                    <div className="col-span-2">
                      <div>{lead.email}</div>
                      <div className="text-gray-500">{lead.phone}</div>
                    </div>
                    <div className="col-span-2">{lead.interest}</div>
                    <div className="col-span-1 capitalize">{lead.source.replace("_", " ")}</div>
                    <div className="col-span-1">
                      <Badge className={getLeadStatusColor(lead.status)} variant="outline">
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="col-span-2">{lead.lastContact ? formatDate(lead.lastContact) : "Never"}</div>
                    <div className="col-span-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewLead(lead)}>View Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleUpdateLeadStatus(lead.id, "new")}>
                            New
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateLeadStatus(lead.id, "contacted")}>
                            Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateLeadStatus(lead.id, "qualified")}>
                            Qualified
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateLeadStatus(lead.id, "unqualified")}>
                            Unqualified
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateLeadStatus(lead.id, "converted")}>
                            Converted
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1"></div>
            <div className="flex gap-2">
              <Select
                value={taskStatusFilter}
                onValueChange={(value) => setTaskStatusFilter(value as TaskStatus | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={taskPriorityFilter}
                onValueChange={(value) => setTaskPriorityFilter(value as TaskPriority | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Priority</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_priorities">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="mb-1 text-lg font-medium">No tasks found</h3>
              <p className="text-sm text-gray-500">
                {tasks.length > 0 ? "Try adjusting your filters" : "Get started by adding your first task"}
              </p>
              {tasks.length === 0 && (
                <Button onClick={() => setShowAddTaskDialog(true)} className="mt-4 bg-green-700 hover:bg-green-800">
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <Card key={task.id} className={isTaskOverdue(task) ? "border-red-300" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{task.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit Task</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, "pending")}>
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, "in_progress")}>
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, "completed")}>
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, "cancelled")}>
                            Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>
                      {task.leadId && (
                        <span className="text-xs text-gray-500">
                          Lead: {leads.find((l) => l.id === task.leadId)?.name || "Unknown"}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className={getTaskStatusColor(task.status)} variant="outline">
                        {task.status.replace("_", " ").charAt(0).toUpperCase() + task.status.replace("_", " ").slice(1)}
                      </Badge>
                      <Badge className={getTaskPriorityColor(task.priority)} variant="outline">
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </Badge>
                      {isTaskOverdue(task) && (
                        <Badge className="bg-red-100 text-red-800" variant="outline">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      <span>{task.assignedTo}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Lead Dialog */}
      <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>Enter the details of the new lead.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interest" className="text-right">
                Interest
              </Label>
              <Input
                id="interest"
                value={newLead.interest}
                onChange={(e) => setNewLead({ ...newLead, interest: e.target.value })}
                className="col-span-3"
                placeholder="e.g. 2BR Apartment"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                Source
              </Label>
              <Select
                value={newLead.source}
                onValueChange={(value) => setNewLead({ ...newLead, source: value as LeadSource })}
              >
                <SelectTrigger id="source" className="col-span-3">
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="property_portal">Property Portal</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                className="col-span-3"
                placeholder="Additional information about the lead"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLeadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLead} className="bg-green-700 hover:bg-green-800">
              Add Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Enter the details of the new task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="col-span-3"
                placeholder="Task details"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value as TaskPriority })}
              >
                <SelectTrigger id="priority" className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedTo" className="text-right">
                Assigned To
              </Label>
              <Input
                id="assignedTo"
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leadId" className="text-right">
                Related Lead
              </Label>
              <Select value={newTask.leadId} onValueChange={(value) => setNewTask({ ...newTask, leadId: value })}>
                <SelectTrigger id="leadId" className="col-span-3">
                  <SelectValue placeholder="Select a lead (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="bg-green-700 hover:bg-green-800">
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Lead Dialog */}
      {selectedLead && (
        <Dialog open={showViewLeadDialog} onOpenChange={setShowViewLeadDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
              <DialogDescription>View and manage lead information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium">{selectedLead.name}</h3>
                  <p className="text-sm text-gray-500">{selectedLead.email}</p>
                  <p className="text-sm text-gray-500">{selectedLead.phone}</p>
                </div>
                <Badge className={getLeadStatusColor(selectedLead.status)} variant="outline">
                  {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Interest</p>
                  <p>{selectedLead.interest}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Source</p>
                  <p className="capitalize">{selectedLead.source.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p>{formatDate(selectedLead.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Contact</p>
                  <p>{selectedLead.lastContact ? formatDate(selectedLead.lastContact) : "Never"}</p>
                </div>
              </div>

              {selectedLead.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="whitespace-pre-line text-sm">{selectedLead.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">Related Tasks</p>
                {tasks.filter((task) => task.leadId === selectedLead.id).length > 0 ? (
                  <div className="space-y-2">
                    {tasks
                      .filter((task) => task.leadId === selectedLead.id)
                      .map((task) => (
                        <div key={task.id} className="rounded-md border p-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{task.title}</span>
                            <Badge className={getTaskStatusColor(task.status)} variant="outline">
                              {task.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Due: {formatDate(task.dueDate)} • Assigned to: {task.assignedTo}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No tasks associated with this lead</p>
                )}
                <Button
                  onClick={() => {
                    setNewTask({
                      ...newTask,
                      leadId: selectedLead.id,
                    })
                    setShowViewLeadDialog(false)
                    setShowAddTaskDialog(true)
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <Plus className="mr-2 h-3 w-3" /> Add Task
                </Button>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  // Logic to update last contact date
                  const updatedLead = {
                    ...selectedLead,
                    lastContact: new Date(),
                  }
                  // Update lead in database
                  // ...
                  setShowViewLeadDialog(false)
                }}
                variant="outline"
              >
                <Phone className="mr-2 h-4 w-4" /> Mark as Contacted
              </Button>
              <Button
                onClick={() => handleUpdateLeadStatus(selectedLead.id, "converted")}
                className="bg-green-700 hover:bg-green-800"
              >
                <Check className="mr-2 h-4 w-4" /> Convert to Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
