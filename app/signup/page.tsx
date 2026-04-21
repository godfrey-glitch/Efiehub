"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { UserRole } from "@/lib/types";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("guest");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await signup(email, password, name, role);
      toast.success("Account created! Welcome to Efiehub.");
      router.push(role === "host" ? "/dashboard" : "/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/efiehub-logo.png" alt="Efiehub" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="font-playfair text-3xl font-bold text-slate-900">Join Efiehub</h1>
          <p className="text-slate-500 text-sm mt-2">Create your account to get started</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-sky-100 p-8">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(["guest", "host"] as UserRole[]).map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition ${
                  role === r
                    ? r === "host" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}>
                {r === "guest" ? "🧳 I'm a Guest" : "🏠 I'm a Host"}
              </button>
            ))}
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Kwame Mensah" className="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-400 transition" />
            </div>
            <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-sm mt-2" style={{background: "#0284c7"}}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-sky-500 hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
