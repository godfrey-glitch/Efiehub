"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Menu, X, LogOut, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out.");
    setOpen(false);
  };

  return (
    <nav className="bg-white border-b border-sky-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <img src="/efiehub-logo.png" alt="Efiehub" className="h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="text-slate-600 hover:text-sky-600 transition font-medium">Explore</Link>
          {user ? (
            <>
              {user.role === "host" && (
                <>
                  <Link href="/dashboard" className="text-slate-600 hover:text-sky-600 transition font-medium">Dashboard</Link>
                  <Link href="/listings/create" className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 px-4 py-2 rounded-xl transition text-sm font-semibold shadow-sm">
                    <PlusCircle size={14} /> List Property
                  </Link>
                </>
              )}
              <span className="text-slate-500 text-sm">Hi, {user.name.split(" ")[0]}</span>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition text-sm">
                <LogOut size={14} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-sky-600 transition font-medium">Sign In</Link>
              <Link href="/signup" className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-xl transition shadow-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-sky-600" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-sky-100 px-4 py-4 flex flex-col gap-4 text-sm shadow-md">
          <Link href="/" onClick={() => setOpen(false)} className="text-slate-600 hover:text-sky-600 font-medium">Explore Listings</Link>
          {user ? (
            <>
              {user.role === "host" && (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="text-slate-600 hover:text-sky-600 font-medium">Dashboard</Link>
                  <Link href="/listings/create" onClick={() => setOpen(false)} className="text-amber-500 hover:text-amber-400 font-semibold">+ List Property</Link>
                </>
              )}
              <span className="text-slate-400">Signed in as {user.email}</span>
              <button onClick={handleLogout} className="text-left text-red-400 hover:text-red-500">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-slate-600 hover:text-sky-600 font-medium">Sign In</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="text-sky-500 hover:text-sky-400 font-semibold">Get Started →</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
