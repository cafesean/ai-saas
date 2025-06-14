import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WithPermission } from './WithPermission';
import { authTestUtils } from '@/test/utils/auth-store-mock';

// Mock the auth store before each test
beforeEach(() => {
  authTestUtils.resetMocks();
});

afterEach(() => {
  authTestUtils.resetMocks();
});

describe('WithPermission Component', () => {
  describe('Single Permission Checks', () => {
    it('should render children when user has required permission', () => {
      authTestUtils.mockUserWithPermissions(['workflow:create']);
      
      render(
        <WithPermission permission="workflow:create">
          <div>Create Workflow Button</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Create Workflow Button')).toBeInTheDocument();
    });

    it('should not render children when user lacks required permission', () => {
      authTestUtils.mockUserWithPermissions(['workflow:read']);
      
      render(
        <WithPermission permission="workflow:create">
          <div>Create Workflow Button</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Create Workflow Button')).not.toBeInTheDocument();
    });

    it('should render fallback when user lacks permission and fallback is provided', () => {
      authTestUtils.mockUserWithPermissions(['workflow:read']);
      
      render(
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
      authTestUtils.mockUserWithPermissions([
        'workflow:read',
        'workflow:create',
        'workflow:update'
      ]);
      
      render(
        <WithPermission permissions={['workflow:read', 'workflow:create']}>
          <div>Workflow Management</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Workflow Management')).toBeInTheDocument();
    });

    it('should not render when user lacks any required permission', () => {
      authTestUtils.mockUserWithPermissions(['workflow:read']);
      
      render(
        <WithPermission permissions={['workflow:read', 'workflow:create']}>
          <div>Workflow Management</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Workflow Management')).not.toBeInTheDocument();
    });
  });

  describe('Any Permission Checks (ANY)', () => {
    it('should render when user has any of the required permissions', () => {
      authTestUtils.mockUserWithPermissions(['workflow:read']);
      
      render(
        <WithPermission anyPermissions={['workflow:read', 'workflow:create']}>
          <div>Workflow Access</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Workflow Access')).toBeInTheDocument();
    });

    it('should not render when user has none of the required permissions', () => {
      authTestUtils.mockUserWithPermissions(['models:read']);
      
      render(
        <WithPermission anyPermissions={['workflow:read', 'workflow:create']}>
          <div>Workflow Access</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Workflow Access')).not.toBeInTheDocument();
    });
  });

  describe('Role-based Access', () => {
    it('should render when user has required role', () => {
      authTestUtils.mockUserWithRole('Admin');
      
      render(
        <WithPermission role="Admin">
          <div>Admin Panel</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    it('should not render when user lacks required role', () => {
      authTestUtils.mockUserWithRole('User');
      
      render(
        <WithPermission role="Admin">
          <div>Admin Panel</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });

    it('should render when user has any of the required roles', () => {
      authTestUtils.mockUserWithRole('Editor');
      
      render(
        <WithPermission role={['Admin', 'Editor']}>
          <div>Content Management</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Content Management')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated Users', () => {
    it('should not render for unauthenticated users', () => {
      authTestUtils.mockUnauthenticated();
      
      render(
        <WithPermission permission="workflow:read">
          <div>Protected Content</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render fallback for unauthenticated users', () => {
      authTestUtils.mockUnauthenticated();
      
      render(
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
      authTestUtils.mockLoading();
      
      render(
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
      authTestUtils.mockLoading();
      
      render(
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
      authTestUtils.mockUserWithPermissions(['workflow:read']);
      
      const { container } = render(
        <WithPermission permission="workflow:create" hideWhenUnauthorized>
          <div>Create Button</div>
        </WithPermission>
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should not render fallback when hideWhenUnauthorized=true', () => {
      authTestUtils.mockUserWithPermissions(['workflow:read']);
      
      const { container } = render(
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
      authTestUtils.mockUserWithPermissions(['workflow:read']);
      
      render(
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
      authTestUtils.mockAdmin();
      
      render(
        <WithPermission permission="admin:role_management">
          <div>Role Management</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Role Management')).toBeInTheDocument();
    });

    it('should work with regular user', () => {
      authTestUtils.mockUser();
      
      render(
        <WithPermission permission="workflow:read">
          <div>View Workflows</div>
        </WithPermission>
      );
      
      expect(screen.getByText('View Workflows')).toBeInTheDocument();
    });

    it('should deny admin features to regular user', () => {
      authTestUtils.mockUser();
      
      render(
        <WithPermission permission="admin:role_management">
          <div>Role Management</div>
        </WithPermission>
      );
      
      expect(screen.queryByText('Role Management')).not.toBeInTheDocument();
    });

    it('should work with editor permissions', () => {
      authTestUtils.mockEditor();
      
      render(
        <WithPermission anyPermissions={['workflow:create', 'documents:create']}>
          <div>Create Content</div>
        </WithPermission>
      );
      
      expect(screen.getByText('Create Content')).toBeInTheDocument();
    });
  });

  describe('Complex Permission Scenarios', () => {
    it('should handle complex admin workflow', () => {
      authTestUtils.mockAdmin();
      
      render(
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
      authTestUtils.mockUser();
      
      render(
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