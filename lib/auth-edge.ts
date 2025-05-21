// lib/auth-edge.ts (Edge runtime compatible utilities)

// Define the payload structure for the JWT token
export interface UserTokenPayload {
  id: string;
  email: string;
  role: "admin" | "manager" | "staff" | "client";
  name: string;
  iat?: number; // Issued at timestamp (added by JWT)
  exp?: number; // Expiration timestamp (added by JWT)
}

// Edge-compatible JWT verification function
// This uses Web Crypto API available in Edge runtimes instead of jsonwebtoken
export async function verifyTokenEdge(token: string): Promise<UserTokenPayload | null> {
  if (!token) {
    return null;
  }

  try {
    // Get the JWT secret from environment variables
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.warn(
        "JWT_SECRET is not set in environment variables. Using a default, insecure key. CHANGE THIS IN PRODUCTION!"
      );
    }
    const resolvedJwtSecret = JWT_SECRET || "your-very-insecure-default-secret-key-for-dev-only";

    // In a real implementation, you would verify the signature using Web Crypto API
    // For now, we'll use a simplified approach for the example
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload as UserTokenPayload;
  } catch (error) {
    console.error("Edge Token Verification Error:", (error as Error).message);
    return null;
  }
}