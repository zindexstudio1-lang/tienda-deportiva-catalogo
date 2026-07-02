import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificamos si el usuario intenta entrar a la zona de administración (pero no al login)
  if (request.nextUrl.pathname === '/admin') {
    // Buscamos nuestra cookie secreta
    const hasAuth = request.cookies.get('pos_auth');

    // Si no tiene la cookie, lo redirigimos a la pantalla del PIN
    if (!hasAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Le decimos a Next.js que este guardián solo vigile la ruta /admin
export const config = {
  matcher: ['/admin/:path*'],
};