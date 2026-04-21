"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/efiehub-logo.png" alt="Efiehub" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="font-playfair text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-2">Sign in to your Efiehub account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-sky-100 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-200 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-200 transition" />
            </div>
            <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-sm" style={{background: "#0284c7"}}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-sky-500 hover:underline font-medium">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
