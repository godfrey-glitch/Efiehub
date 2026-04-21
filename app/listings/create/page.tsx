"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/listings";
import { GHANA_LOCATIONS, PROPERTY_TYPES, AMENITIES_LIST } from "@/lib/types";
import toast from "react-hot-toast";
import { Upload, X, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CreateListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "host")) {
      toast.error("Only hosts can create listings.");
      router.push("/");
    }
  }, [user, loading, router]);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 6) { toast.error("Max 6 images."); return; }
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !propertyType || !pricePerNight) {
      toast.error("Please fill in all required fields."); return;
    }
    if (Number(pricePerNight) <= 0) { toast.error("Price must be greater than 0."); return; }
    if (!user) return;
    setSubmitting(true);
    try {
      const id = await createListing(
        {
          hostId: user.uid,
          hostName: user.name,
          title,
          description,
          location,
          propertyType,
          pricePerNight: Number(pricePerNight),
          amenities,
          images: [],
          isVerified: false,
        },
        imageFiles
      );
      toast.success("Listing created!");
      router.push(`/listings/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6 transition">
        <ChevronLeft size={14} /> Back to dashboard
      </Link>

      <h1 className="font-playfair text-3xl font-bold text-slate-900 mb-1">List Your Property</h1>
      <p className="text-slate-500 text-sm mb-8">Fill in the details to create your listing on Efiehub.</p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 text-base">Basic Information</h2>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Property Title *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Luxurious 2-Bedroom Apartment in East Legon" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Description *</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your property, what makes it special, nearby attractions..." rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Location *</label>
              <select required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition">
                <option value="">Select location</option>
                {GHANA_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Property Type *</label>
              <select required value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition">
                <option value="">Select type</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Price Per Night (GHS) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">GHS</span>
              <input type="number" required min="1" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} placeholder="500" className="w-full border border-slate-200 rounded-xl pl-14 pr-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition" />
            </div>
            {pricePerNight && <p className="text-xs text-slate-400 mt-1">≈ ${(Number(pricePerNight) * 0.063).toFixed(0)} USD</p>}
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 text-base mb-4">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AMENITIES_LIST.map((a) => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)} className={`text-xs px-3 py-2.5 rounded-xl border transition text-left font-medium ${amenities.includes(a) ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-slate-400"}`}>
                {amenities.includes(a) ? "✓ " : ""}{a}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 text-base mb-1">Photos</h2>
          <p className="text-slate-500 text-xs mb-4">Upload up to 6 photos. First image will be the cover.</p>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {previews.map((p, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden h-24 bg-slate-100 group">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-slate-950/70 text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>}
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {imageFiles.length < 6 && (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl py-8 cursor-pointer transition group">
              <Upload size={20} className="text-slate-400 group-hover:text-emerald-500 mb-2 transition" />
              <span className="text-sm text-slate-400 group-hover:text-emerald-600 transition">Click to upload photos</span>
              <span className="text-xs text-slate-300 mt-1">JPG, PNG up to 10MB each</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
            </label>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-60 text-sm shadow-lg shadow-emerald-200">
          {submitting ? "Creating listing..." : "🏠 Publish Listing"}
        </button>
      </form>
    </div>
  );
}
