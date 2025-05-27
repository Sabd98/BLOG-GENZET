"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, Menu, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function ResponsiveNav() {
  const { user } = useAuth();

  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [navItems, setNavItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const items = [
      ...(role === "Admin"
        ? [
            { href: "/admin", label: "Admin Dashboard" },
            { href: "/admin/categories", label: "Categories" },
          ]
        : []),
      ...(role
        ? [
            { href: "/articles", label: "Articles" },
          ]
        : []),
    ];
    setNavItems(items);
  }, [role]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("refreshToken");
      // Clear cookies
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    window.location.href = "/login";
  };
  if (!isMounted) return null;

  const profileComponent = isOpen && (
    <div className="absolute right-0 mt-2 w-48 z-50 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
      {role === "Admin" ? (
        <Link
          href="/admin/profile"
          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
          onClick={() => setIsOpen(false)}
        >
          <User className="h-4 w-4 mr-2" />
          Profile
        </Link>
      ) : (
        <Link
          href="/user/profile"
          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
          onClick={() => setIsOpen(false)}
        >
          <User className="h-4 w-4 mr-2" />
          Profile
        </Link>
      )}
      <button
        onClick={() => {
          handleLogout();
          setIsOpen(false);
        }}
        className="w-full flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </button>
    </div>
  );
  return (
    <nav className="border-b">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/" className="text-lg font-bold">
            Logoipsum
          </Link>
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? "secondary" : "ghost"}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col space-y-4 pt-6">
                <Link href="/" className="text-lg font-bold mb-4">
                  Logoipsum
                </Link>
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className="justify-start"
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Auth Buttons */}
        <div className="relative">
          {role && (
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2"
            >
              <User className="h-5 w-5" />
              <span>{user?.username}</span>
            </Button>
          )}

          <div className="flex items-center gap-4">
            {role ? (
              profileComponent
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
