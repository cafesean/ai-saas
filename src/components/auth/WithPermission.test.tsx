import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { WithPermission } from './WithPermission';
// Session-based testing - auth store utilities not needed

// Mock session data
let mockSessionData: any = null;
let mockSessionStatus: string = 'unauthenticated';

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: vi.fn(() => ({
    data: mockSessionData,
    status: mockSessionStatus
  }))
}));

// Helper to set mock session data
const setMockSession = (permissions: string[], roleName: string = 'Test Role') => {
  mockSessionData = {
    user: {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      roles: [
        {
          name: roleName,
          policies: permissions.map(permission => ({ name: permission }))
        }
      ]
    }
  };
  mockSessionStatus = 'authenticated';
};

const clearMockSession = () => {
  mockSessionData = null;
  mockSessionStatus = 'unauthenticated';
};

const setMockSessionLoading = () => {
  mockSessionData = null;
  mockSessionStatus = 'loading';
};

// Helper to render components with SessionProvider
const renderWithSession = (ui: React.ReactElement) => {
  return render(
    <SessionProvider session={null}>
      {ui}
    </SessionProvider>
  );
};

// Reset session before each test
beforeEach(() => {
  clearMockSession();
});

afterEach(() => {
  clearMockSession();
});

describe('WithPermission Component', () => {
  describe('Single Permission Checks', () => {
    it('should render children when user has required permission', () => {
      setMockSession(['workflow:create']);
      
      renderWithSession(
        <WithPermission permission="workflow:create">
          <div>Create Workflow Button</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Create Workflow Button')).toBeInTheDocument();
    });

    it('should not render children when user lacks required permission', () => {
      setMockSession(['workflow:read']);
      
      renderWithSession(
        <WithPermission permission="workflow:create">
          <div>Create Workflow Button</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Create Workflow Button')).not.toBeInTheDocument();
    });

    it('should render fallback when user lacks permission and fallback is provided', () => {
      setMockSession(['workflow:read']);
      
      renderWithSession(
        <WithPermission 
          permission="workflow:create"
          fallback={<div>Access Denied</div>}
        >
          <div>Create Workflow Button</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Create Workflow Button')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Multiple Permission Checks (ALL)', () => {
    it('should render when user has all required permissions', () => {
      setMockSession([
        'workflow:read',
        'workflow:create',
        'workflow:update'
      ]);
      
      renderWithSession(
        <WithPermission permissions={['workflow:read', 'workflow:create']}>
          <div>Workflow Management</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Workflow Management')).toBeInTheDocument();
    });

    it('should not render when user lacks any required permission', () => {
      setMockSession(['workflow:read']);
      
      renderWithSession(
        <WithPermission permissions={['workflow:read', 'workflow:create']}>
          <div>Workflow Management</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Workflow Management')).not.toBeInTheDocument();
    });
  });

  describe('Any Permission Checks (ANY)', () => {
    it('should render when user has any of the required permissions', () => {
      setMockSession(['workflow:read']);
      
      renderWithSession(
        <WithPermission anyPermissions={['workflow:read', 'workflow:create']}>
          <div>Workflow Access</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Workflow Access')).toBeInTheDocument();
    });

    it('should not render when user has none of the required permissions', () => {
      setMockSession(['models:read']);
      
      renderWithSession(
        <WithPermission anyPermissions={['workflow:read', 'workflow:create']}>
          <div>Workflow Access</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Workflow Access')).not.toBeInTheDocument();
    });
  });

  describe('Role-based Access', () => {
    it('should render when user has required role', () => {
      setMockSession(['admin:full_access'], 'Admin');
      
      renderWithSession(
        <WithPermission role="Admin">
          <div>Admin Panel</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    it('should not render when user lacks required role', () => {
      setMockSession(['workflow:read'], 'User');
      
      renderWithSession(
        <WithPermission role="Admin">
          <div>Admin Panel</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });

    it('should render when user has any of the required roles', () => {
      setMockSession(['workflow:create', 'documents:create'], 'Editor');
      
      renderWithSession(
        <WithPermission role={['Admin', 'Editor']}>
          <div>Content Management</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Content Management')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated Users', () => {
    it('should not render for unauthenticated users', () => {
      clearMockSession();
      
      renderWithSession(
        <WithPermission permission="workflow:read">
          <div>Protected Content</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render fallback for unauthenticated users', () => {
      clearMockSession();
      
      renderWithSession(
        <WithPermission 
          permission="workflow:read"
          fallback={<div>Please log in</div>}
        >
          <div>Protected Content</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Please log in')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should render loading component when auth is loading', () => {
      setMockSessionLoading();
      
      renderWithSession(
        <WithPermission 
          permission="workflow:read"
          showLoading={true}
          loadingComponent={<div>Loading...</div>}
        >
          <div>Protected Content</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render default loading state when no loading component provided', () => {
      setMockSessionLoading();
      
      renderWithSession(
        <WithPermission permission="workflow:read" showLoading={true}>
          <div>Protected Content</div>
        </WithPermission>
      );
      
      // Should render default loading when showLoading=true
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Hide Option', () => {
    it('should render nothing when hideWhenUnauthorized=true and user lacks permission', () => {
      setMockSession(['workflow:read']);
      
      const { container } = renderWithSession(
        <WithPermission permission="workflow:create" hideWhenUnauthorized>
          <div>Create Button</div>
        </WithPermission>
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should not render fallback when hideWhenUnauthorized=true', () => {
      setMockSession(['workflow:read']);
      
      const { container } = renderWithSession(
        <WithPermission 
          permission="workflow:create" 
          hideWhenUnauthorized
          fallback={<div>Access Denied</div>}
        >
          <div>Create Button</div>
        </WithPermission>
      );
      
      expect(container.firstChild).toBeNull();
      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply CSS classes when provided', () => {
      setMockSession(['workflow:read']);
      
      renderWithSession(
        <WithPermission 
          permission="workflow:read"
          className="test-class"
        >
          <div>Content</div>
        </WithPermission>
      );
      
      const wrapper = screen.getByText('Content').parentElement;
      expect(wrapper).toHaveClass('test-class');
    });
  });

  describe('Real User Scenarios', () => {
    it('should work with admin user', () => {
      setMockSession(['admin:role_management', 'workflow:create', 'workflow:update', 'models:read', 'models:manage'], 'Admin');
      
      renderWithSession(
        <WithPermission permission="admin:role_management">
          <div>Role Management</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Role Management')).toBeInTheDocument();
    });

    it('should work with regular user', () => {
      setMockSession(['workflow:read'], 'User');
      
      renderWithSession(
        <WithPermission permission="workflow:read">
          <div>View Workflows</div>
        </WithPermission>
      );
      
      expect(screen.getByText('View Workflows')).toBeInTheDocument();
    });

    it('should deny admin features to regular user', () => {
      setMockSession(['workflow:read'], 'User');
      
      renderWithSession(
        <WithPermission permission="admin:role_management">
          <div>Role Management</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Role Management')).not.toBeInTheDocument();
    });

    it('should work with editor permissions', () => {
      setMockSession(['workflow:create', 'documents:create'], 'Editor');
      
      renderWithSession(
        <WithPermission anyPermissions={['workflow:create', 'documents:create']}>
          <div>Create Content</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Create Content')).toBeInTheDocument();
    });
  });

  describe('Complex Permission Scenarios', () => {
    it('should handle complex admin workflow', () => {
      setMockSession(['admin:role_management', 'workflow:create', 'workflow:update', 'models:read', 'models:manage'], 'Admin');
      
      renderWithSession(
        <div>
          <WithPermission permission="admin:role_management">
            <div>Manage Roles</div>
          </WithPermission>
          <WithPermission permissions={['workflow:create', 'workflow:update']}>
            <div>Workflow Management</div>
          </WithPermission>
          <WithPermission anyPermissions={['models:read', 'models:manage']}>
            <div>Model Access</div>
          </WithPermission>
        </div>
      );
      
      expect(screen.getByText('Manage Roles')).toBeInTheDocument();
      expect(screen.getByText('Workflow Management')).toBeInTheDocument();
      expect(screen.getByText('Model Access')).toBeInTheDocument();
    });

    it('should handle limited user workflow', () => {
      setMockSession(['workflow:read'], 'User');
      
      renderWithSession(
        <div>
          <WithPermission permission="admin:role_management">
            <div>Manage Roles</div>
          </WithPermission>
          <WithPermission permission="workflow:read">
            <div>View Workflows</div>
          </WithPermission>
          <WithPermission permission="workflow:create">
            <div>Create Workflows</div>
          </WithPermission>
        </div>
      );
      
      expect(screen.queryByText('Manage Roles')).not.toBeInTheDocument();
      expect(screen.getByText('View Workflows')).toBeInTheDocument();
      expect(screen.queryByText('Create Workflows')).not.toBeInTheDocument();
    });
  });
}); 