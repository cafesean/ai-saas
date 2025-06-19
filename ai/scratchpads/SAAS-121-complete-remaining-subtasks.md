# SAAS-121 Complete Remaining Subtasks

## Context Priming - Current State Assessment

### Architecture Review
- Multi-tenant security: ✅ RESOLVED (SAAS-122)
- Rate limiting: ✅ RESTORED (SAAS-123) 
- Workflow router: 🔄 75% COMPLETE (SAAS-124)
- Lookup table duplicates: ❌ NOT STARTED (SAAS-125)
- File naming convention: ❌ NOT STARTED (SAAS-126)
- Input validation: ❌ NOT STARTED (SAAS-127)

### Current Technical Debt from Architecture
- 3 duplicate lookup table implementations creating maintenance overhead
- Inconsistent file naming (.router.ts vs .ts suffixes)
- Validation gaps across routers identified in arch review
- Workflow router still has complex N8N integration to extract

### Established Patterns to Follow
- Security: `getUserTenantId()` and `validateUserTenantAccess()` helpers
- Rate limiting: `protectedMutationWithRateLimit` middleware
- Router organization: Focused single-responsibility modules
- DRY principle: Consolidate duplicates, reuse patterns

## Task Planning

### Phase 1: Complete Workflow Router Refactoring (SAAS-124)
[X] Extract complex N8N integration logic to workflow-n8n.router.ts
[X] Move remaining complex update procedure 
[X] Verify API compatibility maintained
[X] Update root router composition

### Phase 2: Consolidate Lookup Table Duplicates (SAAS-125) 
[X] Analyze functionality across 3 implementations
[X] Identify usage patterns in codebase
[X] Choose primary implementation (new-lookup-table.ts - actively used by frontend)
[ ] Consolidate features and update imports
[ ] Remove duplicate files

### Phase 3: Standardize File Naming (SAAS-126)
[ ] Rename lookupTable.router.ts → lookup-table.router.ts
[ ] Rename new-lookup-table.ts → lookup-table-v2.router.ts (or consolidate)
[ ] Rename n8n.ts → n8n.router.ts
[ ] Update all imports in root router and dependencies

### Phase 4: Enhance Input Validation (SAAS-127)
[ ] Audit current validation patterns across routers
[ ] Create comprehensive Zod schema templates
[ ] Apply validation improvements systematically
[ ] Add input sanitization where needed

## Success Criteria
- All 4 remaining subtasks transitioned to Done in Jira
- No breaking changes to existing APIs
- All established patterns applied consistently
- Code organization significantly improved

## Timeline Estimate
- Phase 1: 2-3 hours (complex N8N extraction)
- Phase 2: 3-4 hours (analysis + consolidation)
- Phase 3: 1-2 hours (straightforward renaming)
- Phase 4: 2-3 hours (systematic validation)
- **Total: 8-12 hours of focused development**

## Next Steps
1. Start with Phase 1 (complete workflow refactoring)
2. Proceed systematically through remaining phases
3. Test thoroughly after each phase
4. Update Jira tickets with progress
5. Single commit after ALL subtasks complete 