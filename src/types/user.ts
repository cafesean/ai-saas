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

export interface UserWithStats extends Omit<User, 'password' | 'avatar'> {
  password?: string | null;
  avatar?: string | null;
  roleCount: number;
  orgCount: number;
  lastLoginAt: Date | null;
  roles: Array<{
    id: number;
    name: string;
    orgId: number;
    orgName: string;
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
  orgId?: number;
  lastLoginRange?: [Date, Date];
}

export interface UserBulkActions {
  selectedIds: number[];
  action: 'activate' | 'deactivate' | 'delete' | 'assignRole' | 'removeRole';
}

export interface UserRoleAssignment {
  userId: number;
  orgId: number;
  roleId: number;
  isActive: boolean;
  assignedAt: Date;
  assignedBy: number | null;
} 