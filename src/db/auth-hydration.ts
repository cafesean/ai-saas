import { type Session } from "next-auth";
import { useAuthStore } from "@/framework/store/auth.store";
import { signOut } from "next-auth/react";

/**
 * Auth Store Hydration & Session Revocation Client
 * 
 * This module provides utilities for hydrating the auth store from NextAuth sessions
 * and handling real-time session revocation events.
 */

// WebSocket connection for session management
let sessionSocket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // Start with 1 second

/**
 * Hydrates the auth store with session data from NextAuth
 * 
 * @param session - NextAuth session object
 */
export function hydrateAuthStore(session: Session | null): void {
  const { setAuthState, logout } = useAuthStore.getState();
  
  setAuthState({ loading: true });
  
  try {
    if (session?.user) {
      console.log("Hydrating auth store with session data");
      
      // Extract user profile
      const userProfile = {
        id: session.user.id?.toString() || '',
        email: session.user.email || '',
        name: session.user.name || undefined,
        image: session.user.avatar || undefined,
      };

      // Extract primary role
      const primaryRole = session.user.roles?.[0];
      const role = primaryRole ? {
        id: primaryRole.id?.toString() || '',
        name: primaryRole.name || '',
        description: primaryRole.title || '',
        isSystemRole: true,
      } : null;

      // Extract permissions from roles
      const permissions: any[] = [];
      
      if (session.user.roles) {
        session.user.roles.forEach(role => {
          if (role.policies) {
            role.policies.forEach(policy => {
              // Convert CRUD permissions to permission objects
              if (policy.can_create) {
                permissions.push({
                  id: `${policy.id}-create`,
                  slug: `${policy.name}:create`,
                  name: `Create ${policy.name}`,
                  category: policy.name,
                });
              }
              if (policy.can_read) {
                permissions.push({
                  id: `${policy.id}-read`,
                  slug: `${policy.name}:read`,
                  name: `Read ${policy.name}`,
                  category: policy.name,
                });
              }
              if (policy.can_update) {
                permissions.push({
                  id: `${policy.id}-update`,
                  slug: `${policy.name}:update`,
                  name: `Update ${policy.name}`,
                  category: policy.name,
                });
              }
              if (policy.can_delete) {
                permissions.push({
                  id: `${policy.id}-delete`,
                  slug: `${policy.name}:delete`,
                  name: `Delete ${policy.name}`,
                  category: policy.name,
                });
              }
            });
          }
        });
      }

      setAuthState({
        authenticated: true,
        loading: false,
        user: userProfile,
        role,
        permissions,
      });
      
      // Start session monitoring after successful hydration
      startSessionMonitoring(session.user.id.toString());
    } else {
      console.log("No session found, clearing auth store");
      logout();
      stopSessionMonitoring();
    }
  } catch (error) {
    console.error("Error hydrating auth store:", error);
    logout();
  }
}

/**
 * Starts monitoring for session revocation events via WebSocket
 * 
 * @param userId - Current user ID for session filtering
 */
