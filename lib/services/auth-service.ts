import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
  type UserCredential,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../firebase"
import type { UserRole } from "../types"

// Register a new user
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  role: UserRole = "client",
): Promise<UserCredential> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with display name
    await updateProfile(user, {
      displayName: name,
    })

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      name,
      role,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    })

    return userCredential
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

// Sign in user
export const signInUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    // Update last login time
    await setDoc(
      doc(db, "users", userCredential.user.uid),
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true },
    )

    return userCredential
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

// Get user data from Firestore
export const getUserData = async (user: User) => {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (userDoc.exists()) {
      return userDoc.data()
    }
    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    throw error
  }
}

// Check if user is admin
export const isAdmin = async (user: User): Promise<boolean> => {
  try {
    const userData = await getUserData(user)
    return userData?.role === "admin" || userData?.role === "manager"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
