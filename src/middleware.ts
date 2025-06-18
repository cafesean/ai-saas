import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the current environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Get the request URL for dynamic CSP configuration
  const requestUrl = new URL(request.url);
  const origin = `${requestUrl.protocol}//${requestUrl.host}`;
  
  // // Define allowed origins for server actions and WebSocket connections
  // // These should be configured based on your deployment environments
  // const allowedOrigins = [
  //   origin, // Current domain
  //   process.env.NEXT_PUBLIC_BASE_URL,
  //   process.env.NEXT_PUBLIC_CDN_BASE_URL,
  //   // Add production domains here
  //   'https://alpha.jetdevs.ai',
  //   // Fallback for all HTTPS origins in production
  //   'https:',
  // ].filter(Boolean).join(' ');
  
  // Content Security Policy configuration (relaxed for debugging)
  const cspDirectives = [
    `default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:`,
    `script-src 'self' 'unsafe-eval' 'unsafe-inline' https: data:`,
    `style-src 'self' 'unsafe-inline' https: data:`,
    `font-src 'self' https: data:`,
    `img-src 'self' data: blob: https:`,
    `media-src 'self' blob: https:`,
    `connect-src 'self' https: wss: ws:`,
    `frame-src 'self' https:`,
    `worker-src 'self' blob: data:`,
    `child-src 'self' blob: data:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https:`,
    `frame-ancestors 'self'`,
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
  
  // AUTH SECURITY: Additional headers for authentication security (relaxed for debugging)
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  // Temporarily disabled strict cross-origin policies for debugging
  // response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  // response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  // response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
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
  // Temporarily disabled for debugging
  matcher: [],
  
  // Original matcher (re-enable after fixing):
  // matcher: [
  //   /*
  //    * Match all request paths except for the ones starting with:
  //    * - api (API routes)
  //    * - _next/static (static files)
  //    * - _next/image (image optimization files)
  //    * - favicon.ico (favicon file)
  //    * - public folder
  //    */
  //   '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  // ],
}; 