"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Building,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
  Eye,
  Edit,
  Trash2,
  Phone,
  Plus,
  Loader2,
  Filter,
  Download,
  ArrowUpRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdBannerCarousel } from "@/components/ad-banner"
import { SearchBar } from "@/components/search-bar"
import { CurrencySelector } from "@/components/currency-selector"
import { ClientDialog } from "@/components/dialogs/client-dialog"
import { ApartmentDialog } from "@/components/dialogs/apartment-dialog"
import { PaymentDialog } from "@/components/dialogs/payment-dialog"
import { TransactionDialog } from "@/components/dialogs/transaction-dialog"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { ViewClientDialog } from "@/components/dialogs/view-client-dialog"
import { ViewApartmentDialog } from "@/components/dialogs/view-apartment-dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/hooks/use-auth"
import type { Client, Apartment, Payment, Currency, Transaction, Lead, Task } from "@/lib/types"
import { getAllClients, createClient, updateClient, deleteClient } from "@/lib/services/client-service"
import { getAllApartments, createApartment, updateApartment, deleteApartment } from "@/lib/services/apartment-service"
import { getAllPayments, createPayment, updatePayment } from "@/lib/services/payment-service"
import { getAllBuildings } from "@/lib/services/building-service"
import { getAllTransactions, createTransaction } from "@/lib/services/transaction-service"
import { getAllLeads } from "@/lib/services/lead-service"
import { getAllTasks } from "@/lib/services/task-service"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, userData, isLoading: authLoading, logout } = useAuth()

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login")
    } else if (!authLoading && user && userData && userData.role !== "admin") {
      router.push("/client/dashboard")
    }
  }, [user, userData, authLoading, router])

  // State for UI
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currency, setCurrency] = useState<Currency>("USD")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Data states
  const [clients, setClients] = useState<Client[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [buildings, setBuildings] = useState<any[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  // Filtered data states
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [filteredApartments, setFilteredApartments] = useState<Apartment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])

  // Dialog states
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false)
  const [editClientDialogOpen, setEditClientDialogOpen] = useState(false)
  const [viewClientDialogOpen, setViewClientDialogOpen] = useState(false)
  const [deleteClientDialogOpen, setDeleteClientDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const [addApartmentDialogOpen, setAddApartmentDialogOpen] = useState(false)
  const [editApartmentDialogOpen, setEditApartmentDialogOpen] = useState(false)
  const [viewApartmentDialogOpen, setViewApartmentDialogOpen] = useState(false)
  const [deleteApartmentDialogOpen, setDeleteApartmentDialogOpen] = useState(false)
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null)

  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false)

  const [addConstructionTransactionDialogOpen, setAddConstructionTransactionDialogOpen] = useState(false)
  const [addFinanceTransactionDialogOpen, setAddFinanceTransactionDialogOpen] = useState(false)

  // Account states
  const [constructionAccount, setConstructionAccount] = useState({
    total: 0,
    used: 0,
    remaining: 0,
    currency: currency,
  })

  const [financeAccount, setFinanceAccount] = useState({
    total: 0,
    used: 0,
    remaining: 0,
    currency: currency,
  })

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch all data
        const clientsData = await getAllClients()
        const apartmentsData = await getAllApartments()
        const paymentsData = await getAllPayments()
        const buildingsData = await getAllBuildings()
        const transactionsData = await getAllTransactions()
        const leadsData = await getAllLeads()
        const tasksData = await getAllTasks()

        // Set data
        setClients(clientsData)
        setApartments(apartmentsData)
        setPayments(paymentsData)
        setBuildings(buildingsData)
        setTransactions(transactionsData)
        setLeads(leadsData)
        setTasks(tasksData)

        // Set filtered data
        setFilteredClients(clientsData)
        setFilteredApartments(apartmentsData)
        setFilteredPayments(paymentsData)

        // Calculate account balances
        calculateAccountBalances(transactionsData)

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up real-time listeners for Firebase data
    const unsubscribeClients = setupClientsListener()
    const unsubscribeApartments = setupApartmentsListener()
    const unsubscribePayments = setupPaymentsListener()
    const unsubscribeTransactions = setupTransactionsListener()
    const unsubscribeLeads = setupLeadsListener()
    const unsubscribeTasks = setupTasksListener()

    return () => {
      // Clean up listeners
      unsubscribeClients()
      unsubscribeApartments()
      unsubscribePayments()
      unsubscribeTransactions()
      unsubscribeLeads()
      unsubscribeTasks()
    }
  }, [])

  // Set up real-time listeners
  const setupClientsListener = () => {
    // This would be a Firebase real-time listener
    // For now, we'll just return an empty function
    return () => {}
  }

  const setupApartmentsListener = () => {
    return () => {}
  }

  const setupPaymentsListener = () => {
    return () => {}
  }

  const setupTransactionsListener = () => {
    return () => {}
  }

  const setupLeadsListener = () => {
    return () => {}
  }

  const setupTasksListener = () => {
    return () => {}
  }

  // Calculate account balances
  const calculateAccountBalances = (transactionsData: Transaction[]) => {
    const constructionTransactions = transactionsData.filter((t) => t.accountType === "construction")
    const financeTransactions = transactionsData.filter((t) => t.accountType === "finance")

    const constructionIncome = constructionTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const constructionExpense = constructionTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const financeIncome = financeTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const financeExpense = financeTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    setConstructionAccount({
      total: constructionIncome,
      used: constructionExpense,
      remaining: constructionIncome - constructionExpense,
      currency,
    })

    setFinanceAccount({
      total: financeIncome,
      used: financeExpense,
      remaining: financeIncome - financeExpense,
      currency,
    })
  }

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
    setConstructionAccount((prev) => ({ ...prev, currency: newCurrency }))
    setFinanceAccount((prev) => ({ ...prev, currency: newCurrency }))
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query) {
      // Filter clients
      const filteredClientsData = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(query.toLowerCase()) ||
          client.email.toLowerCase().includes(query.toLowerCase()) ||
          client.phone.includes(query),
      )
      setFilteredClients(filteredClientsData)

      // Filter apartments
      const filteredApartmentsData = apartments.filter(
        (apt) =>
          apt.number.toLowerCase().includes(query.toLowerCase()) ||
          apt.type.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredApartments(filteredApartmentsData)

      // Filter payments
      const filteredPaymentsData = payments.filter((payment) => {
        const client = clients.find((c) => c.id === payment.clientId)
        return client?.name.toLowerCase().includes(query.toLowerCase()) || false
      })
      setFilteredPayments(filteredPaymentsData)
    } else {
      // Reset to all data if query is empty
      setFilteredClients(clients)
      setFilteredApartments(apartments)
      setFilteredPayments(payments)
    }
  }

  // Client CRUD handlers
  const handleAddClient = async (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newClient = await createClient({
        ...client,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setClients((prev) => [...prev, newClient])
      setFilteredClients((prev) => [...prev, newClient])

      toast({
        title: "Client Added",
        description: "New client has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding client:", error)
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditClient = async (client: Omit<Client, "createdAt" | "updatedAt">) => {
    if (!selectedClientId) return

    try {
      const updatedClient = await updateClient(selectedClientId, {
        ...client,
        updatedAt: new Date(),
      })

      setClients((prev) => prev.map((c) => (c.id === selectedClientId ? updatedClient : c)))
      setFilteredClients((prev) => prev.map((c) => (c.id === selectedClientId ? updatedClient : c)))

      toast({
        title: "Client Updated",
        description: "Client information has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating client:", error)
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClient = async () => {
    if (!selectedClientId) return

    try {
      await deleteClient(selectedClientId)

      setClients((prev) => prev.filter((c) => c.id !== selectedClientId))
      setFilteredClients((prev) => prev.filter((c) => c.id !== selectedClientId))

      toast({
        title: "Client Deleted",
        description: "Client has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Apartment CRUD handlers
  const handleAddApartment = async (apartment: Omit<Apartment, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newApartment = await createApartment({
        ...apartment,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setApartments((prev) => [...prev, newApartment])
      setFilteredApartments((prev) => [...prev, newApartment])

      toast({
        title: "Apartment Added",
        description: "New apartment has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding apartment:", error)
      toast({
        title: "Error",
        description: "Failed to add apartment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditApartment = async (apartment: Omit<Apartment, "createdAt" | "updatedAt">) => {
    if (!selectedApartmentId) return

    try {
      const updatedApartment = await updateApartment(selectedApartmentId, {
        ...apartment,
        updatedAt: new Date(),
      })

      setApartments((prev) => prev.map((a) => (a.id === selectedApartmentId ? updatedApartment : a)))
      setFilteredApartments((prev) => prev.map((a) => (a.id === selectedApartmentId ? updatedApartment : a)))

      toast({
        title: "Apartment Updated",
        description: "Apartment information has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating apartment:", error)
      toast({
        title: "Error",
        description: "Failed to update apartment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteApartment = async () => {
    if (!selectedApartmentId) return

    try {
      await deleteApartment(selectedApartmentId)

      setApartments((prev) => prev.filter((a) => a.id !== selectedApartmentId))
      setFilteredApartments((prev) => prev.filter((a) => a.id !== selectedApartmentId))

      toast({
        title: "Apartment Deleted",
        description: "Apartment has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting apartment:", error)
      toast({
        title: "Error",
        description: "Failed to delete apartment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Payment handlers
  const handleAddPayment = async (payment: Omit<Payment, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newPayment = await createPayment({
        ...payment,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setPayments((prev) => [...prev, newPayment])
      setFilteredPayments((prev) => [...prev, newPayment])

      // Update finance account if payment is paid
      if (payment.status === "paid") {
        await createTransaction({
          accountType: "finance",
          amount: payment.amount,
          description: `Payment received for apartment ${payment.apartmentId}`,
          type: "income",
          category: "payment",
          currency: payment.currency,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      toast({
        title: "Payment Added",
        description: "New payment has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding payment:", error)
      toast({
        title: "Error",
        description: "Failed to add payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Transaction handlers
  const handleAddConstructionTransaction = async (transaction: {
    amount: number
    description: string
    type: "income" | "expense"
    category: string
    currency: Currency
  }) => {
    try {
      await createTransaction({
        accountType: "construction",
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        category: transaction.category,
        currency: transaction.currency,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Update construction account
      if (transaction.type === "income") {
        setConstructionAccount((prev) => ({
          ...prev,
          total: prev.total + transaction.amount,
          remaining: prev.remaining + transaction.amount,
        }))
      } else {
        setConstructionAccount((prev) => ({
          ...prev,
          used: prev.used + transaction.amount,
          remaining: prev.remaining - transaction.amount,
        }))
      }

      toast({
        title: "Transaction Added",
        description: "Construction transaction has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding construction transaction:", error)
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddFinanceTransaction = async (transaction: {
    amount: number
    description: string
    type: "income" | "expense"
    category: string
    currency: Currency
  }) => {
    try {
      await createTransaction({
        accountType: "finance",
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        category: transaction.category,
        currency: transaction.currency,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Update finance account
      if (transaction.type === "income") {
        setFinanceAccount((prev) => ({
          ...prev,
          total: prev.total + transaction.amount,
          remaining: prev.remaining + transaction.amount,
        }))
      } else {
        setFinanceAccount((prev) => ({
          ...prev,
          used: prev.used + transaction.amount,
          remaining: prev.remaining - transaction.amount,
        }))
      }

      toast({
        title: "Transaction Added",
        description: "Finance transaction has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding finance transaction:", error)
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Mark payment as paid
  const handleMarkPaymentAsPaid = async (paymentId: string) => {
    try {
      const payment = payments.find((p) => p.id === paymentId)
      if (!payment) return

      const updatedPayment = await updatePayment(paymentId, {
        ...payment,
        status: "paid",
        paidDate: new Date(),
        updatedAt: new Date(),
      })

      setPayments((prev) => prev.map((p) => (p.id === paymentId ? updatedPayment : p)))
      setFilteredPayments((prev) => prev.map((p) => (p.id === paymentId ? updatedPayment : p)))

      // Add to finance account
      await createTransaction({
        accountType: "finance",
        amount: payment.amount,
        description: `Payment received for apartment ${payment.apartmentId}`,
        type: "income",
        category: "payment",
        currency: payment.currency,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      toast({
        title: "Payment Updated",
        description: "Payment has been marked as paid.",
      })
    } catch (error) {
      console.error("Error marking payment as paid:", error)
      toast({
        title: "Error",
        description: "Failed to update payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Format currency for display
  const formatCurrency = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  // Format date for display
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get recent transactions
  const getRecentTransactions = (count: number) => {
    return transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, count)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-700" />
          <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      {/* Ad Banner */}
      <AdBannerCarousel />

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 z-50 md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-green-800 p-4 text-white transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="mb-8 flex items-center gap-2 px-2">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-md bg-white p-1"
              />
              <span className="text-xl font-bold">ApartmentPro</span>
            </div>

            <nav className="flex-1 space-y-1">
              <Link
                href="/admin/dashboard"
                className="flex items-center rounded-md bg-green-700 px-4 py-3 text-sm font-medium"
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <Users className="mr-3 h-5 w-5" />
                User Management
              </Link>
              <Link
                href="/admin/clients"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <Users className="mr-3 h-5 w-5" />
                Client Management
              </Link>
              <Link
                href="/admin/apartments"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <Building className="mr-3 h-5 w-5" />
                Apartments
              </Link>
              <Link
                href="/admin/payments"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <CreditCard className="mr-3 h-5 w-5" />
                Payments
              </Link>
              <Link
                href="/admin/crm"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <MessageSquare className="mr-3 h-5 w-5" />
                CRM
              </Link>
              <Link
                href="/admin/analytics"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Analytics
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </nav>

            <div className="mt-auto border-t border-green-700 pt-4">
              <button
                onClick={logout}
                className="flex w-full items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 md:p-6">
          <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500">Welcome back, {userData?.name || "Admin"}</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchBar placeholder="Search clients, apartments..." onSearch={handleSearch} />
              <CurrencySelector defaultCurrency={currency} onCurrencyChange={handleCurrencyChange} />
            </div>
          </header>

          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="apartments">Apartments</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="crm">CRM</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Buildings</CardDescription>
                    <CardTitle className="text-4xl">{buildings.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-green-600">+2 from last month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Available Apartments</CardDescription>
                    <CardTitle className="text-4xl">
                      {apartments.filter((apt) => apt.status === "available").length}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-green-600">
                      {apartments.length > 0
                        ? Math.round(
                            (apartments.filter((apt) => apt.status !== "available").length / apartments.length) * 100,
                          )
                        : 0}
                      % occupancy rate
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Clients</CardDescription>
                    <CardTitle className="text-4xl">{clients.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-green-600">+7 new this month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Monthly Revenue</CardDescription>
                    <CardTitle className="text-4xl">{formatCurrency(financeAccount.total / 12, currency)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-green-600">+12% from last month</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getRecentTransactions(3).map((transaction, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="rounded-full bg-green-100 p-2 text-green-700">
                            {transaction.type === "income" ? (
                              <CreditCard className="h-4 w-4" />
                            ) : (
                              <Building className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.type === "income" ? "Payment Received" : "Expense"}
                            </p>
                            <p className="text-sm text-gray-500">{transaction.description}</p>
                            <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                      ))}

                      {transactions.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No recent activities found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">Paid</span>
                          <span className="text-sm font-medium">
                            {payments.length > 0
                              ? Math.round((payments.filter((p) => p.status === "paid").length / payments.length) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-green-600"
                            style={{
                              width: `${
                                payments.length > 0
                                  ? Math.round(
                                      (payments.filter((p) => p.status === "paid").length / payments.length) * 100,
                                    )
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">Pending</span>
                          <span className="text-sm font-medium">
                            {payments.length > 0
                              ? Math.round(
                                  (payments.filter((p) => p.status === "pending").length / payments.length) * 100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-yellow-500"
                            style={{
                              width: `${
                                payments.length > 0
                                  ? Math.round(
                                      (payments.filter((p) => p.status === "pending").length / payments.length) * 100,
                                    )
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">Overdue</span>
                          <span className="text-sm font-medium">
                            {payments.length > 0
                              ? Math.round(
                                  (payments.filter((p) => p.status === "overdue").length / payments.length) * 100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-red-500"
                            style={{
                              width: `${
                                payments.length > 0
                                  ? Math.round(
                                      (payments.filter((p) => p.status === "overdue").length / payments.length) * 100,
                                    )
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leads
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 3)
                        .map((lead, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                              <Users className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{lead.name}</p>
                                <Badge
                                  variant="outline"
                                  className={
                                    lead.status === "new"
                                      ? "bg-blue-100 text-blue-800"
                                      : lead.status === "contacted"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : lead.status === "qualified"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {lead.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                {lead.email} • {lead.phone}
                              </p>
                              <p className="text-xs text-gray-400">{formatDate(lead.createdAt)}</p>
                            </div>
                          </div>
                        ))}

                      {leads.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No leads found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/crm">
                        View All Leads <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks
                        .filter((task) => task.status !== "completed")
                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .slice(0, 3)
                        .map((task, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="rounded-full bg-purple-100 p-2 text-purple-700">
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{task.title}</p>
                                <Badge
                                  variant="outline"
                                  className={
                                    new Date(task.dueDate) < new Date()
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {new Date(task.dueDate) < new Date() ? "Overdue" : "Upcoming"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">{task.description}</p>
                              <p className="text-xs text-gray-400">Due: {formatDate(task.dueDate)}</p>
                            </div>
                          </div>
                        ))}

                      {tasks.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No tasks found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/crm">
                        View All Tasks <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="apartments" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Apartment Status</CardTitle>
                    <CardDescription>Overview of all apartments and their current status</CardDescription>
                  </div>
                  <Button className="bg-green-700 hover:bg-green-800" onClick={() => setAddApartmentDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Apartment
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="px-4 py-2 font-medium">Building</th>
                            <th className="px-4 py-2 font-medium">Unit #</th>
                            <th className="px-4 py-2 font-medium">Type</th>
                            <th className="px-4 py-2 font-medium">Size (sq ft)</th>
                            <th className="px-4 py-2 font-medium">Price</th>
                            <th className="px-4 py-2 font-medium">Status</th>
                            <th className="px-4 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApartments.map((apartment) => {
                            const building = buildings.find((b) => b.id === apartment.buildingId)
                            return (
                              <tr key={apartment.id} className="border-b">
                                <td className="px-4 py-2">{building?.name || apartment.buildingId}</td>
                                <td className="px-4 py-2">{apartment.number}</td>
                                <td className="px-4 py-2">{apartment.type}</td>
                                <td className="px-4 py-2">{apartment.size}</td>
                                <td className="px-4 py-2">{formatCurrency(apartment.price, currency)}</td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      apartment.status === "available"
                                        ? "bg-green-100 text-green-700"
                                        : apartment.status === "reserved"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedApartmentId(apartment.id)
                                        setViewApartmentDialogOpen(true)
                                      }}
                                    >
                                      <Eye className="mr-1 h-3 w-3" />
                                      View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedApartmentId(apartment.id)
                                        setEditApartmentDialogOpen(true)
                                      }}
                                    >
                                      <Edit className="mr-1 h-3 w-3" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:bg-red-50"
                                      onClick={() => {
                                        setSelectedApartmentId(apartment.id)
                                        setDeleteApartmentDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="mr-1 h-3 w-3" />
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}

                          {filteredApartments.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                No apartments found. Add a new apartment to get started.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Client Management</CardTitle>
                    <CardDescription>Manage all your clients and their information</CardDescription>
                  </div>
                  <Button className="bg-green-700 hover:bg-green-800" onClick={() => setAddClientDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Client
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="px-4 py-2 font-medium">Name</th>
                            <th className="px-4 py-2 font-medium">Email</th>
                            <th className="px-4 py-2 font-medium">Phone</th>
                            <th className="px-4 py-2 font-medium">Type</th>
                            <th className="px-4 py-2 font-medium">Status</th>
                            <th className="px-4 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredClients.map((client) => (
                            <tr key={client.id} className="border-b">
                              <td className="px-4 py-2">{client.name}</td>
                              <td className="px-4 py-2">{client.email}</td>
                              <td className="px-4 py-2">{client.phone}</td>
                              <td className="px-4 py-2">
                                <span className="capitalize">{client.type}</span>
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    client.status === "active"
                                      ? "bg-green-100 text-green-700"
                                      : client.status === "pending"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedClientId(client.id)
                                      setViewClientDialogOpen(true)
                                    }}
                                  >
                                    <Eye className="mr-1 h-3 w-3" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedClientId(client.id)
                                      setEditClientDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-1 h-3 w-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-green-50 text-green-700"
                                    onClick={() => {
                                      window.open(`tel:${client.phone}`, "_self")
                                    }}
                                  >
                                    <Phone className="mr-1 h-3 w-3" />
                                    Contact
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {filteredClients.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                No clients found. Add a new client to get started.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Construction Account</CardTitle>
                      <CardDescription>Financial overview of construction expenses</CardDescription>
                    </div>
                    <Button
                      className="bg-green-700 hover:bg-green-800"
                      onClick={() => setAddConstructionTransactionDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Total Budget</span>
                        <span className="font-semibold">{formatCurrency(constructionAccount.total, currency)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Spent</span>
                        <span className="font-semibold">{formatCurrency(constructionAccount.used, currency)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Remaining</span>
                        <span className="font-semibold text-green-700">
                          {formatCurrency(constructionAccount.remaining, currency)}
                        </span>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">Budget Usage</span>
                          <span className="text-sm font-medium">
                            {constructionAccount.total > 0
                              ? Math.round((constructionAccount.used / constructionAccount.total) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-green-600"
                            style={{
                              width: `${
                                constructionAccount.total > 0
                                  ? Math.round((constructionAccount.used / constructionAccount.total) * 100)
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Client Finance Account</CardTitle>
                      <CardDescription>Overview of client payments and revenue</CardDescription>
                    </div>
                    <Button
                      className="bg-green-700 hover:bg-green-800"
                      onClick={() => setAddFinanceTransactionDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Total Revenue</span>
                        <span className="font-semibold">{formatCurrency(financeAccount.total, currency)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Pending Payments</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0),
                            currency,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Overdue Payments</span>
                        <span className="font-semibold text-red-700">
                          {formatCurrency(
                            payments.filter((p) => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0),
                            currency,
                          )}
                        </span>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">Collection Rate</span>
                          <span className="text-sm font-medium">
                            {payments.length > 0
                              ? Math.round((payments.filter((p) => p.status === "paid").length / payments.length) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-green-600"
                            style={{
                              width: `${
                                payments.length > 0
                                  ? Math.round(
                                      (payments.filter((p) => p.status === "paid").length / payments.length) * 100,
                                    )
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Installment Plans</CardTitle>
                    <CardDescription>Track client installment plans and payment schedules</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setFilteredPayments(payments)}>All</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFilteredPayments(payments.filter((p) => p.status === "paid"))}
                        >
                          Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFilteredPayments(payments.filter((p) => p.status === "pending"))}
                        >
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFilteredPayments(payments.filter((p) => p.status === "overdue"))}
                        >
                          Overdue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button className="bg-green-700 hover:bg-green-800" onClick={() => setAddPaymentDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="px-4 py-2 font-medium">Client</th>
                            <th className="px-4 py-2 font-medium">Apartment</th>
                            <th className="px-4 py-2 font-medium">Amount</th>
                            <th className="px-4 py-2 font-medium">Status</th>
                            <th className="px-4 py-2 font-medium">Due Date</th>
                            <th className="px-4 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPayments.map((payment) => {
                            const client = clients.find((c) => c.id === payment.clientId)
                            const apartment = apartments.find((a) => a.id === payment.apartmentId)

                            return (
                              <tr key={payment.id} className="border-b">
                                <td className="px-4 py-2">{client?.name || "Unknown"}</td>
                                <td className="px-4 py-2">{apartment?.number || "Unknown"}</td>
                                <td className="px-4 py-2">{formatCurrency(payment.amount, payment.currency)}</td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      payment.status === "paid"
                                        ? "bg-green-100 text-green-700"
                                        : payment.status === "pending"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-4 py-2">{formatDate(payment.dueDate)}</td>
                                <td className="px-4 py-2">
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      <Eye className="mr-1 h-3 w-3" />
                                      View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={
                                        payment.status === "overdue"
                                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                                          : "bg-green-50 text-green-700 hover:bg-green-100"
                                      }
                                      onClick={() => {
                                        if (payment.status === "pending" || payment.status === "overdue") {
                                          handleMarkPaymentAsPaid(payment.id)
                                        }
                                      }}
                                    >
                                      {payment.status === "paid" ? "Send Receipt" : "Mark Paid"}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}

                          {filteredPayments.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                No payments found. Add a new payment to get started.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Payments
                  </Button>
                  <div className="text-sm text-gray-500">
                    Showing {filteredPayments.length} of {payments.length} payments
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="crm" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Leads Management</CardTitle>
                      <CardDescription>Track and manage potential clients</CardDescription>
                    </div>
                    <Button className="bg-green-700 hover:bg-green-800">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Lead
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[250px]" />
                              <Skeleton className="h-4 w-[200px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {leads.slice(0, 5).map((lead) => (
                          <div key={lead.id} className="flex items-start justify-between rounded-lg border p-4">
                            <div className="flex items-start space-x-4">
                              <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">{lead.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {lead.email} • {lead.phone}
                                </p>
                                <div className="mt-1 flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className={
                                      lead.status === "new"
                                        ? "bg-blue-100 text-blue-800"
                                        : lead.status === "contacted"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : lead.status === "qualified"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                    }
                                  >
                                    {lead.status}
                                  </Badge>
                                  <span className="text-xs text-gray-400">Added: {formatDate(lead.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Phone className="mr-1 h-3 w-3" />
                                Contact
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))}

                        {leads.length === 0 && (
                          <div className="text-center py-8">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                              <Users className="h-6 w-6 text-gray-500" />
                            </div>
                            <h3 className="mb-1 text-lg font-medium">No Leads Found</h3>
                            <p className="text-sm text-gray-500">Add your first lead to get started.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/crm">
                        View All Leads <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Tasks</CardTitle>
                      <CardDescription>Manage your follow-ups and tasks</CardDescription>
                    </div>
                    <Button className="bg-green-700 hover:bg-green-800">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Task
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[250px]" />
                              <Skeleton className="h-4 w-[200px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tasks.slice(0, 5).map((task) => (
                          <div key={task.id} className="flex items-start justify-between rounded-lg border p-4">
                            <div className="flex items-start space-x-4">
                              <div className="rounded-full bg-purple-100 p-2 text-purple-700">
                                <MessageSquare className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">{task.title}</h3>
                                <p className="text-sm text-gray-500">{task.description}</p>
                                <div className="mt-1 flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className={
                                      task.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : task.status === "in_progress"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-yellow-100 text-yellow-800"
                                    }
                                  >
                                    {task.status.replace("_", " ")}
                                  </Badge>
                                  <span className="text-xs text-gray-400">Due: {formatDate(task.dueDate)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className={task.status === "completed" ? "bg-gray-100" : "bg-green-50 text-green-700"}
                                disabled={task.status === "completed"}
                              >
                                {task.status === "completed" ? "Completed" : "Mark Complete"}
                              </Button>
                            </div>
                          </div>
                        ))}

                        {tasks.length === 0 && (
                          <div className="text-center py-8">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                              <MessageSquare className="h-6 w-6 text-gray-500" />
                            </div>
                            <h3 className="mb-1 text-lg font-medium">No Tasks Found</h3>
                            <p className="text-sm text-gray-500">Add your first task to get started.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/crm">
                        View All Tasks <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <ClientDialog
        open={addClientDialogOpen}
        onOpenChange={setAddClientDialogOpen}
        onSave={handleAddClient}
        title="Add New Client"
        description="Add a new client to the system."
      />

      <ClientDialog
        open={editClientDialogOpen}
        onOpenChange={setEditClientDialogOpen}
        onSave={handleEditClient}
        client={selectedClientId ? clients.find((c) => c.id === selectedClientId) : undefined}
        title="Edit Client"
        description="Update client information."
      />

      <ViewClientDialog
        open={viewClientDialogOpen}
        onOpenChange={setViewClientDialogOpen}
        clientId={selectedClientId || ""}
        onEdit={() => {
          setViewClientDialogOpen(false)
          setEditClientDialogOpen(true)
        }}
        onDelete={() => {
          setViewClientDialogOpen(false)
          setDeleteClientDialogOpen(true)
        }}
        currency={currency}
      />

      <ConfirmDialog
        open={deleteClientDialogOpen}
        onOpenChange={setDeleteClientDialogOpen}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      <ApartmentDialog
        open={addApartmentDialogOpen}
        onOpenChange={setAddApartmentDialogOpen}
        onSave={handleAddApartment}
        title="Add New Apartment"
        description="Add a new apartment to the system."
      />

      <ApartmentDialog
        open={editApartmentDialogOpen}
        onOpenChange={setEditApartmentDialogOpen}
        onSave={handleEditApartment}
        apartment={selectedApartmentId ? apartments.find((a) => a.id === selectedApartmentId) : undefined}
        title="Edit Apartment"
        description="Update apartment information."
      />

      <ViewApartmentDialog
        open={viewApartmentDialogOpen}
        onOpenChange={setViewApartmentDialogOpen}
        apartmentId={selectedApartmentId || ""}
        onEdit={() => {
          setViewApartmentDialogOpen(false)
          setEditApartmentDialogOpen(true)
        }}
        onDelete={() => {
          setViewApartmentDialogOpen(false)
          setDeleteApartmentDialogOpen(true)
        }}
        currency={currency}
      />

      <ConfirmDialog
        open={deleteApartmentDialogOpen}
        onOpenChange={setDeleteApartmentDialogOpen}
        onConfirm={handleDeleteApartment}
        title="Delete Apartment"
        description="Are you sure you want to delete this apartment? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      <PaymentDialog
        open={addPaymentDialogOpen}
        onOpenChange={setAddPaymentDialogOpen}
        onSave={handleAddPayment}
        title="Add New Payment"
        description="Record a new payment in the system."
      />

      <TransactionDialog
        open={addConstructionTransactionDialogOpen}
        onOpenChange={setAddConstructionTransactionDialogOpen}
        onSave={handleAddConstructionTransaction}
        title="Add Construction Transaction"
        description="Record a new transaction for the construction account."
        accountType="construction"
      />

      <TransactionDialog
        open={addFinanceTransactionDialogOpen}
        onOpenChange={setAddFinanceTransactionDialogOpen}
        onSave={handleAddFinanceTransaction}
        title="Add Finance Transaction"
        description="Record a new transaction for the finance account."
        accountType="finance"
      />
    </div>
  )
}
