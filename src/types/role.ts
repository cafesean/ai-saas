export interface Role {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleWithStats extends Role {
  permissionCount: number;
  userCount: number;
  _count?: {
    permissions: number;
    users: number;
  };
}

export interface RoleTableColumn {
  key: keyof RoleWithStats | 'actions';
  header: string;
  cell?: (info: { getValue: () => any; row: { original: RoleWithStats } }) => React.ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  width?: number;
}

export interface RoleFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface RoleFilters {
  search: string;
  isActive?: boolean;
  isSystemRole?: boolean;
  permissionCountRange?: [number, number];
}

export interface RoleBulkActions {
  selectedIds: number[];
  action: 'activate' | 'deactivate' | 'delete';
} 