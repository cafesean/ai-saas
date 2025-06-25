import { type Session } from "next-auth";
import { signOut } from "next-auth/react";

/**
 * Auth Session Management for Framework
 * 
 * This module provides utilities for session management without client-side state.
 * Re-export from the main auth-hydration module for backward compatibility.
 */

// Re-export types and utilities from the main auth module
export type { ExtendedSession, ExtendedUser } from "../../db/auth-hydration";
export { 
  startSessionMonitoring, 
  stopSessionMonitoring, 
  isSessionMonitoringActive,
  getSessionConnectionState,
  SessionUtils
} from "../../db/auth-hydration";

/**
 * Backward compatibility exports
 * These maintain the same API but use pure session-based authentication
 */

/**
 * @deprecated Use useAuthSession from @/framework/hooks/useAuthSession instead
 * This function is kept for backward compatibility but does nothing
 */
export function hydrateAuthStore(session: Session | null): void {
  console.warn("hydrateAuthStore is deprecated - auth is now purely session-based");
  // No-op function for backward compatibility
}

/**
 * @deprecated Use useAuthSession hook directly instead
 * This hook is kept for backward compatibility
 */
export function useAuthHydration(session: Session | null, status: "loading" | "authenticated" | "unauthenticated"): void {
  console.warn("useAuthHydration is deprecated - use useAuthSession hook directly");
  // No-op function for backward compatibility
} 