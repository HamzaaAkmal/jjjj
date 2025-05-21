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
import type { Client, ClientType, ClientStatus } from "../types"

// Get all clients
export const getAllClients = async (): Promise<Client[]> => {
  try {
    const clientsCollection = collection(db, "clients")
    const clientsQuery = query(clientsCollection, orderBy("createdAt", "desc"))
    const clientsSnapshot = await getDocs(clientsQuery)

    return clientsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Client,
    )
  } catch (error) {
    console.error("Error getting clients:", error)
    throw error
  }
}

// Get client by ID
export const getClientById = async (id: string): Promise<Client | null> => {
  try {
    const clientDoc = await getDoc(doc(db, "clients", id))

    if (clientDoc.exists()) {
      const data = clientDoc.data()
      return {
        id: clientDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Client
    }

    return null
  } catch (error) {
    console.error("Error getting client:", error)
    throw error
  }
}

// Get clients by user ID
export const getClientByUserId = async (userId: string): Promise<Client | null> => {
  try {
    const clientsCollection = collection(db, "clients")
    const clientsQuery = query(clientsCollection, where("userId", "==", userId))
    const clientsSnapshot = await getDocs(clientsQuery)

    if (!clientsSnapshot.empty) {
      const doc = clientsSnapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Client
    }

    return null
  } catch (error) {
    console.error("Error getting client by user ID:", error)
    throw error
  }
}

// Create a new client
export const createClient = async (client: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> => {
  try {
    const clientData = {
      ...client,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "clients"), clientData)

    return {
      id: docRef.id,
      ...client,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error creating client:", error)
    throw error
  }
}

// Update a client
export const updateClient = async (
  id: string,
  client: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  try {
    const clientRef = doc(db, "clients", id)

    await updateDoc(clientRef, {
      ...client,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating client:", error)
    throw error
  }
}

// Delete a client
export const deleteClient = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "clients", id))
  } catch (error) {
    console.error("Error deleting client:", error)
    throw error
  }
}

// Get clients by type
export const getClientsByType = async (type: ClientType): Promise<Client[]> => {
  try {
    const clientsCollection = collection(db, "clients")
    const clientsQuery = query(clientsCollection, where("type", "==", type), orderBy("createdAt", "desc"))
    const clientsSnapshot = await getDocs(clientsQuery)

    return clientsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Client,
    )
  } catch (error) {
    console.error("Error getting clients by type:", error)
    throw error
  }
}

// Get clients by status
export const getClientsByStatus = async (status: ClientStatus): Promise<Client[]> => {
  try {
    const clientsCollection = collection(db, "clients")
    const clientsQuery = query(clientsCollection, where("status", "==", status), orderBy("createdAt", "desc"))
    const clientsSnapshot = await getDocs(clientsQuery)

    return clientsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Client,
    )
  } catch (error) {
    console.error("Error getting clients by status:", error)
    throw error
  }
}
