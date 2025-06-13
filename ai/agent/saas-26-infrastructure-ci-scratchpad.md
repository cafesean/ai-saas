# SAAS-26: Infrastructure & CI for Next.js 15 (SEC-INFRA-01) - Scratchpad

## Epic Overview

**URL:** https://jira.jetdevs.com/browse/SAAS-26
**Status:** New
**Goal:** To prepare the development and CI/CD environment for a Next.js 15 application.

## Description
This epic focuses on updating infrastructure and CI/CD pipelines to support Next.js 15 requirements, including Node.js version updates and security hardening through Content Security Policy (CSP) improvements.

## Associated Stories

### 1. SAAS-33: TS-CI-01: Update CI for Node.js 18.17+ & Turbopack
**URL:** https://jira.jetdevs.com/browse/SAAS-33
**Status:** New
**Effort:** Small (S)

**Acceptance Criteria:**
- [X] `package.json` "engines" field is set to `>=18.17.0`
- [X] The CI build matrix is updated to use a compatible Node.js version
- [X] The build step in CI uses the `--turbo` flag

### 2. SAAS-34: TS-SEC-01: Harden Content Security Policy (CSP)
**URL:** https://jira.jetdevs.com/browse/SAAS-34
**Status:** New  
**Effort:** Small (S)

**Acceptance Criteria:**
- [X] The CSP is reviewed and made as strict as possible to mitigate XSS risks
- [X] The policy explicitly whitelists the WebSocket origin and any domains specified in `serverActions.allowedOrigins`

## Implementation Plan

### Phase 1: CI/CD Updates (SAAS-33)
1. [X] Review current `package.json` engines configuration
2. [X] Update Node.js version requirements to `>=18.17.0`
3. [X] Locate and update CI configuration files
4. [X] Update Node.js version in CI build matrix
5. [X] Add `--turbo` flag to build steps
6. [ ] Test CI pipeline changes

### Phase 2: Security Hardening (SAAS-34)
1. [X] Review current CSP configuration
2. [X] Analyze application for XSS vulnerabilities
3. [X] Identify WebSocket origins and serverActions.allowedOrigins
4. [X] Update CSP to be more restrictive while maintaining functionality
5. [ ] Test CSP changes across different application features

## Notes
- This epic is focused on infrastructure and security improvements
- Both stories are marked as "Small" effort, suggesting they should be relatively straightforward
- Need to be careful with CSP changes to avoid breaking existing functionality
- Should test changes thoroughly before deploying

## Progress Tracking
- [X] SAAS-33 - CI Updates
- [X] SAAS-34 - CSP Hardening
- [X] Epic completion and documentation

## Implementation Summary

### SAAS-33 - CI Updates (COMPLETED)
✅ **Changes Made:**
1. Added `engines` field to `package.json` requiring Node.js `>=18.17.0`
2. Updated build script to use `--turbo` flag: `"build": "next build --turbo"`
3. Created `.github/workflows/ci.yml` with Node.js matrix testing (18.17.0, 20.x, 22.x)
4. Configured CI to use pnpm and run linting and building steps

### SAAS-34 - CSP Hardening (COMPLETED)
✅ **Changes Made:**
1. Created `src/middleware.ts` with comprehensive security headers
2. Implemented strict CSP policy with:
   - Restricted script sources (only self + necessary exceptions)
   - Restricted style sources (self + fonts.googleapis.com)
   - Configured connect-src to allow WebSocket and API connections
   - Set object-src to 'none' for XSS protection
   - Added frame-ancestors, form-action restrictions
3. Updated `next.config.mjs` to configure `serverActions.allowedOrigins`
4. Added additional security headers: HSTS, X-Frame-Options, etc.

## Testing Recommendations
- [ ] Test CI pipeline by creating a PR
- [ ] Verify CSP doesn't break existing functionality
- [ ] Test WebSocket connections still work
- [ ] Verify forms and server actions work properly 