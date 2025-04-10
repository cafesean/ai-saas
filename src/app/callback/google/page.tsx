'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const GoogleCallbackContent = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && window.opener) {
      window.opener.postMessage(
        {
          type: 'GOOGLE_AUTH_SUCCESS',
          code,
          state
        },
        '*'
      );
      window.close();
    } else if (window.opener) {
      window.opener.postMessage(
        {
          type: 'GOOGLE_AUTH_FAIL'
        },
        '*'
      );
      window.close();
    }
  }, [searchParams]);

  return null;
}

export default function GoogleCallback() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackContent />
    </Suspense>
  );
}