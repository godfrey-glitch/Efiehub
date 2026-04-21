import Link from "next/link";
import { Listing, GHS_TO_USD } from "@/lib/types";
import { MapPin, Star, BadgeCheck } from "lucide-react";

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const usd = (listing.pricePerNight * GHS_TO_USD).toFixed(0);
  const img = listing.images?.[0] || "/placeholder.jpg";

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-sky-50 hover:-translate-y-1">
        <div className="relative h-52 overflow-hidden bg-sky-100">
          <img src={img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {listing.isVerified && (
            <span className="absolute top-3 left-3 flex items-center gap-1 bg-sky-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow">
              <BadgeCheck size={11} /> Verified Host
            </span>
          )}
          <span className="absolute top-3 right-3 bg-white/90 text-sky-700 text-xs px-2 py-1 rounded-full font-medium">
            {listing.propertyType}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-sky-600 transition-colors">
              {listing.title}
            </h3>
            <div className="flex items-center gap-1 text-amber-400 shrink-0 text-sm">
              <Star size={13} fill="currentColor" />
              <span className="text-slate-700">4.8</span>
            </div>
          </div>
          <p className="flex items-center gap-1 text-slate-400 text-xs mt-1">
            <MapPin size={11} className="text-sky-400" /> {listing.location}
          </p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <span className="font-bold text-slate-900">GHS {listing.pricePerNight.toLocaleString()}</span>
              <span className="text-slate-400 text-xs"> / night</span>
              <p className="text-xs text-slate-400">≈ ${usd} USD</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-900" style={{background: "#fbbf24"}}>
              Book Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
