Based on the conversation, here are the key issues found and lessons learned:

## Authentication & Security Issues

**Issue**: NextAuth authentication was completely non-functional
- **Root Cause**: Login page was static HTML without NextAuth integration
- **Lesson**: Always verify auth integration is functional, not just UI mockups

**Issue**: Mock authentication bypass in production-like environments
- **Root Cause**: `NEXT_PUBLIC_ENABLE_MOCK_AUTH=true` was overriding real auth
- **Lesson**: Environment variables for auth bypasses should be clearly documented and checked during deployment

**Issue**: Missing auth schemas and validation
- **Root Cause**: No Zod schemas for login/registration validation
- **Lesson**: Always implement proper input validation for auth flows

## Database & Backend Issues

**Issue**: Incomplete tRPC auth router implementation
- **Root Cause**: Auth router existed but lacked actual registration/login endpoints
- **Lesson**: Verify backend functionality matches frontend expectations

**Issue**: Password security implementation
- **Root Cause**: No bcrypt hashing implementation
- **Lesson**: Always implement proper password hashing (bcrypt with 12+ salt rounds)

## Environment Configuration Issues

**Issue**: Over-restrictive environment validation
- **Root Cause**: `src/env.mjs` required production services (SMTP, AWS, OpenAI) for development
- **Lesson**: Make non-essential services optional in development environments

**Issue**: Missing environment variables documentation
- **Root Cause**: Critical env vars not clearly documented
- **Lesson**: Document all required environment variables and their purposes

## Component Architecture Issues

**Issue**: Server Component vs Client Component confusion
- **Root Cause**: SessionProvider used in Server Component causing build errors
- **Lesson**: Create client-side wrapper components for providers that need client-side context

**Issue**: Import path conflicts
- **Root Cause**: Conflicting utilities between `@/lib/utils` and `@/framework/lib/utils`
- **Lesson**: Maintain consistent import paths and avoid duplicate utility functions

**Issue**: Missing UI components
- **Root Cause**: Button component referenced but not implemented
- **Lesson**: Verify all UI component dependencies exist before implementing features

## Build & Development Issues

**Issue**: Static generation failures with complex RBAC components
- **Root Cause**: Complex permission-based components causing SSG errors
- **Lesson**: Test build process early and often, especially with dynamic auth-dependent components

**Issue**: Empty placeholder pages causing build warnings
- **Root Cause**: Pages with no content or broken components
- **Lesson**: Implement basic content for all routes, even if temporary

## Data Structure Issues

**Issue**: Database schema mismatches (evidenced by the file change shown)
- **Root Cause**: Code expecting different property names than what database returns
- **Lesson**: Maintain consistency between database schema and frontend expectations, or implement proper data transformation layers

## Process & Testing Issues

**Issue**: Lack of incremental testing during development
- **Root Cause**: Major components built without testing integration points
- **Lesson**: Test each component integration as you build, don't wait until the end

**Issue**: Environment setup complexity
- **Root Cause**: Multiple environment files and configuration sources
- **Lesson**: Simplify environment setup and provide clear setup documentation

These lessons emphasize the importance of:
1. **Incremental verification** - Test each piece as you build it
2. **Environment management** - Properly configure and document environment variables
3. **Component architecture** - Understand Next.js component boundaries and client/server distinctions
4. **Security best practices** - Implement proper auth validation and password handling
5. **Data consistency** - Ensure frontend and backend data structures align