export function startSessionMonitoring(userId: string): void {
  // Don't create multiple connections
  if (sessionSocket?.readyState === WebSocket.OPEN) {
    return;
  }
  
  stopSessionMonitoring(); // Clean up any existing connection
  
  try {
    // Use environment variable for WebSocket URL or fallback
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
                 `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws/session`;
    
    console.log(`Connecting to session WebSocket: ${wsUrl}`);
    sessionSocket = new WebSocket(wsUrl);
    
    sessionSocket.onopen = () => {
      console.log("Session WebSocket connected");
      reconnectAttempts = 0;
      
      // Send user identification message
      sessionSocket?.send(JSON.stringify({
        type: 'auth',
        userId: userId
      }));
    };
    
    sessionSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleSessionMessage(message, userId);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    sessionSocket.onclose = (event) => {
      console.log("Session WebSocket disconnected", event.code, event.reason);
      sessionSocket = null;
      
      // Attempt to reconnect unless it was a deliberate close
      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts); // Exponential backoff
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1})`);
        
        setTimeout(() => {
          reconnectAttempts++;
          startSessionMonitoring(userId);
        }, delay);
      }
    };
    
    sessionSocket.onerror = (error) => {
      console.error("Session WebSocket error:", error);
    };
    
  } catch (error) {
    console.error("Failed to establish session WebSocket connection:", error);
  }
}

/**
 * Stops session monitoring and closes WebSocket connection
 */
export function stopSessionMonitoring(): void {
  if (sessionSocket) {
    console.log("Closing session WebSocket connection");
    sessionSocket.close(1000, "Client disconnect");
    sessionSocket = null;
  }
  reconnectAttempts = 0;
}

/**
 * Handles incoming session management messages
 * 
 * @param message - WebSocket message object
 * @param currentUserId - Current user ID for validation
 */
function handleSessionMessage(message: any, currentUserId: string): void {
  console.log("Received session message:", message);
  
  switch (message.type) {
    case 'session-revoked':
      handleSessionRevoked(message.userId, currentUserId);
      break;
      
    case 'permissions-updated':
      handlePermissionsUpdated(message.userId, message.permissions, currentUserId);
      break;
      
    case 'role-changed':
      handleRoleChanged(message.userId, currentUserId);
      break;
      
    case 'ping':
      // Respond to ping with pong
      sessionSocket?.send(JSON.stringify({ type: 'pong' }));
      break;
      
    default:
      console.log("Unknown session message type:", message.type);
  }
}

/**
 * Handles session revocation events
 * 
 * @param revokedUserId - User ID whose session was revoked
 * @param currentUserId - Current user ID
 */
async function handleSessionRevoked(revokedUserId: string, currentUserId: string): Promise<void> {
  // Only process if it's for the current user
  if (revokedUserId !== currentUserId) {
    return;
  }
  
  console.warn("Session revoked for current user, logging out");
  
  const { logout } = useAuthStore.getState();
  
  try {
    // Clear the auth store immediately
    logout();
    
    // Stop session monitoring
    stopSessionMonitoring();
    
    // Sign out from NextAuth (this will also clear server-side session)
    await signOut({ 
      redirect: true,
      callbackUrl: '/login?reason=session-revoked'
    });
    
  } catch (error) {
    console.error("Error during session revocation cleanup:", error);
    
    // Fallback: redirect to login page
    window.location.href = '/login?reason=session-revoked';
  }
}

/**
 * Handles real-time permission updates
 * 
 * @param userId - User ID whose permissions were updated
 * @param permissions - New permission array
 * @param currentUserId - Current user ID
 */
function handlePermissionsUpdated(userId: string, permissions: string[], currentUserId: string): void {
  // Only process if it's for the current user
  if (userId !== currentUserId) {
    return;
  }
  
  console.log("Permissions updated for current user");
  
  const { setAuthState } = useAuthStore.getState();
  // Convert string permissions to Permission objects
  const permissionObjects = permissions.map((slug, index) => ({
    id: `perm-${index}`,
    slug,
    name: slug.replace(/[_:]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: slug.split(':')[0] || 'general',
  }));
  setAuthState({ permissions: permissionObjects });
}

/**
 * Handles role change events (requires session refresh)
 * 
 * @param userId - User ID whose role was changed
 * @param currentUserId - Current user ID
 */
function handleRoleChanged(userId: string, currentUserId: string): void {
  // Only process if it's for the current user
  if (userId !== currentUserId) {
    return;
  }
  
  console.log("Role changed for current user, refreshing session");
  
  // For role changes, we need to refresh the entire session
  // This will trigger a re-hydration with the new role data
  window.location.reload();
}

/**
 * Hook for components to easily hydrate auth store with session
 * 
 * Usage in components:
 * ```tsx
 * const { data: session, status } = useSession();
 * useAuthHydration(session, status);
 * ```
 */
export function useAuthHydration(session: Session | null, status: "loading" | "authenticated" | "unauthenticated"): void {
  const { setAuthState } = useAuthStore.getState();
  
  // Handle loading state
  if (status === "loading") {
    setAuthState({ loading: true });
    return;
  }
  
  // Handle authentication state changes
  if (status === "authenticated" && session) {
    hydrateAuthStore(session);
  } else if (status === "unauthenticated") {
    hydrateAuthStore(null);
  }
}

/**
 * Utility to check if session monitoring is active
 */
export function isSessionMonitoringActive(): boolean {
  return sessionSocket?.readyState === WebSocket.OPEN;
}

/**
 * Utility to get current WebSocket connection state
 */
export function getSessionConnectionState(): string {
  if (!sessionSocket) return "disconnected";
  
  switch (sessionSocket.readyState) {
    case WebSocket.CONNECTING: return "connecting";
    case WebSocket.OPEN: return "connected";
    case WebSocket.CLOSING: return "closing";
    case WebSocket.CLOSED: return "closed";
    default: return "unknown";
  }
} 