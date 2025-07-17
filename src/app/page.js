"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/tododashboard");
      } else {
        router.push("/auth/signin");
      }
    };

    checkUser();
  }, [router]);

  return null;
}
