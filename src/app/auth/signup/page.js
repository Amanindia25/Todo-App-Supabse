"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push("/auth/signin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl space-y-6"
      >
        <h1 className="text-2xl font-bold text-center mb-4 text-slate-900 dark:text-white">Sign Up</h1>

        <Input
          type="text"
          placeholder="Username"
          className=""
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <Input
          type="email"
          placeholder="Email"
          className=""
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>

        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className=""
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>

        {errorMsg && (
          <p className="text-red-500 text-sm text-center">{errorMsg}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
