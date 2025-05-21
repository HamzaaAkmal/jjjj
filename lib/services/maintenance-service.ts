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
import type { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from "../types"

// Get all maintenance requests
export const getAllMaintenanceRequests = async (): Promise<MaintenanceRequest[]> => {
  try {
    const requestsCollection = collection(db, "maintenanceRequests")
    const requestsQuery = query(requestsCollection, orderBy("createdAt", "desc"))
    const requestsSnapshot = await getDocs(requestsQuery)

    return requestsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          scheduledDate: doc.data().scheduledDate?.toDate(),
          completedDate: doc.data().completedDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as MaintenanceRequest,
    )
  } catch (error) {
    console.error("Error getting maintenance requests:", error)
    throw error
  }
}

// Get maintenance request by ID
export const getMaintenanceRequestById = async (id: string): Promise<MaintenanceRequest | null> => {
  try {
    const requestDoc = await getDoc(doc(db, "maintenanceRequests", id))

    if (requestDoc.exists()) {
      const data = requestDoc.data()
      return {
        id: requestDoc.id,
        ...data,
        scheduledDate: data.scheduledDate?.toDate(),
        completedDate: data.completedDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as MaintenanceRequest
    }

    return null
  } catch (error) {
    console.error("Error getting maintenance request:", error)
    throw error
  }
}

// Create a new maintenance request
export const createMaintenanceRequest = async (
  request: Omit<MaintenanceRequest, "id" | "createdAt" | "updatedAt">,
): Promise<MaintenanceRequest> => {
  try {
    const requestData = {
      ...request,
      scheduledDate: request.scheduledDate || null,
      completedDate: request.completedDate || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "maintenanceRequests"), requestData)

    return {
      id: docRef.id,
      ...request,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error creating maintenance request:", error)
    throw error
  }
}

// Update a maintenance request
export const updateMaintenanceRequest = async (
  id: string,
  request: Partial<Omit<MaintenanceRequest, "id" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  try {
    const requestRef = doc(db, "maintenanceRequests", id)

    await updateDoc(requestRef, {
      ...request,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating maintenance request:", error)
    throw error
  }
}

// Delete a maintenance request
export const deleteMaintenanceRequest = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "maintenanceRequests", id))
  } catch (error) {
    console.error("Error deleting maintenance request:", error)
    throw error
  }
}

// Get maintenance requests by client ID
export const getMaintenanceRequestsByClient = async (clientId: string): Promise<MaintenanceRequest[]> => {
  try {
    const requestsCollection = collection(db, "maintenanceRequests")
    const requestsQuery = query(requestsCollection, where("clientId", "==", clientId), orderBy("createdAt", "desc"))
    const requestsSnapshot = await getDocs(requestsQuery)

    return requestsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          scheduledDate: doc.data().scheduledDate?.toDate(),
          completedDate: doc.data().completedDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as MaintenanceRequest,
    )
  } catch (error) {
    console.error("Error getting maintenance requests by client:", error)
    throw error
  }
}

// Get maintenance requests by status
export const getMaintenanceRequestsByStatus = async (status: MaintenanceStatus): Promise<MaintenanceRequest[]> => {
  try {
    const requestsCollection = collection(db, "maintenanceRequests")
    const requestsQuery = query(requestsCollection, where("status", "==", status), orderBy("createdAt", "desc"))
    const requestsSnapshot = await getDocs(requestsQuery)

    return requestsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          scheduledDate: doc.data().scheduledDate?.toDate(),
          completedDate: doc.data().completedDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as MaintenanceRequest,
    )
  } catch (error) {
    console.error("Error getting maintenance requests by status:", error)
    throw error
  }
}

// Get maintenance requests by priority
export const getMaintenanceRequestsByPriority = async (
  priority: MaintenancePriority,
): Promise<MaintenanceRequest[]> => {
  try {
    const requestsCollection = collection(db, "maintenanceRequests")
    const requestsQuery = query(requestsCollection, where("priority", "==", priority), orderBy("createdAt", "desc"))
    const requestsSnapshot = await getDocs(requestsQuery)

    return requestsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          scheduledDate: doc.data().scheduledDate?.toDate(),
          completedDate: doc.data().completedDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as MaintenanceRequest,
    )
  } catch (error) {
    console.error("Error getting maintenance requests by priority:", error)
    throw error
  }
}
