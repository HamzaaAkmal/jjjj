"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Building,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  X,
  Download,
  Upload,
  Plus,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CurrencySelector } from "@/components/currency-selector"
import { AdBannerCarousel } from "@/components/ad-banner"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import type { Currency, PaymentMethod } from "@/lib/types"
import { getClientByUserId } from "@/lib/services/client-service"
import { getPaymentsByClient, createPayment } from "@/lib/services/payment-service"
import { getDocumentsByClient, uploadDocument } from "@/lib/services/document-service"
import { getMaintenanceRequestsByClient, createMaintenanceRequest } from "@/lib/services/maintenance-service"
import { getApartmentById } from "@/lib/services/apartment-service"

export default function ClientDashboard() {
  const router = useRouter()
  const { user, userData, isLoading: authLoading, logout } = useAuth()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/client/login")
    }
  }, [user, authLoading, router])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currency, setCurrency] = useState<Currency>("USD")
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)

  // Client data state
  const [clientData, setClientData] = useState<any>(null)
  const [clientPayments, setClientPayments] = useState<any[]>([])
  const [clientDocuments, setClientDocuments] = useState<any[]>([])
  const [clientMaintenanceRequests, setClientMaintenanceRequests] = useState<any[]>([])
  const [apartmentData, setApartmentData] = useState<any>(null)

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "bank_transfer" as PaymentMethod,
    reference: "",
  })

  // Maintenance request form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    preferredDate: "",
  })

  // Document upload form state
  const [documentForm, setDocumentForm] = useState({
    title: "",
    type: "identity",
    file: null as File | null,
  })

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Get client data
        const client = await getClientByUserId(user.uid)
        if (!client) {
          toast({
            title: "Account not linked",
            description: "Your user account is not linked to a client profile. Please contact support.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        setClientData(client)

        // Get apartment data if client has an apartment
        if (client.apartmentId) {
          const apartment = await getApartmentById(client.apartmentId)
          setApartmentData(apartment)
        }

        // Get client payments
        const payments = await getPaymentsByClient(client.id)
        setClientPayments(payments)

        // Get client documents
        const documents = await getDocumentsByClient(client.id)
        setClientDocuments(documents)

        // Get client maintenance requests
        const maintenanceRequests = await getMaintenanceRequestsByClient(client.id)
        setClientMaintenanceRequests(maintenanceRequests)

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching client data:", error)
        toast({
          title: "Error",
          description: "Failed to load your dashboard data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (user) {
      fetchClientData()
    }
  }, [user])

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
  }

  // Handle payment submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientData) return

    try {
      const newPayment = await createPayment({
        clientId: clientData.id,
        apartmentId: clientData.apartmentId || "",
        amount: Number(paymentForm.amount),
        currency,
        status: "pending",
        method: paymentForm.method,
        reference: paymentForm.reference,
        description: "Client payment",
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Update client payments
      setClientPayments((prev) => [newPayment, ...prev])

      // Reset form and close dialog
      setPaymentForm({
        amount: "",
        method: "bank_transfer",
        reference: "",
      })
      setShowPaymentDialog(false)

      toast({
        title: "Payment Submitted",
        description: `Your payment of ${formatCurrency(Number(paymentForm.amount), currency)} has been submitted for processing.`,
      })
    } catch (error) {
      console.error("Error submitting payment:", error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle maintenance request submission
  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientData) return

    try {
      const newRequest = await createMaintenanceRequest({
        clientId: clientData.id,
        apartmentId: clientData.apartmentId || "",
        title: maintenanceForm.title,
        description: maintenanceForm.description,
        status: "pending",
        priority: maintenanceForm.priority as any,
        scheduledDate: maintenanceForm.preferredDate ? new Date(maintenanceForm.preferredDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Update maintenance requests
      setClientMaintenanceRequests((prev) => [newRequest, ...prev])

      // Reset form and close dialog
      setMaintenanceForm({
        title: "",
        description: "",
        priority: "medium",
        preferredDate: "",
      })
      setShowMaintenanceDialog(false)

      toast({
        title: "Request Submitted",
        description: "Your maintenance request has been submitted successfully.",
      })
    } catch (error) {
      console.error("Error submitting maintenance request:", error)
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle document upload
  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientData || !documentForm.file) {
      toast({
        title: "Missing File",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    try {
      const newDocument = await uploadDocument(documentForm.file, {
        clientId: clientData.id,
        title: documentForm.title,
        type: documentForm.type as any,
      })

      // Update documents
      setClientDocuments((prev) => [newDocument, ...prev])

      // Reset form and close dialog
      setDocumentForm({
        title: "",
        type: "identity",
        file: null,
      })
      setShowDocumentDialog(false)

      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentForm({
        ...documentForm,
        file: e.target.files[0],
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
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get maintenance status badge color
  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
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

  // Get document type badge color
  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "contract":
        return "bg-purple-100 text-purple-800"
      case "identity":
        return "bg-blue-100 text-blue-800"
      case "payment":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate payment progress
  const calculatePaymentProgress = () => {
    if (!clientPayments.length) return 0

    const totalAmount = clientPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const paidAmount = clientPayments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0)

    return (paidAmount / totalAmount) * 100
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-700" />
          <p className="mt-2 text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mb-1 text-lg font-medium">Account Not Linked</h3>
          <p className="text-sm text-gray-500">Your user account is not linked to a client profile.</p>
          <Button onClick={logout} className="mt-4 bg-green-700 hover:bg-green-800">
            Go Back
          </Button>
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
                href="/client/dashboard"
                className="flex items-center rounded-md bg-green-700 px-4 py-3 text-sm font-medium"
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/client/apartment"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <Building className="mr-3 h-5 w-5" />
                My Apartment
              </Link>
              <Link
                href="/client/payments"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <CreditCard className="mr-3 h-5 w-5" />
                Payments
              </Link>
              <Link
                href="/client/documents"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <FileText className="mr-3 h-5 w-5" />
                Documents
              </Link>
              <Link
                href="/client/support"
                className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-700"
              >
                <MessageSquare className="mr-3 h-5 w-5" />
                Support
              </Link>
              <Link
                href="/client/settings"
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
              <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
              <p className="text-gray-500">Welcome back, {clientData.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <CurrencySelector defaultCurrency={currency} onCurrencyChange={handleCurrencyChange} />
            </div>
          </header>

          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="apartment">My Apartment</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Apartment Details</CardTitle>
                    <CardDescription>Your apartment information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {apartmentData ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Building ID:</span>
                          <span>{apartmentData.buildingId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Apartment Number:</span>
                          <span>{apartmentData.number}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Floor:</span>
                          <span>{apartmentData.floor}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Size:</span>
                          <span>{apartmentData.size} sq ft</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Type:</span>
                          <span>{apartmentData.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Status:</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {apartmentData.status}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No apartment assigned yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Summary</CardTitle>
                    <CardDescription>Your payment progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientPayments.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Total Amount:</span>
                            <span>
                              {formatCurrency(
                                clientPayments.reduce((sum, payment) => sum + payment.amount, 0),
                                currency,
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Paid Amount:</span>
                            <span className="text-green-700">
                              {formatCurrency(
                                clientPayments
                                  .filter((payment) => payment.status === "paid")
                                  .reduce((sum, payment) => sum + payment.amount, 0),
                                currency,
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Pending Amount:</span>
                            <span>
                              {formatCurrency(
                                clientPayments
                                  .filter((payment) => payment.status === "pending")
                                  .reduce((sum, payment) => sum + payment.amount, 0),
                                currency,
                              )}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Payment Progress</span>
                              <span className="text-sm font-medium">{calculatePaymentProgress().toFixed(1)}%</span>
                            </div>
                            <Progress value={calculatePaymentProgress()} className="h-2 w-full" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No payment records found.</p>
                        </div>
                      )}

                      <Button
                        className="w-full bg-green-700 hover:bg-green-800"
                        onClick={() => setShowPaymentDialog(true)}
                      >
                        Make Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...clientPayments, ...clientMaintenanceRequests]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className="flex items-start gap-4 rounded-lg p-3">
                          <div className="rounded-full bg-green-100 p-2 text-green-700">
                            {"amount" in item ? <CreditCard className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{"amount" in item ? "Payment" : "Maintenance Request"}</p>
                              <Badge
                                variant="outline"
                                className={
                                  "amount" in item
                                    ? item.status === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                    : getMaintenanceStatusColor(item.status)
                                }
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {"amount" in item
                                ? `${formatCurrency(item.amount, item.currency)} - ${item.method.replace("_", " ")}`
                                : item.title}
                            </p>
                            <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                          </div>
                        </div>
                      ))}

                    {[...clientPayments, ...clientMaintenanceRequests].length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No recent activity found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apartment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Apartment Details</CardTitle>
                  <CardDescription>Detailed information about your apartment</CardDescription>
                </CardHeader>
                <CardContent>
                  {apartmentData ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <Image
                          src="/placeholder.svg?height=300&width=500"
                          alt="Apartment"
                          width={500}
                          height={300}
                          className="rounded-lg object-cover"
                        />
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <Image
                            src="/placeholder.svg?height=80&width=120"
                            alt="Apartment thumbnail"
                            width={120}
                            height={80}
                            className="rounded-md object-cover"
                          />
                          <Image
                            src="/placeholder.svg?height=80&width=120"
                            alt="Apartment thumbnail"
                            width={120}
                            height={80}
                            className="rounded-md object-cover"
                          />
                          <Image
                            src="/placeholder.svg?height=80&width=120"
                            alt="Apartment thumbnail"
                            width={120}
                            height={80}
                            className="rounded-md object-cover"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {apartmentData.buildingId}, {apartmentData.number}
                          </h3>
                          <p className="text-gray-500">
                            Floor {apartmentData.floor}, {apartmentData.size} sq ft
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="text-lg font-medium">{apartmentData.type}</p>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="text-lg font-medium">{formatCurrency(apartmentData.price, currency)}</p>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="text-lg font-medium">{apartmentData.status}</p>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-sm text-gray-500">Building</p>
                            <p className="text-lg font-medium">{apartmentData.buildingId}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">Features</h4>
                          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
                            {apartmentData.features && apartmentData.features.length > 0 ? (
                              apartmentData.features.map((feature: string, index: number) => (
                                <li key={index}>{feature}</li>
                              ))
                            ) : (
                              <>
                                <li>Modern kitchen with granite countertops</li>
                                <li>Hardwood flooring throughout</li>
                                <li>Central air conditioning</li>
                                <li>In-unit washer and dryer</li>
                                <li>Walk-in closet in master bedroom</li>
                              </>
                            )}
                          </ul>
                        </div>
                        <Button
                          className="w-full bg-green-700 hover:bg-green-800"
                          onClick={() => setShowMaintenanceDialog(true)}
                        >
                          Request Maintenance
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Building className="h-6 w-6 text-gray-500" />
                      </div>
                      <h3 className="mb-1 text-lg font-medium">No Apartment Assigned</h3>
                      <p className="text-sm text-gray-500">You don't have an apartment assigned to your account yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Your payment records and history</CardDescription>
                  </div>
                  <Button className="bg-green-700 hover:bg-green-800" onClick={() => setShowPaymentDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Make Payment
                  </Button>
                </CardHeader>
                <CardContent>
                  {clientPayments.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-5 border-b bg-muted p-3 text-sm font-medium">
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Method</div>
                        <div>Reference</div>
                        <div>Status</div>
                      </div>
                      <div className="divide-y">
                        {clientPayments.map((payment) => (
                          <div key={payment.id} className="grid grid-cols-5 items-center p-3 text-sm">
                            <div>{formatDate(payment.createdAt)}</div>
                            <div>{formatCurrency(payment.amount, payment.currency)}</div>
                            <div>{payment.method.replace("_", " ")}</div>
                            <div>{payment.reference || "-"}</div>
                            <div>
                              <Badge
                                className={
                                  payment.status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : payment.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                                variant="outline"
                              >
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <CreditCard className="h-6 w-6 text-gray-500" />
                      </div>
                      <h3 className="mb-1 text-lg font-medium">No Payments Found</h3>
                      <p className="text-sm text-gray-500">You haven't made any payments yet.</p>
                      <Button
                        onClick={() => setShowPaymentDialog(true)}
                        className="mt-4 bg-green-700 hover:bg-green-800"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Make Your First Payment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">My Documents</h2>
                <Button className="bg-green-700 hover:bg-green-800" onClick={() => setShowDocumentDialog(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Upload Document
                </Button>
              </div>

              {clientDocuments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <FileText className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">No documents found</h3>
                  <p className="text-sm text-gray-500">Upload your first document to get started</p>
                  <Button onClick={() => setShowDocumentDialog(true)} className="mt-4 bg-green-700 hover:bg-green-800">
                    <Upload className="mr-2 h-4 w-4" /> Upload Document
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {clientDocuments.map((document) => (
                    <Card key={document.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{document.title}</CardTitle>
                            <CardDescription>Uploaded on {formatDate(document.createdAt)}</CardDescription>
                          </div>
                          <Badge className={getDocumentTypeColor(document.type)} variant="outline">
                            {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <a href={document.fileUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">Maintenance Requests</h2>
                <Button className="bg-green-700 hover:bg-green-800" onClick={() => setShowMaintenanceDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Request
                </Button>
              </div>

              {clientMaintenanceRequests.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Building className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">No maintenance requests</h3>
                  <p className="text-sm text-gray-500">Submit a request when you need maintenance</p>
                  <Button
                    onClick={() => setShowMaintenanceDialog(true)}
                    className="mt-4 bg-green-700 hover:bg-green-800"
                  >
                    <Plus className="mr-2 h-4 w-4" /> New Request
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 border-b bg-muted p-3 text-sm font-medium">
                    <div className="col-span-3">Title</div>
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Created</div>
                    <div className="col-span-1">Priority</div>
                  </div>
                  <div className="divide-y">
                    {clientMaintenanceRequests.map((request) => (
                      <div key={request.id} className="grid grid-cols-12 items-center p-3 text-sm">
                        <div className="col-span-3 font-medium">{request.title}</div>
                        <div className="col-span-4">{request.description}</div>
                        <div className="col-span-2">
                          <Badge className={getMaintenanceStatusColor(request.status)} variant="outline">
                            {request.status.replace("_", " ").charAt(0).toUpperCase() +
                              request.status.replace("_", " ").slice(1)}
                          </Badge>
                        </div>
                        <div className="col-span-2">{formatDate(request.createdAt)}</div>
                        <div className="col-span-1">
                          <Badge
                            variant="outline"
                            className={
                              request.priority === "high" || request.priority === "emergency"
                                ? "bg-red-100 text-red-800"
                                : request.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                            }
                          >
                            {request.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Make Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
            <DialogDescription>Enter your payment details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3 flex items-center">
                  <span className="mr-2">{currency === "USD" ? "$" : "PKR"}</span>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="5000"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">
                  Payment Method
                </Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value as PaymentMethod })}
                >
                  <SelectTrigger id="method" className="col-span-3">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">
                  Reference
                </Label>
                <Input
                  id="reference"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="col-span-3"
                  placeholder="Transaction ID or reference number"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-700 hover:bg-green-800">
                Submit Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Maintenance Request Dialog */}
      <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Maintenance</DialogTitle>
            <DialogDescription>Submit a maintenance request for your apartment.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMaintenanceSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={maintenanceForm.title}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Detailed description of the maintenance issue"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={maintenanceForm.priority}
                  onValueChange={(value) => setMaintenanceForm({ ...maintenanceForm, priority: value })}
                >
                  <SelectTrigger id="priority" className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="preferredDate" className="text-right">
                  Preferred Date
                </Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={maintenanceForm.preferredDate}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, preferredDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowMaintenanceDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-700 hover:bg-green-800">
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a document to your account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDocumentSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={documentForm.title}
                  onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Document title"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={documentForm.type}
                  onValueChange={(value) => setDocumentForm({ ...documentForm, type: value })}
                >
                  <SelectTrigger id="type" className="col-span-3">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identity">Identity Document</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="payment">Payment Receipt</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File
                </Label>
                <Input id="file" type="file" onChange={handleFileChange} className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDocumentDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-700 hover:bg-green-800">
                Upload Document
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
