import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the current environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Get the request URL for dynamic CSP configuration
  const requestUrl = new URL(request.url);
  const origin = `${requestUrl.protocol}//${requestUrl.host}`;
  
  // Define allowed origins for server actions and WebSocket connections
  // These should be configured based on your deployment environments
  const allowedOrigins = [
    origin, // Current domain
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_CDN_BASE_URL,
    // Add production domains here
    'https://alpha.jetdevs.ai',
  ].filter(Boolean).join(' ');
  
  // Content Security Policy configuration
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-eval' ${isDevelopment ? "'unsafe-inline'" : ''} https://vercel.live`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https: ${process.env.NEXT_PUBLIC_CDN_BASE_URL || ''}`.trim(),
    `media-src 'self' blob: ${process.env.NEXT_PUBLIC_CDN_BASE_URL || ''}`.trim(),
    `connect-src 'self' ${allowedOrigins} ${process.env.NEXT_PUBLIC_AI_API_URL || ''} https://vercel.live wss:`.trim(),
    `frame-src 'self' https://vercel.live`,
    `worker-src 'self' blob:`,
    `child-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `upgrade-insecure-requests`,
  ];
  
  const csp = cspDirectives.join('; ');
  
  // Create response
  const response = NextResponse.next();
  
  // Set security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // AUTH SECURITY: Additional headers for authentication security
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Set HSTS in production
  if (!isDevelopment) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 