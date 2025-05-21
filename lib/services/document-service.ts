import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "../firebase"
import type { Document, DocumentType } from "../types"

// Get all documents
export const getAllDocuments = async (): Promise<Document[]> => {
  try {
    const documentsCollection = collection(db, "documents")
    const documentsQuery = query(documentsCollection, orderBy("createdAt", "desc"))
    const documentsSnapshot = await getDocs(documentsQuery)

    return documentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Document,
    )
  } catch (error) {
    console.error("Error getting documents:", error)
    throw error
  }
}

// Get document by ID
export const getDocumentById = async (id: string): Promise<Document | null> => {
  try {
    const documentDoc = await getDoc(doc(db, "documents", id))

    if (documentDoc.exists()) {
      const data = documentDoc.data()
      return {
        id: documentDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Document
    }

    return null
  } catch (error) {
    console.error("Error getting document:", error)
    throw error
  }
}

// Get documents by client ID
export const getDocumentsByClient = async (clientId: string): Promise<Document[]> => {
  try {
    const documentsCollection = collection(db, "documents")
    const documentsQuery = query(documentsCollection, where("clientId", "==", clientId), orderBy("createdAt", "desc"))
    const documentsSnapshot = await getDocs(documentsQuery)

    return documentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Document,
    )
  } catch (error) {
    console.error("Error getting documents by client:", error)
    throw error
  }
}

// Upload a document file and create document record
export const uploadDocument = async (
  file: File,
  documentData: Omit<Document, "id" | "fileUrl" | "createdAt" | "updatedAt">,
): Promise<Document> => {
  try {
    // Create a unique file path
    const filePath = `documents/${documentData.clientId}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, filePath)

    // Upload file to Firebase Storage
    await uploadBytes(storageRef, file)

    // Get download URL
    const fileUrl = await getDownloadURL(storageRef)

    // Create document record in Firestore
    const docData = {
      ...documentData,
      fileUrl,
      filePath,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "documents"), docData)

    return {
      id: docRef.id,
      ...docData,
      fileUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Document
  } catch (error) {
    console.error("Error uploading document:", error)
    throw error
  }
}

// Delete a document and its file
export const deleteDocument = async (id: string): Promise<void> => {
  try {
    // Get document to get file path
    const documentDoc = await getDoc(doc(db, "documents", id))

    if (documentDoc.exists()) {
      const data = documentDoc.data()

      // Delete file from storage if filePath exists
      if (data.filePath) {
        const storageRef = ref(storage, data.filePath)
        await deleteObject(storageRef)
      }

      // Delete document record
      await deleteDoc(doc(db, "documents", id))
    }
  } catch (error) {
    console.error("Error deleting document:", error)
    throw error
  }
}

// Get documents by type
export const getDocumentsByType = async (type: DocumentType): Promise<Document[]> => {
  try {
    const documentsCollection = collection(db, "documents")
    const documentsQuery = query(documentsCollection, where("type", "==", type), orderBy("createdAt", "desc"))
    const documentsSnapshot = await getDocs(documentsQuery)

    return documentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }) as Document,
    )
  } catch (error) {
    console.error("Error getting documents by type:", error)
    throw error
  }
}
