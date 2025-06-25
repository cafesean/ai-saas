// User-Organization relationship types for JSONB structure (SAAS-140)

export interface UserOrgRelationship {
  orgId: number;
  role: string;
  isActive: boolean;
  joinedAt: string; // ISO date string
  permissions?: string[]; // Optional cached permissions
}

export interface UserOrgData {
  currentOrgId: number | null;
  orgs: UserOrgRelationship[];
}

// Helper types for common operations
export interface UserWithOrgContext {
  id: number;
  email: string;
  name?: string;
  orgData: UserOrgData;
  currentOrg?: UserOrgRelationship;
}

// Database query helpers
export interface OrgMembershipQuery {
  userId: number;
  orgId: number;
}

export interface OrgSwitchRequest {
  userId: number;
  newOrgId: number;
}

// Validation schemas (for use with Zod)
export const userOrgRelationshipSchema = {
  orgId: "number",
  role: "string", 
  isActive: "boolean",
  joinedAt: "string",
  permissions: "array of strings (optional)"
} as const;

export const userOrgDataSchema = {
  currentOrgId: "number or null",
  orgs: "array of UserOrgRelationship"
} as const;

// Common role constants
export const ORG_ROLES = {
  OWNER: "owner",
  ADMIN: "admin", 
  MEMBER: "member",
  VIEWER: "viewer"
} as const;

export type OrgRole = typeof ORG_ROLES[keyof typeof ORG_ROLES];

// Utility type for org switching
export interface OrgSwitchResult {
  success: boolean;
  newCurrentOrgId?: number;
  error?: string;
} 