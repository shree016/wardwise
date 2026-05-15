import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ["/report", "/citizen", "/wards", "/dashboard", "/issues", "/verify", "/map"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.pathname;

  if (url.startsWith('/login')) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  if (!user && PROTECTED_ROUTES.some(route => url.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  if (user && (url.startsWith('/auth/sign-in') || url.startsWith('/auth/sign-up'))) {
    return NextResponse.redirect(new URL('/citizen', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/(api|trpc)(.*)',
    '/',
    '/login',
    '/auth/sign-in',
    '/auth/sign-up',
  ],
};
