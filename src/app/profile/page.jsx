"use client";

import { useAuth } from "@/hooks/useAuth";
import ProfileAdmin from "../(admin)/admin/profile/page";

export default function ArticlesPage() {
  const { user } = useAuth();

  return user?.role === "Admin" ? <ProfileAdmin /> : <ProfileUser />;
}
