# Codebase Architecture and Patterns Documentation

## Project Overview
This is a Next.js project implementing a modern web application with a focus on type safety, maintainable architecture, and efficient state management. The project utilizes the latest features of Next.js along with a carefully selected stack of technologies.

## Technology Stack
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **API Layer**: tRPC
- **State Management**: Zustand
- **Table Management**: TanStack Table
- **Package Manager**: pnpm

## Project Structure
```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── schemas/         # Zod validation schemas
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
├── db/              # Database configuration and schemas
└── trpc/            # tRPC API implementation
```

## Key Implementation Patterns

### 1. TanStack Table Implementation
- Organized table features in dedicated hooks
- Standardized column definitions
- Implemented common features:
  - Sorting
  - Filtering
  - Mobile responsiveness
  - Loading states
  - Search functionality
  - Pagination
  - Row actions

### 2. Hooks and Components Organization
- Custom hooks for specific functionalities:
  - `usePricingForm`
  - `useAutoSave`
  - `useRateCardPrices`
- Modal implementations using reusable components
- Type-safe component props using TypeScript

### 3. Database Layer (Drizzle)
- Snake_case naming convention for database tables
- Type-safe schema definitions
- SQL-like query builder implementation
- Zero-overhead abstractions
- Built-in migration support
- Key features:
  - Timestamp fields for auditing
  - Proper relationship definitions
  - Appropriate data type selections

### 4. tRPC Implementation
- End-to-end type safety
- Zod schema validation
- Organized router structure
- Integration with Next.js
- Automatic API documentation
- Basic CRUD procedures implementation

### 5. State Management with Zustand
- Centralized store organization
- Type-safe state management
- Action definitions
- Custom store hooks
- Integration with React components

## Coding Conventions

### TypeScript
- Strict type checking enabled
- Interface-first approach
- Proper type definitions for all components and functions
- Extensive use of generics where appropriate

### Component Structure
- Functional components with TypeScript
- Props interface definitions
- Proper use of React hooks
- Clear separation of concerns
- Define all Functions as Const
- Create custom hooks if component logic can be encapsulated
- Destructure React hooks in import declarations

### Component Props
- TypeScript props interface definitions
- Destructure props in function components

### File Organization
- Clear module boundaries
- Feature-based organization
- Shared utilities in common locations
- Consistent naming conventions

### API Layer
- Type-safe API routes
- Proper error handling
- Request validation
- Response type definitions

## Best Practices

### Performance
- Efficient state updates
- Proper use of React hooks
- Optimized database queries
- Lazy loading where appropriate

### Security
- Input validation
- Type checking
- Proper error handling
- Secure API endpoints

### Maintainability
- DRY principle
- Clear documentation
- Consistent coding style
- Modular architecture

## Key Learnings
- Effective use of TypeScript for type safety
- Efficient state management with Zustand
- Proper implementation of TanStack Table
- Clean architecture with clear separation of concerns
- Type-safe backend with tRPC and Drizzle
- Modern Next.js features utilization

This documentation serves as a comprehensive guide to the project's architecture, patterns, and conventions. It should be updated as the project evolves and new patterns emerge.