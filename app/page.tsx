"use client";
import { useEffect, useState } from "react";
import { getAllListings } from "@/lib/listings";
import { Listing, GHANA_LOCATIONS, PROPERTY_TYPES } from "@/lib/types";
import ListingCard from "@/components/ListingCard";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getAllListings().then((data) => {
      setListings(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  const applyFilters = () => {
    let result = [...listings];
    if (searchLocation) result = result.filter((l) => l.location.toLowerCase().includes(searchLocation.toLowerCase()));
    if (minPrice) result = result.filter((l) => l.pricePerNight >= Number(minPrice));
    if (maxPrice) result = result.filter((l) => l.pricePerNight <= Number(maxPrice));
    if (propertyType) result = result.filter((l) => l.propertyType === propertyType);
    setFiltered(result);
  };

  const clearFilters = () => {
    setSearchLocation(""); setMinPrice(""); setMaxPrice(""); setPropertyType("");
    setFiltered(listings);
  };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 40%, #1d4ed8 100%)"}}>
        {/* Decorative circles */}
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-10" style={{background: "#fbbf24"}} />
        <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full opacity-10" style={{background: "#fbbf24"}} />

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <img src="/efiehub-logo.png" alt="Efiehub" className="h-28 w-auto mx-auto mb-6 drop-shadow-xl" />
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-white leading-tight mb-3">
            Find Your Perfect
            <span className="block" style={{color: "#fbbf24"}}>Ghana Home Away</span>
          </h1>
          <p className="text-sky-100 text-base md:text-lg max-w-xl mx-auto mb-10">
            Discover handpicked short-term rentals across Accra, Kumasi, Tema and beyond. Book with confidence.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-3 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-center gap-2 flex-1 px-3 border border-sky-100 rounded-xl">
              <MapPin size={16} className="text-sky-500 shrink-0" />
              <select
                className="w-full bg-transparent text-slate-700 text-sm py-2 outline-none"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {GHANA_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <button
              onClick={applyFilters}
              className="flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl transition w-full sm:w-auto text-slate-900"
              style={{background: "#fbbf24"}}
              onMouseEnter={e => (e.currentTarget.style.background = "#f59e0b")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fbbf24")}
            >
              <Search size={16} /> Search
            </button>
          </div>

          {/* Quick location pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {GHANA_LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => setSearchLocation(loc)}
                className="text-xs text-sky-100 border border-sky-300 hover:border-amber-400 hover:text-amber-300 px-3 py-1 rounded-full transition"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-playfair text-slate-900">
              {searchLocation ? `Rentals in ${searchLocation}` : "All Listings"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{filtered.length} properties available</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm border border-sky-200 hover:border-sky-400 hover:text-sky-600 text-slate-500 px-4 py-2 rounded-xl transition"
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-sky-100 rounded-2xl p-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Min Price (GHS)</label>
              <input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-sky-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-400" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Max Price (GHS)</label>
              <input type="number" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-sky-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-400" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Property Type</label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full border border-sky-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-400">
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={applyFilters} className="flex-1 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Apply</button>
              <button onClick={clearFilters} className="flex-1 border border-slate-200 hover:border-slate-400 text-slate-600 px-4 py-2 rounded-lg text-sm transition">Clear</button>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-sky-50 animate-pulse rounded-2xl h-72" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-5xl mb-4">🏘️</p>
            <p className="text-lg font-semibold">No listings found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
            <button onClick={clearFilters} className="mt-4 text-sky-500 hover:underline text-sm">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>

      {/* CTA for hosts */}
      <section className="py-16 mt-8" style={{background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)"}}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-playfair text-3xl font-bold text-white mb-3">Own a property in Ghana?</h2>
          <p className="text-sky-100 mb-7 text-sm md:text-base">List it on Efiehub and start earning. Setup takes less than 5 minutes.</p>
          <Link
            href="/signup"
            className="inline-block font-bold px-8 py-3 rounded-xl transition text-sm text-slate-900 shadow-lg"
            style={{background: "#fbbf24"}}
          >
            List Your Property →
          </Link>
        </div>
      </section>
    </>
  );
}
