import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value?.toLowerCase(); 

  const publicPaths = ["/login", "/register", "/"];
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const isValidToken = await verifyToken(token); 
    
    if (!isValidToken) {
      throw new Error("Invalid token");
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/user") && role !== "user") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();

  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    response.cookies.delete("role");
    return response;
  }
}
export const config = {
  matcher: [
 
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
  runtime: 'experimental-edge' 
}