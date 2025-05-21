// lib/auth.ts (Node.js environment utilities)

import { hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { cookies } from "next/headers"; // For Server Components / API Routes (Node.js runtime)
import { getUserByEmail, UserFromDB } from "./db"; // Assuming ./db exports UserFromDB type and uses Node.js compatible DB driver
import type { UserTokenPayload } from "./auth-edge"; // Import the JWT payload type

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn(
    "JWT_SECRET is not set in environment variables. Using a default, insecure key. CHANGE THIS IN PRODUCTION!"
  );
}
const resolvedJwtSecret = JWT_SECRET || "your-very-insecure-default-secret-key-for-dev-only";

const SALT_ROUNDS = 10;

// Re-export from auth-edge for convenience if you want a single point of import for Node.js contexts
// (though it's often clearer to import directly from auth-edge.ts when you know you need the edge version)
export { verifyTokenEdge } from "./auth-edge";
export type { UserTokenPayload }; // Re-export the type

// --- BCrypt Functions (Node.js only) ---
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// --- JWT Functions (for Node.js context) ---

// Define a type for the user object passed to generateToken,
// ensuring it has the necessary properties for the UserTokenPayload.
// This could also be your UserFromDB type if it matches.
interface UserInputForToken {
  id: string | number; // Or whatever type your user.id is
  email: string;
  role: "admin" | "manager" | "staff" | "client"; // Use the same specific roles
  name: string;
  // Add any other fields you might have that match UserFromDB if applicable
}

export function generateToken(user: UserInputForToken): string {
  const payload: UserTokenPayload = {
    id: String(user.id), // Ensure id is a string in JWT if UserTokenPayload expects string
    email: user.email,
    role: user.role,
    name: user.name,
    // Add iat (issued at) and exp (expiration) if not automatically added by sign
  };
  return sign(payload, resolvedJwtSecret, { expiresIn: "1d" });
}

// Verify JWT token (Node.js version - can be more robust if needed)
export function verifyNodeToken(token: string): UserTokenPayload | null {
  if (!token) {
    return null;
  }
  try {
    return verify(token, resolvedJwtSecret) as UserTokenPayload;
  } catch (error) {
    console.error("Node Token Verification Error:", (error as Error).message);
    return null;
  }
}

// --- Cookie and Session Management (Node.js context using `next/headers`) ---

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: "lax", // "lax" is often a good default, "strict" can have usability issues
  });
}

export async function clearAuthCookie(): Promise<void> {
  // To ensure deletion, you can set maxAge to 0 or a past date
  const cookieStore = cookies();
  cookieStore.set({
    name: "auth_token",
    value: "",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    sameSite: "lax",
  });
  // cookieStore.delete("auth_token"); // delete might not work across all browsers/setups as reliably for HttpOnly
}

// Define a type for the user object returned by getCurrentUser,
// which should not include sensitive info like password_hash.
// This might be similar to UserTokenPayload but could include more non-sensitive DB fields.
export interface AuthenticatedUser extends Omit<UserFromDB, "password_hash"> {
  // Omit password_hash, add other fields if necessary
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get("auth_token");

  if (!tokenCookie?.value) {
    return null;
  }

  const decodedToken = verifyNodeToken(tokenCookie.value);
  if (!decodedToken || !decodedToken.email) {
    await clearAuthCookie(); // Clear invalid or malformed token
    return null;
  }

  try {
    const userFromDb = await getUserByEmail(decodedToken.email);
    
    if (!userFromDb) {
      await clearAuthCookie(); // User in token no longer exists in DB
      return null;
    }

    // Ensure the user from DB has the role specified in the token,
    // or handle discrepancies as per your security policy.
    // For now, we trust the DB role if different from token, but log it.
    if (userFromDb.role !== decodedToken.role) {
        console.warn(`Role mismatch for user ${decodedToken.email}: DB role is ${userFromDb.role}, token role was ${decodedToken.role}. Using DB role.`);
    }

    // Destructure to remove password_hash and ensure correct type
    const { password_hash, ...userToReturn } = userFromDb;

    // Ensure the returned user matches the AuthenticatedUser structure.
    // This step is mostly for type safety and clarity.
    const authenticatedUser: AuthenticatedUser = {
      ...userToReturn, // Spread the properties from userFromDb (without password_hash)
      id: String(userToReturn.id), // Ensure ID is consistently string if that's your app standard
      email: userToReturn.email,
      name: userToReturn.name,
      role: userToReturn.role,
      // map other properties from userToReturn to AuthenticatedUser as needed
    };
    
    return authenticatedUser;
  } catch (error) {
    console.error("Error fetching user in getCurrentUser:", error);
    await clearAuthCookie(); // Clear token if fetching user fails
    return null;
  }
}

// --- Authorization Helper for API Routes / Server Components (Node.js context) ---
interface AuthResult {
  authenticated: boolean;
  authorized?: boolean; // Optional: only relevant if authenticated
  user: AuthenticatedUser | null;
}

export async function requireAuth(
  requiredRole?: "admin" | "manager" | "staff" | "client"
): Promise<AuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { authenticated: false, user: null };
  }

  if (requiredRole && user.role !== requiredRole) {
    // Check for hierarchical roles if applicable (e.g., admin can do manager tasks)
    // For simplicity here, it's a direct match.
    // Example: if (requiredRole === "manager" && (user.role === "admin" || user.role === "manager"))
    return { authenticated: true, authorized: false, user };
  }

  return { authenticated: true, authorized: true, user };
}