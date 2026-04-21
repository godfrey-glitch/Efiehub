"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getListingsByHost, deleteListing } from "@/lib/listings";
import { getBookingsForHostListings } from "@/lib/bookings";
import { Listing, Booking } from "@/lib/types";
import Link from "next/link";
import toast from "react-hot-toast";
import { PlusCircle, Edit2, Trash2, MapPin, CalendarDays, BadgeCheck, Eye } from "lucide-react";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "bookings">("listings");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "host")) {
      toast.error("Host access only.");
      router.push("/");
      return;
    }
    if (user && user.role === "host") {
      getListingsByHost(user.uid).then(async (ls) => {
        setListings(ls);
        if (ls.length > 0) {
          const bks = await getBookingsForHostListings(ls.map((l) => l.id));
          setBookings(bks);
        }
        setPageLoading(false);
      });
    }
  }, [user, loading, router]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Listing deleted.");
    } catch {
      toast.error("Failed to delete listing.");
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (status: Booking["status"]) => {
    const map = { confirmed: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", cancelled: "bg-red-100 text-red-600" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[status]}`}>{status}</span>;
  };

  if (pageLoading) return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">Loading dashboard...</div>;

  const totalRevenue = bookings.filter((b) => b.status !== "cancelled").reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-slate-900">Host Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.name?.split(" ")[0]}</p>
        </div>
        <Link href="/listings/create" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm shadow-lg shadow-emerald-100">
          <PlusCircle size={16} /> New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Listings</p>
          <p className="text-3xl font-bold text-slate-900">{listings.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-slate-900">{bookings.filter((b) => b.status !== "cancelled").length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 col-span-2 md:col-span-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-700">GHS {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {(["listings", "bookings"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${activeTab === tab ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
            {tab} {tab === "bookings" && `(${bookings.length})`}
          </button>
        ))}
      </div>

      {/* LISTINGS TAB */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-4xl mb-3">🏠</p>
              <p className="font-semibold text-slate-700">No listings yet</p>
              <p className="text-sm text-slate-400 mt-1 mb-5">Create your first property listing</p>
              <Link href="/listings/create" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
                <PlusCircle size={15} /> Create Listing
              </Link>
            </div>
          ) : (
            listings.map((l) => {
              const lBookings = bookings.filter((b) => b.listingId === l.id && b.status !== "cancelled");
              return (
                <div key={l.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-4 hover:shadow-md transition">
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    {l.images?.[0] ? <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xl">🏘️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">{l.title}</h3>
                      {l.isVerified && <span className="flex items-center gap-1 text-xs text-emerald-600 shrink-0"><BadgeCheck size={12} /> Verified</span>}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {l.location} · {l.propertyType}</p>
                    <p className="text-sm font-bold text-slate-900 mt-1.5">GHS {l.pricePerNight.toLocaleString()} <span className="font-normal text-slate-400 text-xs">/ night</span></p>
                    <p className="text-xs text-slate-400 mt-1">{lBookings.length} active booking{lBookings.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/listings/${l.id}`} title="View" className="p-2 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-700 transition">
                      <Eye size={14} />
                    </Link>
                    <Link href={`/listings/${l.id}/edit`} title="Edit" className="p-2 rounded-lg border border-slate-200 hover:border-emerald-400 text-slate-500 hover:text-emerald-600 transition">
                      <Edit2 size={14} />
                    </Link>
                    <button onClick={() => handleDelete(l.id, l.title)} disabled={deletingId === l.id} title="Delete" className="p-2 rounded-lg border border-slate-200 hover:border-red-300 text-slate-500 hover:text-red-500 transition disabled:opacity-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === "bookings" && (
        <div>
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-4xl mb-3">📅</p>
              <p className="font-semibold text-slate-700">No bookings yet</p>
              <p className="text-sm text-slate-400 mt-1">Bookings for your listings will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const listing = listings.find((l) => l.id === b.listingId);
                return (
                  <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900 text-sm">{listing?.title || b.listingId}</p>
                          {statusBadge(b.status)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Guest: {b.guestName || b.guestId}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                          <CalendarDays size={11} />
                          <span>{format(b.checkIn, "MMM d")} → {format(b.checkOut, "MMM d, yyyy")}</span>
                          <span>· {b.nights} night{b.nights !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700 text-base">GHS {b.totalPrice.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{b.nights} × GHS {listing?.pricePerNight.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
