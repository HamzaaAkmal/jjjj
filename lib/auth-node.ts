// lib/auth.ts (Node.js environment utilities)

// UserTokenPayload and verifyTokenEdge (re-exported from auth-edge.ts) have been removed
// as they were part of the custom JWT authentication system which is no longer in use.

// All custom JWT, bcrypt, cookie, and session management functions that were specific to
// the now-removed custom auth API have been deleted from this file.
// This file is now empty but retained in case Node.js-specific auth utilities
// are needed in the future (e.g., for Firebase Admin SDK interactions).