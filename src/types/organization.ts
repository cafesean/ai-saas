// Organization types for UI components
// Based on the tenant router and database schema

export interface OrganizationUser {
  userId: number;
  userUuid: string;
  userName: string | null;
  userEmail: string;
  userIsActive: boolean; 
  tenantRole: string;
  relationshipIsActive: boolean;
  joinedAt: Date;
}

export interface OrganizationWithStats {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  slug: string | null;
  logoUrl: string | null;
  website: string | null;
  businessAddress: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userCount: number;
  activeUserCount: number;
  _count: {
    users: number;
  };
}

export interface OrganizationDetails extends OrganizationWithStats {
  users: OrganizationUser[];
}

export interface CreateOrganizationData {
  name: string;
  description?: string;
  slug?: string;
  logoUrl?: string;
  website?: string;
  businessAddress?: string;
  isActive?: boolean;
}

export interface UpdateOrganizationData extends Partial<CreateOrganizationData> {
  id: number;
}

export interface OrganizationUserManagement {
  tenantId: number;
  userId: number;
  role: string;
}

// Filter and pagination types
export interface OrganizationFilters {
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface OrganizationListResponse {
  tenants: OrganizationWithStats[];
  totalCount: number;
  hasMore: boolean;
}

// Status options
export const ORGANIZATION_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

export type OrganizationStatus = typeof ORGANIZATION_STATUS[keyof typeof ORGANIZATION_STATUS];

// Common role options for organizations (these could be fetched from roles table later)
export const ORGANIZATION_ROLES = [
  'Admin',
  'Manager', 
  'Member',
  'Viewer',
] as const;

export type OrganizationRole = typeof ORGANIZATION_ROLES[number];