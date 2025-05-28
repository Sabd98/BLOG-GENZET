import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth"; // Ensure this exists

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value?.toLowerCase(); // Normalize to lowercase

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/"];
  
  // Skip middleware for public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const isValidToken = await verifyToken(token); // Implement proper token validation
    
    if (!isValidToken) {
      throw new Error("Invalid token");
    }

    // Role-based access control (case-insensitive)
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/user") && role !== "user") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();

  } catch (error) {
    // Clear invalid token and redirect
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