# Coding Standards - AI SaaS Platform

**Document Type:** Development Standards & Guidelines  
**Audience:** Developers, Tech Leads, Code Reviewers  
**Purpose:** Ensure consistent, maintainable, and high-quality code across the platform

## Table of Contents

1. [TypeScript Standards](#typescript-standards)
2. [React & Component Standards](#react--component-standards)
3. [Naming Conventions](#naming-conventions)
4. [Project Structure](#project-structure)
5. [Code Quality & Best Practices](#code-quality--best-practices)
6. [Testing Standards](#testing-standards)

---

## TypeScript Standards

### Configuration
**File:** `tsconfig.json`
```json
{
  "compilerOptions": {
    "strict": true,                    // Enable all strict type checking
    "noUncheckedIndexedAccess": true, // Prevent undefined index access
    "exactOptionalPropertyTypes": true, // Strict optional property handling
    "noImplicitAny": true,            // Disallow implicit any types
    "noImplicitReturns": true,        // Ensure all paths return a value
    "noFallthroughCasesInSwitch": true // Prevent switch fallthrough
  }
}
```

### Type Definitions

**Prefer Interfaces over Types for Object Shapes:**
```typescript
// ✅ Good - Use interface for object definitions
interface User {
  id: number;
  email: string;
  name: string;
  isActive: boolean;
}

// ❌ Avoid - Don't use type for simple object shapes
type User = {
  id: number;
  email: string;
}
```

**Use Type for Unions and Computations:**
```typescript
// ✅ Good - Use type for unions
type Status = 'active' | 'inactive' | 'pending';
type UserWithStatus = User & { status: Status };

// ✅ Good - Use type for computed types
type UserKeys = keyof User;
type PartialUser = Partial<User>;
```

### Strict Type Patterns

**Database Schema Types:**
```typescript
// ✅ Good - Generate types from schema
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '@/db/schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
```

**API Response Types:**
```typescript
// ✅ Good - Strict API response typing
interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

// Usage with tRPC
export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }): Promise<User> => {
      // Return type enforced
    }),
});
```

**Error Handling Types:**
```typescript
// ✅ Good - Discriminated unions for error handling
type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
const processUser = async (id: number): Promise<Result<User>> => {
  try {
    const user = await getUser(id);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: 'User not found' };
  }
};
```

### TypeScript Issues to Avoid ⚠️

```typescript
// ❌ Never use 'any'
const data: any = response;

// ❌ Don't use 'unknown' without type guards
const processData = (data: unknown) => {
  return data.someProperty; // Type error
};

// ✅ Use proper type guards
const processData = (data: unknown) => {
  if (isValidData(data)) {
    return data.someProperty; // Safe access
  }
};

// ❌ Don't use non-null assertion carelessly
const user = getUser()!; // Dangerous

// ✅ Handle null cases explicitly
const user = getUser();
if (!user) {
  throw new Error('User not found');
}
```

---

## React & Component Standards

### Component Architecture

**Functional Components Only:**
```typescript
// ✅ Good - Use function declarations for components
function UserProfile({ userId }: { userId: number }) {
  const { data: user } = api.user.getById.useQuery({ id: userId });
  
  if (!user) return <UserSkeleton />;
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-muted-foreground">{user.email}</p>
    </div>
  );
}

// ❌ Avoid - Don't use arrow functions for components
const UserProfile = ({ userId }: { userId: number }) => {
  // Component logic
};
```

### Props Patterns

**Interface Props with Clear Types:**
```typescript
// ✅ Good - Explicit prop interfaces
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: number) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

function UserCard({ user, onEdit, onDelete, variant = 'default', className }: UserCardProps) {
  // Component implementation
}
```

**Children Prop Patterns:**
```typescript
// ✅ Good - Specific children types
interface ModalProps {
  children: React.ReactNode;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

// ✅ Good - Render prop patterns
interface DataTableProps<T> {
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
}
```

### Component Size Guidelines

**Component Complexity Limits:**
- **Maximum 300 lines** per component file
- **Maximum 7 props** per component
- **Maximum 3 levels** of nesting in JSX
- **Single responsibility** - one main purpose per component

**Component Breakdown Example:**
```typescript
// ❌ Too large - 400+ lines
function UserDashboard() {
  // Massive component with multiple responsibilities
}

// ✅ Good - Split into focused components
function UserDashboard() {
  return (
    <div className="space-y-6">
      <UserHeader />
      <UserStats />
      <UserActivity />
      <UserSettings />
    </div>
  );
}

function UserHeader() {
  // 50-100 lines, focused on header logic
}
```

### State Management Patterns

**React 19 Optimization (Current Version):**
```typescript
// ✅ Good - Simple state with direct handlers
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // ✅ Direct inline handlers (React 19 compiler optimizes)
  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
      />
    </form>
  );
}

// ❌ Avoid - Over-optimization that fights React 19
function ContactForm() {
  const handleNameChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, []);
  
  // Unnecessary memoization
}
```

**Zustand for Global State:**
```typescript
// ✅ Good - Clean Zustand store
interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const user = await authApi.login(credentials);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    set({ user: null });
  },
}));
```

### Custom Hooks Patterns

**Data Fetching Hooks:**
```typescript
// ✅ Good - Custom hook for data logic
function useUser(userId: number) {
  const { data, isLoading, error } = api.user.getById.useQuery(
    { id: userId },
    { enabled: userId > 0 }
  );
  
  return {
    user: data,
    isLoading,
    error,
    isValid: !error && data != null,
  };
}

// Usage
function UserProfile({ userId }: { userId: number }) {
  const { user, isLoading, isValid } = useUser(userId);
  
  if (isLoading) return <Skeleton />;
  if (!isValid) return <ErrorState />;
  
  return <UserDetails user={user} />;
}
```

---

## Naming Conventions

### File & Directory Naming

**File Naming Patterns:**
```bash
# ✅ Good - kebab-case for files
src/components/user-profile.tsx
src/hooks/use-auth-session.ts
src/utils/format-date.ts

# ✅ Good - PascalCase for component files
src/components/UserProfile/UserProfile.tsx
src/components/UserProfile/index.ts

# ✅ Good - camelCase for utility files
src/lib/apiClient.ts
src/utils/dateHelpers.ts

# ❌ Avoid - Inconsistent naming
src/components/userProfile.tsx
src/components/User_Profile.tsx
src/components/USERPROFILE.tsx
```

**Directory Structure:**
```bash
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Route groups
│   ├── (app)/
│   └── api/
├── components/             # Reusable UI components
│   ├── ui/                # Atomic components (shadcn)
│   ├── form/              # Form-specific components
│   └── feature/           # Feature-specific components
├── db/                     # Database layer
│   ├── schema/            # Database schemas
│   └── types/             # Database types
├── lib/                    # Utility libraries
├── server/                 # Server-side code
│   └── api/               # tRPC routers
└── types/                  # Global type definitions
```

### Variable & Function Naming

**TypeScript Naming:**
```typescript
// ✅ Good - Descriptive names
const userAccountBalance = 1000;
const isUserAuthenticated = true;
const fetchUserProfiles = async () => {};

// ✅ Good - Boolean naming
const canEditUser = true;
const hasPermission = false;
const shouldShowModal = true;

// ✅ Good - Function naming
const calculateTotalPrice = () => {};
const validateUserInput = () => {};
const transformApiResponse = () => {};

// ❌ Avoid - Vague names
const data = {};
const info = '';
const temp = false;
const handler = () => {};
```

**Component & Hook Naming:**
```typescript
// ✅ Good - Component names
function UserProfileCard() {}
function DataTablePagination() {}
function AuthenticationModal() {}

// ✅ Good - Hook names (must start with 'use')
function useUserPermissions() {}
function useApiMutation() {}
function useLocalStorage() {}

// ✅ Good - Custom hook return naming
function useAuth() {
  return {
    user,           // Not authUser
    isLoading,      // Not loading
    login,          // Not handleLogin
    logout,
  };
}
```

### CSS & Tailwind Naming

**Tailwind Class Organization:**
```typescript
// ✅ Good - Logical grouping
<div className="
  flex items-center justify-between
  p-4 mx-auto
  bg-white border border-gray-200 rounded-lg
  shadow-sm hover:shadow-md
  transition-shadow duration-200
">

// ✅ Good - Use clsx for conditional classes
import { clsx } from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded-md font-medium transition-colors',
  {
    'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
    'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
    'opacity-50 cursor-not-allowed': disabled,
  }
)}>
```

---

## Project Structure

### Feature-Based Organization

**Recommended Structure:**
```bash
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth-related pages
│   ├── (app)/                    # Main application pages
│   │   ├── users/                # Feature: User management
│   │   ├── models/               # Feature: AI models
│   │   └── workflows/            # Feature: Workflow builder
│   └── api/                      # API routes
├── components/                    # Shared components
│   ├── ui/                       # Base UI components
│   ├── form/                     # Form components
│   └── layout/                   # Layout components
├── features/                     # Feature-specific code
│   ├── auth/                     # Authentication feature
│   │   ├── components/           # Auth-specific components
│   │   ├── hooks/                # Auth-specific hooks
│   │   ├── types/                # Auth-specific types
│   │   └── utils/                # Auth-specific utilities
│   ├── users/                    # User management feature
│   └── models/                   # AI models feature
├── lib/                          # Shared utilities
├── server/                       # Server-side code
│   └── api/                      # tRPC routers
└── types/                        # Global types
```

### Import Patterns

**Import Organization:**
```typescript
// ✅ Good - Import order
// 1. React and Next.js
import React from 'react';
import { NextPage } from 'next';

// 2. External libraries
import { z } from 'zod';
import { clsx } from 'clsx';

// 3. Internal utilities and config
import { api } from '@/utils/trpc';
import { cn } from '@/lib/utils';

// 4. Components (UI first, then feature-specific)
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/features/user-card';

// 5. Types and schemas
import type { User } from '@/types/user';
import { userSchema } from '@/schemas/user';
```

**Path Aliases:**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/server/*": ["./src/server/*"],
      "@/db/*": ["./src/db/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}

// ✅ Good - Consistent path usage
import { Button } from '@/components/ui/button';
import { api } from '@/utils/trpc';
import { db } from '@/db/config';

// ❌ Avoid - Relative paths for distant files
import { Button } from '../../../components/ui/button';
```

### File Organization Patterns

**Component Files:**
```bash
# ✅ Good - Index pattern for complex components
src/components/DataTable/
├── index.ts              # Export barrel
├── DataTable.tsx         # Main component
├── DataTableRow.tsx      # Sub-components
├── DataTableHeader.tsx
├── types.ts              # Component-specific types
└── utils.ts              # Component-specific utilities

# ✅ Good - Single file for simple components
src/components/ui/
├── button.tsx
├── input.tsx
└── modal.tsx
```

**Feature Files:**
```bash
# ✅ Good - Feature organization
src/features/users/
├── components/           # User-specific components
│   ├── UserList.tsx
│   ├── UserForm.tsx
│   └── UserCard.tsx
├── hooks/                # User-specific hooks
│   ├── useUsers.ts
│   └── useUserMutations.ts
├── types/                # User-specific types
│   └── user.types.ts
├── utils/                # User-specific utilities
│   └── userHelpers.ts
└── index.ts              # Feature exports
```

---

## Code Quality & Best Practices

### Error Handling

**Consistent Error Patterns:**
```typescript
// ✅ Good - Result pattern for operations
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

const createUser = async (userData: CreateUserInput): Promise<Result<User>> => {
  try {
    const user = await db.insert(users).values(userData).returning();
    return { success: true, data: user[0] };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};
```

**React Error Boundaries:**
```typescript
// ✅ Good - Error boundary component
function ErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorProvider fallback={fallback}>
        {children}
      </ErrorProvider>
    </Suspense>
  );
}
```

### Performance Guidelines

**React Performance:**
```typescript
// ✅ Good - Avoid premature optimization
function UserList({ users }: { users: User[] }) {
  // Let React 19 compiler handle optimization
  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user}
          onEdit={(user) => editUser(user)}
        />
      ))}
    </div>
  );
}

// ❌ Avoid - Over-optimization in React 19
function UserList({ users }: { users: User[] }) {
  const memoizedUsers = useMemo(() => users, [users]);
  const handleEdit = useCallback((user) => editUser(user), []);
  
  // Unnecessary with React 19 compiler
}
```

**Database Performance:**
```typescript
// ✅ Good - Efficient queries with relations
const getUsersWithRoles = async (tenantId: number) => {
  return await db.query.users.findMany({
    where: eq(users.tenantId, tenantId),
    with: {
      userRoles: {
        with: {
          role: true
        }
      }
    },
    limit: 50, // Always limit large queries
  });
};

// ❌ Avoid - N+1 queries
const getUsersWithRoles = async (tenantId: number) => {
  const users = await db.query.users.findMany({
    where: eq(users.tenantId, tenantId),
  });
  
  for (const user of users) {
    user.roles = await getUserRoles(user.id); // N+1 problem
  }
};
```

### Security Best Practices

**Input Validation:**
```typescript
// ✅ Good - Zod validation in tRPC
export const userRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1).max(100),
      role: z.enum(['admin', 'user', 'viewer']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Input is validated and typed
      return await ctx.db.insert(users).values(input);
    }),
});
```

**Permission Checking:**
```typescript
// ✅ Good - Consistent permission pattern
const requirePermission = (permission: string) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const hasPermission = await checkUserPermission(
      ctx.session.user.id, 
      permission,
      ctx.session.user.tenantId
    );
    
    if (!hasPermission) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    
    return next();
  });
};

// Usage
export const adminRouter = createTRPCRouter({
  deleteUser: requirePermission('users:delete')
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Permission already checked
    }),
});
```

---

## Testing Standards

### Test File Organization

**File Naming:**
```bash
# ✅ Good - Test file naming
src/components/UserCard.tsx
src/components/UserCard.test.tsx    # Unit tests
src/components/UserCard.stories.tsx # Storybook stories

src/hooks/useAuth.ts
src/hooks/useAuth.test.ts

src/utils/formatDate.ts
src/utils/formatDate.test.ts
```

### Testing Patterns

**Component Testing:**
```typescript
// ✅ Good - Component test structure
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  isActive: true,
};

describe('UserCard', () => {
  it('displays user information correctly', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

**API Testing:**
```typescript
// ✅ Good - tRPC router testing
import { createTRPCMsw } from 'msw-trpc';
import { appRouter } from '@/server/api/root';

const trpcMsw = createTRPCMsw(appRouter);

describe('user router', () => {
  it('returns user by id', async () => {
    const caller = appRouter.createCaller({
      db: mockDb,
      session: mockSession,
    });
    
    const user = await caller.user.getById({ id: 1 });
    expect(user).toMatchObject({ id: 1, name: 'John Doe' });
  });
});
```

---

## Enforcement & Tools

### ESLint Configuration

**Required Rules:**
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "react-hooks/exhaustive-deps": "error",
    "react/jsx-key": "error"
  }
}
```

### Pre-commit Hooks

**Required Checks:**
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "tsc --noEmit"
    ]
  }
}
```

### Code Review Checklist

**Required Reviews:**
- [ ] TypeScript types are strict and accurate
- [ ] Component props are properly typed
- [ ] Error handling follows Result pattern
- [ ] File and variable naming follows conventions
- [ ] No hardcoded values (use constants)
- [ ] Performance patterns followed (avoid premature optimization)
- [ ] Security patterns implemented (validation, permissions)
- [ ] Tests cover main functionality
- [ ] Import organization follows standards

---

## Summary

These coding standards ensure:

1. **Type Safety:** Strict TypeScript configuration with proper typing
2. **Consistency:** Standardized naming and organization patterns
3. **Maintainability:** Clear component structure and feature organization
4. **Performance:** React 19 optimization patterns and efficient database queries
5. **Security:** Input validation and permission checking patterns
6. **Quality:** Comprehensive testing and code review standards

**Key Enforcement:**
- ESLint + TypeScript strict mode
- Pre-commit hooks for formatting and type checking
- Code review checklist for standards compliance
- Regular architecture reviews for pattern adherence 