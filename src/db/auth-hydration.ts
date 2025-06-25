import { type Session } from "next-auth";
import { signOut } from "next-auth/react";

/**
 * Auth Session Management
 * 
 * This module provides utilities for session management and real-time session revocation events.
 * No client-side state management - purely session-based authentication.
 */

// Define the extended user type based on our auth system
export interface ExtendedUser {
  id: number;
  uuid: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  image?: string; // NextAuth default image property
  firstName?: string;
  lastName?: string;
  roles?: Array<{
    id: number;
    name: string;
    orgId: number;
    policies: Array<{
      id?: number;
      name: string;
      description?: string;
      can_create?: boolean;
      can_read?: boolean;
      can_update?: boolean;
      can_delete?: boolean;
    }>;
  }>;
  orgId?: number | null;
  currentOrg?: { id: number; name: string } | null;
  availableOrgs?: Array<{
    id: number;
    name: string;
    roles: string[];
    isActive: boolean;
  }>;
  orgUser?: any[];
}

export interface ExtendedSession extends Session {
  user: ExtendedUser;
}

// WebSocket connection for session management
let sessionSocket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // Start with 1 second

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
  
  try {
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
  // This will trigger a re-authentication with the new role data
  window.location.reload();
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

/**
 * Session utility functions for extracting data from sessions
 */
export const SessionUtils = {
  /**
   * Extract permissions from a session object
   */
  getPermissionsFromSession: (session: ExtendedSession | null): string[] => {
    if (!session?.user?.roles) return [];
    
    return session.user.roles.flatMap(role => 
      role.policies?.map(policy => policy.name) || []
    );
  },
  
  /**
   * Check if session has a specific permission
   */
  sessionHasPermission: (session: ExtendedSession | null, slug: string): boolean => {
    const permissions = SessionUtils.getPermissionsFromSession(session);
    return permissions.includes(slug);
  },
  
  /**
   * Check if session has any of the provided permissions
   */
  sessionHasAnyPermission: (session: ExtendedSession | null, slugs: string[]): boolean => {
    const permissions = SessionUtils.getPermissionsFromSession(session);
    return slugs.some(slug => permissions.includes(slug));
  },
  
  /**
   * Check if session has all of the provided permissions
   */
  sessionHasAllPermissions: (session: ExtendedSession | null, slugs: string[]): boolean => {
    const permissions = SessionUtils.getPermissionsFromSession(session);
    return slugs.every(slug => permissions.includes(slug));
  },
  
  /**
   * Check if session has a specific role
   */
  sessionHasRole: (session: ExtendedSession | null, roleName: string): boolean => {
    if (!session?.user?.roles) return false;
    return session.user.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
  },

  /**
   * Get user ID from session
   */
  getUserId: (session: ExtendedSession | null): number | null => {
    return session?.user?.id || null;
  },

  /**
   * Get current org ID from session
   */
  getOrgId: (session: ExtendedSession | null): number | null => {
    return session?.user?.orgId || null;
  },

  /**
   * Get user profile from session
   */
  getUserProfile: (session: ExtendedSession | null) => {
    if (!session?.user) return null;
    
    return {
      id: session.user.id?.toString() || '',
      email: session.user.email || '',
      name: session.user.name || '',
      image: session.user.avatar || session.user.image || undefined,
      uuid: session.user.uuid || '',
      username: session.user.username || '',
      firstName: session.user.firstName || '',
      lastName: session.user.lastName || '',
    };
  },
}; 