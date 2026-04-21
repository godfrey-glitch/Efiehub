"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getListingById } from "@/lib/listings";
import { Listing, GHS_TO_USD, AMENITIES_LIST } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { MapPin, BadgeCheck, ChevronLeft, ChevronRight, Star, Wifi, Car, Waves, Wind } from "lucide-react";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={14} />, Parking: <Car size={14} />, "Swimming Pool": <Waves size={14} />, "Air Conditioning": <Wind size={14} />,
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (id) getListingById(id).then((l) => { setListing(l); setLoading(false); });
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">Loading...</div>;
  if (!listing) return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">Listing not found.</div>;

  const images = listing.images?.length ? listing.images : ["/placeholder.jpg"];
  const usd = (listing.pricePerNight * GHS_TO_USD).toFixed(0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6 transition">
        <ChevronLeft size={14} /> Back to listings
      </Link>

      {/* Image Gallery */}
      <div className="relative rounded-2xl overflow-hidden h-72 md:h-[420px] bg-slate-200 mb-8 shadow-md">
        <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
        {images.length > 1 && (
          <>
            <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setImgIdx((i) => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow">
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />)}
            </div>
          </>
        )}
        {listing.isVerified && (
          <span className="absolute top-4 left-4 flex items-center gap-1 bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            <BadgeCheck size={12} /> Verified Host
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-playfair text-3xl font-bold text-slate-900">{listing.title}</h1>
              <div className="flex items-center gap-1 text-amber-500 shrink-0 mt-1">
                <Star size={16} fill="currentColor" /><span className="font-semibold text-slate-900">4.8</span>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-slate-500 text-sm mt-2">
              <MapPin size={13} /> {listing.location} · {listing.propertyType}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="font-semibold text-slate-800 mb-2">About this place</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{listing.description}</p>
          </div>

          {listing.amenities?.length > 0 && (
            <div className="border-t border-slate-100 pt-5">
              <h2 className="font-semibold text-slate-800 mb-3">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {listing.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    <span className="text-emerald-600">{AMENITY_ICONS[a] || "✓"}</span> {a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking Widget */}
        <div>
          <div className="sticky top-20 bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
            <div className="mb-4">
              <span className="text-2xl font-bold text-slate-900">GHS {listing.pricePerNight.toLocaleString()}</span>
              <span className="text-slate-400 text-sm"> / night</span>
              <p className="text-xs text-slate-400 mt-0.5">≈ ${usd} USD per night</p>
            </div>
            {user ? (
              user.role === "guest" ? (
                <Link href={`/listings/${listing.id}/book`} className="block w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-center py-3 rounded-xl transition text-sm">
                  Book Now →
                </Link>
              ) : (
                <p className="text-xs text-slate-500 text-center bg-slate-50 rounded-lg p-3">Hosts cannot book listings.</p>
              )
            ) : (
              <div className="space-y-2">
                <Link href={`/login`} className="block w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-center py-3 rounded-xl transition text-sm">
                  Sign In to Book
                </Link>
                <Link href="/signup" className="block w-full text-center text-sm text-slate-500 hover:text-slate-700">Create an account</Link>
              </div>
            )}
            <p className="text-center text-xs text-slate-400 mt-3">No charge yet · Free cancellation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
