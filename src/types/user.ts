export interface User {
  id: number;
  uuid: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  password: string | null;
  avatar: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithStats extends User {
  roleCount: number;
  tenantCount: number;
  lastLoginAt: Date | null;
  roles: Array<{
    id: number;
    name: string;
    tenantId: number;
    tenantName: string;
    isActive: boolean;
  }>;
}

export interface UserTableColumn {
  key: keyof UserWithStats | 'actions';
  header: string;
  cell?: (info: { getValue: () => any; row: { original: UserWithStats } }) => React.ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  width?: number;
}

export interface UserFormData {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  username?: string;
  isActive: boolean;
  password?: string;
}

export interface UserFilters {
  search: string;
  isActive?: boolean;
  roleId?: number;
  tenantId?: number;
  lastLoginRange?: [Date, Date];
}

export interface UserBulkActions {
  selectedIds: number[];
  action: 'activate' | 'deactivate' | 'delete' | 'assignRole' | 'removeRole';
}

export interface UserRoleAssignment {
  userId: number;
  tenantId: number;
  roleId: number;
  isActive: boolean;
  assignedAt: Date;
  assignedBy: number | null;
} 