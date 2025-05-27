"use client";
import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfileUser() {
    const { user, loading } = useAuth(); 
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        // Redirect only after check
        router.push("/login");
      }
    }, [user, loading, router]);

    if (loading) {
      return <div>Loading...</div>; 
    }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-bold mb-6">User Profile</h1>

          <div className="space-y-4">
            <div className="flex justify-center">
              <label className="block font-medium text-gray-700">
                Username:
              </label>
              <strong className="text-gray-900">
                &nbsp;&nbsp;&nbsp;&nbsp;{user.username}
              </strong>
            </div>

            <div className="flex justify-center ">
              <label className="block font-medium text-gray-700">
                Role:
              </label>
              <strong className="text-gray-900">
                &nbsp;&nbsp;&nbsp;&nbsp;{user.role}
              </strong>
            </div>

            <div className="pt-6 border-t mt-6">
              <Button>
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          © 2025 Blog genzet. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
