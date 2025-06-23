// Session-based auth utilities (no client-side state management)
export { useAuthSession, usePermission, usePermissions, useCurrentUser, AuthUtils } from '../hooks/useAuthSession';
export type { ExtendedSession, ExtendedUser } from '../../db/auth-hydration';

// Other stores can still be exported here if needed
// export { someOtherStore } from './other.store';