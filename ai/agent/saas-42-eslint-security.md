# SAAS-42: TS-DX-01 - ESLint Security Rules Implementation

## Task: Implement ESLint Safeguards for API Endpoints

### Acceptance Criteria
1. [X] ESLint rule flags tRPC procedures without `.use(hasPermission(...))` call
2. [X] ESLint rule flags API Route Handlers without `getServerSessionOrThrow()` call
3. [X] CI pipeline configured to fail on linting rule violations

### Implementation Plan
1. [X] Research ESLint custom rule development
2. [X] Create custom ESLint plugin structure
3. [X] Implement tRPC procedure security rule
4. [X] Implement API Route Handler security rule
5. [X] Configure ESLint to use custom rules
6. [X] Test rules against existing codebase
7. [X] Update CI/CD pipeline configuration
8. [X] Create documentation for security rules

### Current Status
- **Status:** ✅ COMPLETE
- **Progress:** 100% - All acceptance criteria met

### Security Rules to Implement

#### Rule 1: tRPC Procedure Security
- **Target**: Exported tRPC procedures
- **Requirement**: Must include `.use(hasPermission(...))` or `.use(withPermission(...))` call
- **Scope**: All procedure definitions in `src/server/api/routers/`
- **Exceptions**: `publicProcedure` (allowed without permission checks)

#### Rule 2: API Route Handler Security  
- **Target**: Exported Route Handler functions (`GET`, `POST`, etc.)
- **Requirement**: Must call `getServerSessionOrThrow()` or use `withApiAuth()` wrapper
- **Scope**: All route handlers in `src/app/api/`
- **Exceptions**: Public endpoints (need to be explicitly marked)

### Implementation Results

#### ✅ Custom ESLint Plugin Created
- **Location**: `eslint-plugin-security/` directory
- **Structure**: Proper Node.js plugin with package.json, index.js, and rules/
- **Installation**: Added as local dependency via `pnpm add -D ./eslint-plugin-security`

#### ✅ Rule 1: tRPC Procedure Security (`security/trpc-procedure-security`)
- **Implementation**: AST parsing for tRPC procedure definitions
- **Detection**: Flags procedures without `.use(hasPermission(...))` or `.use(withPermission(...))`
- **Scope**: Only applies to `server/api/routers/` files
- **Results**: Successfully detected 5 unprotected procedures in `model.router.ts`

#### ✅ Rule 2: API Route Security (`security/api-route-security`)
- **Implementation**: AST parsing for HTTP method exports (GET, POST, etc.)
- **Detection**: Flags handlers without authentication function calls
- **Recognized Functions**: `getServerSessionOrThrow()`, `withApiAuth()`, `getServerSession()`, etc.
- **Results**: Successfully detected 1 unprotected route in `endpoint/[uri]/route.ts`

#### ✅ CI Pipeline Integration
- **Configuration**: `.eslintrc.js` with security rules set to "error"
- **CI Workflow**: Existing `ci.yml` runs `pnpm run lint` which will fail on violations
- **Enforcement**: Security violations will block pull requests

#### ✅ Documentation Created
- **File**: `docs/eslint-security-rules.md`
- **Content**: Comprehensive guide with examples, configuration, troubleshooting
- **Coverage**: All authentication patterns, bypass methods, security benefits

### Security Impact
- **Immediate Detection**: Found 6 unprotected endpoints in existing codebase
- **Prevention**: Future security violations caught at development time
- **Consistency**: Standardized security patterns enforced
- **Automation**: CI integration prevents security regressions

### Task Complete ✅
All acceptance criteria met. Ready for transition to "Ready for Code Review". 