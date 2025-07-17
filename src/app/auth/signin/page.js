"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    console.log("➡️ Input changed:", e.target.name, e.target.value);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("📤 Submitting form data:", formData);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log("📩 Supabase response data:", data);
      console.log("📩 Supabase error (if any):", error);

      if (error) {
        toast.error("Invalid credentials");
        console.log("❌ Sign in failed:", error.message);
      } else {
        toast.success("Sign in successful");
        console.log("✅ Sign in success. Redirecting to /tododashboard");

        // extra log before and after redirect
        console.log("🧭 Pushing route to /tododashboard");
        router.push("/tododashboard");
        console.log("✅ router.push call executed (Note: won't block)");
      }
    } catch (err) {
      console.log("❌ Unexpected error during sign-in:", err.message);
    } finally {
      setLoading(false);
      console.log("🔄 Loading state set to false");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl space-y-6"
      >
        <h1 className="text-2xl font-bold text-center mb-4 text-slate-900 dark:text-white">
          Sign In
        </h1>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Email
          </label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            onChange={handleChange}
            value={formData.email}
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Enter your password"
              onChange={handleChange}
              value={formData.password}
              required
            />
            <span
              onClick={() => {
                setShowPassword(!showPassword);
                console.log("👁️ Toggled password visibility");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </section>
  );
}
