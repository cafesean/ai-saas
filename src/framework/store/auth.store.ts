import { type User, type Session } from "next-auth";
import { signIn } from "next-auth/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SessionRole } from "@/framework/types/role";

/**
 * Enhanced Auth Store for RBAC System
 * 
 * This store manages user authentication state, permissions, and roles
 * for the AI SaaS Platform's RBAC implementation.
 */

// Types for RBAC
export interface UserProfile {
	id: string;
	email: string;
	name?: string;
	image?: string;
	tenantId?: string;
}

export interface UserRole {
	id: number;
	name: string;
	description?: string;
	isSystemRole: boolean;
}

export interface AuthState {
	// User data
	user: UserProfile | null;
	role: UserRole | null;
	permissions: string[]; // Array of permission slugs
	
	// Authentication status
	authenticated: boolean;
	loading: boolean;
	
	// Session management
	sessionData: Session | null;
	
	// Legacy fields for backward compatibility
	id: number | null;
	email: string;
	walletAddress: string;
	socials: string[];
	orgUser: { org_id: number; user_id: number; role: string }[];
	roles: number[] | null;
	status: number;
}

export interface AuthActions {
	// Authentication actions
	login: (sessionData: Session) => void;
	logout: () => void;
	
	// Permission management
	updatePermissions: (permissions: string[]) => void;
	hasPermission: (slug: string) => boolean;
	
	// User data management
	setUser: (user: UserProfile) => void;
	setRole: (role: UserRole) => void;
	setLoading: (loading: boolean) => void;
	
	// Legacy compatibility methods
	loginWithEmail: (email: string, password: string) => Promise<{ status: number }>;
	loginWithProvider: (provider: string) => Promise<{ status: number }>;
	setSessionData: (sessionData: any) => void;
	setWalletAddress: (walletAddress: string) => void;
	setIsConnected: (isConnected: boolean) => void;
	bind: (platform: string) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
	// RBAC state
	user: null,
	role: null,
	permissions: [],
	authenticated: false,
	loading: false,
	sessionData: null,
	
	// Legacy state for backward compatibility
	id: null,
	email: "",
	walletAddress: "",
	socials: [],
	orgUser: [],
	roles: null,
	status: 0,
};

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			...initialState,

			// === RBAC Methods ===
			
			      login: (sessionData: Session) => {
        const user = sessionData.user;
        if (!user) return;

        // Extract user profile from session
        const userProfile: UserProfile = {
          id: user.id.toString(),
          email: user.email || "",
          name: user.name || undefined,
          image: user.avatar || undefined,
          tenantId: undefined, // Will be added when multi-tenancy is implemented
        };

        // Extract role information from the first role (primary role)
        const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;
        const role: UserRole | null = primaryRole ? {
          id: primaryRole.id,
          name: primaryRole.name,
          description: primaryRole.title,
          isSystemRole: true, // Assuming system roles for now
        } : null;

        // Extract permissions from role policies
        const permissions: string[] = [];
        if (user.roles) {
          user.roles.forEach(role => {
            if (role.policies) {
              role.policies.forEach(policy => {
                // Convert legacy CRUD permissions to new permission slugs
                if (policy.can_create) permissions.push(`${policy.name}:create`);
                if (policy.can_read) permissions.push(`${policy.name}:read`);
                if (policy.can_update) permissions.push(`${policy.name}:update`);
                if (policy.can_delete) permissions.push(`${policy.name}:delete`);
              });
            }
          });
        }

        set({
          user: userProfile,
          role,
          permissions,
          authenticated: true,
          loading: false,
          sessionData,
          // Legacy compatibility
          id: user.id,
          email: user.email || "",
        });

        console.log("Auth store updated with RBAC data:", {
          user: userProfile,
          role,
          permissionCount: permissions.length,
        });
      },

			logout: () => {
				console.log("Logging out and clearing auth store");
				set(initialState);
			},

			updatePermissions: (permissions: string[]) => {
				set({ permissions });
				console.log(`Updated user permissions: ${permissions.length} permissions`);
			},

			hasPermission: (slug: string): boolean => {
				const { permissions } = get();
				return permissions.includes(slug);
			},

			setUser: (user: UserProfile) => {
				set({ user });
			},

			setRole: (role: UserRole) => {
				set({ role });
			},

			setLoading: (loading: boolean) => {
				set({ loading });
			},

			// === Legacy Compatibility Methods ===

			loginWithEmail: async (email: string, password: string) => {
				set({ loading: true });
				try {
					const signResponse = await signIn("credentials", {
						email,
						password,
						redirect: false,
					});

					if (signResponse && signResponse.status !== 200) {
						set({ loading: false });
						return { status: signResponse.status || 400 };
					}

					// Note: The actual session data will be set by the login method
					// when the session is available
					set({ 
						authenticated: true,
						email,
						loading: false,
					});

					console.log("Legacy login successful");
					return { status: 200 };
				} catch (error) {
					console.error("Login error:", error);
					set({ loading: false });
					return { status: 500 };
				}
			},

			loginWithProvider: async (provider: string) => {
				set({ loading: true });
				try {
					const signResponse = await signIn(provider);

					if (signResponse && signResponse.status !== 200) {
						set({ loading: false });
						return { status: signResponse.status || 400 };
					}

					set({ 
						authenticated: true,
						loading: false,
					});

					console.log("Provider login successful");
					return { status: 200 };
				} catch (error) {
					console.error("Provider login error:", error);
					set({ loading: false });
					return { status: 500 };
				}
			},

			setSessionData: (sessionData: any) => {
				set({ sessionData });
			},

			setWalletAddress: (walletAddress: string) => {
				set({ walletAddress });
			},

			setIsConnected: (isConnected: boolean) => {
				set({ authenticated: isConnected });
			},

			bind: (platform: string) => {
				// Legacy method - implementation depends on specific requirements
				console.log(`Binding platform: ${platform}`);
			},
		}),
		{
			name: "app-auth-storage", // Changed to match testing requirements
			// Only persist essential data for security
			partialize: (state) => ({
				user: state.user,
				role: state.role,
				permissions: state.permissions,
				authenticated: state.authenticated,
				// Legacy fields
				id: state.id,
				email: state.email,
				orgUser: state.orgUser,
				roles: state.roles,
			}),
		}
	)
);

// Helper functions for easy access
export const getAuthState = () => useAuthStore.getState();
export const isAuthenticated = () => useAuthStore.getState().authenticated;
export const hasPermission = (slug: string) => useAuthStore.getState().hasPermission(slug);
export const getUserPermissions = () => useAuthStore.getState().permissions;
export const getCurrentUser = () => useAuthStore.getState().user;
export const getCurrentRole = () => useAuthStore.getState().role;
