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
import type { Apartment, ApartmentStatus } from "../types"

// Get all apartments
export const getAllApartments = async (): Promise<Apartment[]> => {
  try {
    const apartmentsCollection = collection(db, "apartments")
    const apartmentsQuery = query(apartmentsCollection, orderBy("buildingId"), orderBy("number"))
    const apartmentsSnapshot = await getDocs(apartmentsQuery)

    return apartmentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Apartment,
    )
  } catch (error) {
    console.error("Error getting apartments:", error)
    throw error
  }
}

// Get apartment by ID
export const getApartmentById = async (id: string): Promise<Apartment | null> => {
  try {
    const apartmentDoc = await getDoc(doc(db, "apartments", id))

    if (apartmentDoc.exists()) {
      const data = apartmentDoc.data()
      return {
        id: apartmentDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Apartment
    }

    return null
  } catch (error) {
    console.error("Error getting apartment:", error)
    throw error
  }
}

// Create a new apartment
export const createApartment = async (
  apartment: Omit<Apartment, "id" | "createdAt" | "updatedAt">,
): Promise<Apartment> => {
  try {
    const apartmentData = {
      ...apartment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "apartments"), apartmentData)

    return {
      id: docRef.id,
      ...apartment,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error creating apartment:", error)
    throw error
  }
}

// Update an apartment
export const updateApartment = async (
  id: string,
  apartment: Partial<Omit<Apartment, "id" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  try {
    const apartmentRef = doc(db, "apartments", id)

    await updateDoc(apartmentRef, {
      ...apartment,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating apartment:", error)
    throw error
  }
}

// Delete an apartment
export const deleteApartment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "apartments", id))
  } catch (error) {
    console.error("Error deleting apartment:", error)
    throw error
  }
}

// Get apartments by building ID
export const getApartmentsByBuilding = async (buildingId: string): Promise<Apartment[]> => {
  try {
    const apartmentsCollection = collection(db, "apartments")
    const apartmentsQuery = query(apartmentsCollection, where("buildingId", "==", buildingId), orderBy("number"))
    const apartmentsSnapshot = await getDocs(apartmentsQuery)

    return apartmentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Apartment,
    )
  } catch (error) {
    console.error("Error getting apartments by building:", error)
    throw error
  }
}

// Get apartments by status
export const getApartmentsByStatus = async (status: ApartmentStatus): Promise<Apartment[]> => {
  try {
    const apartmentsCollection = collection(db, "apartments")
    const apartmentsQuery = query(apartmentsCollection, where("status", "==", status))
    const apartmentsSnapshot = await getDocs(apartmentsQuery)

    return apartmentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Apartment,
    )
  } catch (error) {
    console.error("Error getting apartments by status:", error)
    throw error
  }
}
