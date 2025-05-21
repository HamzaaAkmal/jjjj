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
import type { Lead, LeadStatus, LeadSource } from "../types"

// Get all leads
export const getAllLeads = async (): Promise<Lead[]> => {
  try {
    const leadsCollection = collection(db, "leads")
    const leadsQuery = query(leadsCollection, orderBy("createdAt", "desc"))
    const leadsSnapshot = await getDocs(leadsQuery)

    return leadsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          lastContact: doc.data().lastContact?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Lead,
    )
  } catch (error) {
    console.error("Error getting leads:", error)
    throw error
  }
}

// Get lead by ID
export const getLeadById = async (id: string): Promise<Lead | null> => {
  try {
    const leadDoc = await getDoc(doc(db, "leads", id))

    if (leadDoc.exists()) {
      const data = leadDoc.data()
      return {
        id: leadDoc.id,
        ...data,
        lastContact: data.lastContact?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Lead
    }

    return null
  } catch (error) {
    console.error("Error getting lead:", error)
    throw error
  }
}

// Create a new lead
export const createLead = async (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">): Promise<Lead> => {
  try {
    const leadData = {
      ...lead,
      lastContact: lead.lastContact || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "leads"), leadData)

    return {
      id: docRef.id,
      ...lead,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error creating lead:", error)
    throw error
  }
}

// Update a lead
export const updateLead = async (
  id: string,
  lead: Partial<Omit<Lead, "id" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  try {
    const leadRef = doc(db, "leads", id)

    await updateDoc(leadRef, {
      ...lead,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating lead:", error)
    throw error
  }
}

// Delete a lead
export const deleteLead = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "leads", id))
  } catch (error) {
    console.error("Error deleting lead:", error)
    throw error
  }
}

// Get leads by status
export const getLeadsByStatus = async (status: LeadStatus): Promise<Lead[]> => {
  try {
    const leadsCollection = collection(db, "leads")
    const leadsQuery = query(leadsCollection, where("status", "==", status), orderBy("createdAt", "desc"))
    const leadsSnapshot = await getDocs(leadsQuery)

    return leadsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          lastContact: doc.data().lastContact?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Lead,
    )
  } catch (error) {
    console.error("Error getting leads by status:", error)
    throw error
  }
}

// Get leads by source
export const getLeadsBySource = async (source: LeadSource): Promise<Lead[]> => {
  try {
    const leadsCollection = collection(db, "leads")
    const leadsQuery = query(leadsCollection, where("source", "==", source), orderBy("createdAt", "desc"))
    const leadsSnapshot = await getDocs(leadsQuery)

    return leadsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          lastContact: doc.data().lastContact?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Lead,
    )
  } catch (error) {
    console.error("Error getting leads by source:", error)
    throw error
  }
}
