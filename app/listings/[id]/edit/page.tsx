"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { getListingById, updateListing } from "@/lib/listings";
import { Listing, GHANA_LOCATIONS, PROPERTY_TYPES, AMENITIES_LIST } from "@/lib/types";
import toast from "react-hot-toast";
import { Upload, X, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "host")) { router.push("/"); return; }
    if (id) {
      getListingById(id).then((l) => {
        if (!l || l.hostId !== user?.uid) { toast.error("Not authorized."); router.push("/dashboard"); return; }
        setListing(l);
        setTitle(l.title);
        setDescription(l.description);
        setLocation(l.location);
        setPropertyType(l.propertyType);
        setPricePerNight(String(l.pricePerNight));
        setAmenities(l.amenities || []);
        setExistingImages(l.images || []);
        setPageLoading(false);
      });
    }
  }, [id, user, loading, router]);

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalCount = existingImages.length + newImageFiles.length + files.length;
    if (totalCount > 6) { toast.error("Max 6 images total."); return; }
    setNewImageFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeExisting = (i: number) => setExistingImages((prev) => prev.filter((_, idx) => idx !== i));
  const removeNew = (i: number) => { setNewImageFiles((p) => p.filter((_, idx) => idx !== i)); setNewPreviews((p) => p.filter((_, idx) => idx !== i)); };
  const toggleAmenity = (a: string) => setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;
    setSubmitting(true);
    try {
      await updateListing(listing.id, { title, description, location, propertyType, pricePerNight: Number(pricePerNight), amenities, images: existingImages }, newImageFiles);
      toast.success("Listing updated!");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6 transition">
        <ChevronLeft size={14} /> Back to dashboard
      </Link>

      <h1 className="font-playfair text-3xl font-bold text-slate-900 mb-1">Edit Listing</h1>
      <p className="text-slate-500 text-sm mb-8">Update your property details.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 text-base">Basic Information</h2>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Title *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Description *</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition">
                {GHANA_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Property Type</label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition">
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Price Per Night (GHS)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">GHS</span>
              <input type="number" min="1" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} className="w-full border border-slate-200 rounded-xl pl-14 pr-4 py-3 text-sm outline-none focus:border-emerald-500 transition" />
            </div>
          </div>
        </div>

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

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 text-base mb-4">Photos</h2>
          {existingImages.length + newPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {existingImages.map((src, i) => (
                <div key={`ex-${i}`} className="relative rounded-xl overflow-hidden h-24 bg-slate-100 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExisting(i)} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"><X size={10} /></button>
                </div>
              ))}
              {newPreviews.map((p, i) => (
                <div key={`new-${i}`} className="relative rounded-xl overflow-hidden h-24 bg-slate-100 group">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-emerald-600/80 text-white text-[10px] px-1.5 py-0.5 rounded">New</span>
                  <button type="button" onClick={() => removeNew(i)} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"><X size={10} /></button>
                </div>
              ))}
            </div>
          )}
          {existingImages.length + newImageFiles.length < 6 && (
            <label className="flex flex-col items-center border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl py-6 cursor-pointer transition group">
              <Upload size={18} className="text-slate-400 group-hover:text-emerald-500 mb-1 transition" />
              <span className="text-sm text-slate-400 group-hover:text-emerald-600">Add more photos</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleNewImages} />
            </label>
          )}
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-60 text-sm">
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
