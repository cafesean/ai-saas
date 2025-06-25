'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ExtendedSession } from '@/db/auth-hydration';

export function SessionDebug() {
  const { data: session, status } = useSession();
  const extendedSession = session as ExtendedSession;
  const [expanded, setExpanded] = useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Extract user permissions
  const userPermissions = extendedSession?.user?.roles?.flatMap(role => 
    role.policies?.map(policy => policy.name) || []
  ) || [];

  const providerPermissions = userPermissions.filter(perm => perm.startsWith('provider:'));
  const hasProviderRead = userPermissions.includes('provider:read');
  const hasProviderCreate = userPermissions.includes('provider:create');
  const hasAdminFullAccess = userPermissions.includes('admin:full_access');
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg max-w-md text-xs font-mono z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">Session Debug</h3>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-blue-400 hover:text-blue-300"
        >
          {expanded ? '−' : '+'}
        </button>
      </div>
      
      <div>Status: <span className={status === 'authenticated' ? 'text-green-400' : 'text-red-400'}>{status}</span></div>
      <div>Has Session: {!!session ? 'Yes' : 'No'}</div>
      
      {extendedSession?.user && (
        <>
          <div>User ID: {extendedSession.user.id}</div>
          <div>Email: {extendedSession.user.email}</div>
          <div>Org ID: {extendedSession.user.orgId}</div>
          <div>Roles: {extendedSession.user.roles?.length || 0}</div>
          
          {extendedSession.user.roles?.map((role, idx) => (
            <div key={idx} className="text-yellow-400">
              Role: {role.name} ({role.policies?.length || 0} perms)
            </div>
          ))}
          
          <div className="mt-2 border-t border-gray-600 pt-2">
            <div>Total Permissions: {userPermissions.length}</div>
            <div>Provider Permissions: {providerPermissions.length}</div>
            <div className={`${hasProviderRead ? 'text-green-400' : 'text-red-400'}`}>
              provider:read: {hasProviderRead ? 'YES' : 'NO'}
            </div>
            <div className={`${hasProviderCreate ? 'text-green-400' : 'text-red-400'}`}>
              provider:create: {hasProviderCreate ? 'YES' : 'NO'}
            </div>
            <div className={`${hasAdminFullAccess ? 'text-green-400' : 'text-red-400'}`}>
              admin:full_access: {hasAdminFullAccess ? 'YES' : 'NO'}
            </div>
          </div>

          {expanded && (
            <div className="mt-2 border-t border-gray-600 pt-2 max-h-32 overflow-y-auto">
              <div className="font-bold mb-1">All Permissions:</div>
              {userPermissions.length === 0 ? (
                <div className="text-red-400">No permissions found!</div>
              ) : (
                userPermissions.map((perm, idx) => (
                  <div 
                    key={idx} 
                    className={`${perm.startsWith('provider:') ? 'text-cyan-400' : 'text-gray-300'}`}
                  >
                    {perm}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
      
      {!extendedSession?.user && (
        <div className="text-red-400">No user data in session</div>
      )}
    </div>
  );
} 