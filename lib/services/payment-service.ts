import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase"
import type { Payment, PaymentStatus } from "../types"

// Get all payments
export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const paymentsCollection = collection(db, "payments")
    const paymentsQuery = query(paymentsCollection, orderBy("dueDate", "desc"))
    const paymentsSnapshot = await getDocs(paymentsQuery)

    return paymentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate(),
          paidDate: doc.data().paidDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Payment,
    )
  } catch (error) {
    console.error("Error getting payments:", error)
    throw error
  }
}

// Get payment by ID
export const getPaymentById = async (id: string): Promise<Payment | null> => {
  try {
    const paymentDoc = await getDoc(doc(db, "payments", id))

    if (paymentDoc.exists()) {
      const data = paymentDoc.data()
      return {
        id: paymentDoc.id,
        ...data,
        dueDate: data.dueDate?.toDate(),
        paidDate: data.paidDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Payment
    }

    return null
  } catch (error) {
    console.error("Error getting payment:", error)
    throw error
  }
}

// Create a new payment
export const createPayment = async (payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> => {
  try {
    const paymentData = {
      ...payment,
      dueDate: payment.dueDate,
      paidDate: payment.paidDate || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "payments"), paymentData)

    return {
      id: docRef.id,
      ...payment,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error creating payment:", error)
    throw error
  }
}

// Update a payment
export const updatePayment = async (
  id: string,
  payment: Partial<Omit<Payment, "id" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  try {
    const paymentRef = doc(db, "payments", id)

    await updateDoc(paymentRef, {
      ...payment,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating payment:", error)
    throw error
  }
}

// Delete a payment
export const deletePayment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "payments", id))
  } catch (error) {
    console.error("Error deleting payment:", error)
    throw error
  }
}

// Get payments by client ID
export const getPaymentsByClient = async (clientId: string): Promise<Payment[]> => {
  try {
    const paymentsCollection = collection(db, "payments")
    const paymentsQuery = query(paymentsCollection, where("clientId", "==", clientId), orderBy("dueDate", "desc"))
    const paymentsSnapshot = await getDocs(paymentsQuery)

    return paymentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate(),
          paidDate: doc.data().paidDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Payment,
    )
  } catch (error) {
    console.error("Error getting payments by client:", error)
    throw error
  }
}

// Get payments by status
export const getPaymentsByStatus = async (status: PaymentStatus): Promise<Payment[]> => {
  try {
    const paymentsCollection = collection(db, "payments")
    const paymentsQuery = query(paymentsCollection, where("status", "==", status), orderBy("dueDate"))
    const paymentsSnapshot = await getDocs(paymentsQuery)

    return paymentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate(),
          paidDate: doc.data().paidDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Payment,
    )
  } catch (error) {
    console.error("Error getting payments by status:", error)
    throw error
  }
}

// Get upcoming payments
export const getUpcomingPayments = async (days = 30): Promise<Payment[]> => {
  try {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    const paymentsCollection = collection(db, "payments")
    const paymentsQuery = query(
      paymentsCollection,
      where("status", "==", "pending"),
      where("dueDate", ">=", now),
      where("dueDate", "<=", futureDate),
      orderBy("dueDate"),
    )
    const paymentsSnapshot = await getDocs(paymentsQuery)

    return paymentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate(),
          paidDate: doc.data().paidDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Payment,
    )
  } catch (error) {
    console.error("Error getting upcoming payments:", error)
    throw error
  }
}
