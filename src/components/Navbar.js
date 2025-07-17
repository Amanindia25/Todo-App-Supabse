"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/signin");
  };

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between p-4 bg-slate-800 text-white shadow-md z-50">
      <Link href="/tododashboard" className="text-xl font-bold">
        ToDo App
      </Link>

      <div className="space-x-4">
        {user ? (
          <>
            <Link href="/tododashboard">Dashboard</Link>
            <Link href="/stats">Stats</Link>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/signin">Sign In</Link>
            <Link href="/auth/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
