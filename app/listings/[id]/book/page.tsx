"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getListingById } from "@/lib/listings";
import { createBooking, getBookingsForListing } from "@/lib/bookings";
import { Listing, GHS_TO_USD } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";
import { MapPin, CalendarDays, ChevronLeft, CreditCard, ShieldCheck, AlertCircle } from "lucide-react";
import { differenceInDays, format, addDays, isBefore, isAfter, isSameDay } from "date-fns";

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [bookedRanges, setBookedRanges] = useState<{ checkIn: Date; checkOut: Date }[]>([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"dates" | "payment" | "confirm">("dates");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "guest") { router.push("/"); return; }
    if (id) {
      Promise.all([getListingById(id), getBookingsForListing(id)]).then(([l, b]) => {
        setListing(l);
        setBookedRanges(b.map((bk) => ({ checkIn: bk.checkIn, checkOut: bk.checkOut })));
        setLoading(false);
      });
    }
  }, [id, user, router]);

  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const totalPrice = nights > 0 && listing ? nights * listing.pricePerNight : 0;
  const totalUSD = (totalPrice * GHS_TO_USD).toFixed(0);

  const isDateBlocked = (dateStr: string): boolean => {
    const d = new Date(dateStr);
    return bookedRanges.some(({ checkIn: ci, checkOut: co }) => {
      return (isAfter(d, ci) || isSameDay(d, ci)) && isBefore(d, co);
    });
  };

  const validateDates = (): boolean => {
    if (!checkIn || !checkOut) { toast.error("Please select check-in and check-out dates."); return false; }
    if (nights <= 0) { toast.error("Check-out must be after check-in."); return false; }
    if (isDateBlocked(checkIn) || isDateBlocked(checkOut)) {
      toast.error("Selected dates overlap with an existing booking."); return false;
    }
    return true;
  };

  const handleBook = async () => {
    if (!listing || !user) return;
    setSubmitting(true);
    try {
      await createBooking({
        listingId: listing.id,
        listingTitle: listing.title,
        guestId: user.uid,
        guestName: user.name,
        hostId: listing.hostId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalPrice,
        nights,
        status: "confirmed",
      });
      setStep("confirm");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">Loading...</div>;
  if (!listing) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">Listing not found.</div>;

  // ── CONFIRM SCREEN ──
  if (step === "confirm") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-10">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={32} className="text-emerald-600" />
          </div>
          <h1 className="font-playfair text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 text-sm mb-6">Your stay at <strong>{listing.title}</strong> is booked.</p>
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-left space-y-2 mb-7 border border-slate-100">
            <div className="flex justify-between"><span className="text-slate-500">Check-in</span><span className="font-medium">{format(new Date(checkIn), "MMM d, yyyy")}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Check-out</span><span className="font-medium">{format(new Date(checkOut), "MMM d, yyyy")}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-medium">{nights} night{nights !== 1 ? "s" : ""}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-2"><span className="font-semibold">Total Paid</span><span className="font-bold text-emerald-700">GHS {totalPrice.toLocaleString()}</span></div>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>This is a mock booking. No real payment was processed.</span>
          </div>
          <Link href="/" className="block w-full bg-slate-950 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition text-sm">
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href={`/listings/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6 transition">
        <ChevronLeft size={14} /> Back to listing
      </Link>

      <h1 className="font-playfair text-3xl font-bold text-slate-900 mb-1">
        {step === "dates" ? "Select Your Dates" : "Review & Pay"}
      </h1>
      <p className="text-slate-500 text-sm mb-8">Booking: <span className="font-medium text-slate-700">{listing.title}</span></p>

      {/* Listing mini-card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-4 mb-8">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
          {listing.images?.[0] && <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />}
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">{listing.title}</p>
          <p className="text-slate-500 text-xs flex items-center gap-1 mt-1"><MapPin size={11} /> {listing.location}</p>
          <p className="text-slate-700 text-sm font-medium mt-2">GHS {listing.pricePerNight.toLocaleString()} <span className="font-normal text-slate-400 text-xs">/ night</span></p>
        </div>
      </div>

      {/* STEP 1: Dates */}
      {step === "dates" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase tracking-wide">Check-in</label>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(""); }}
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase tracking-wide">Check-out</label>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  min={checkIn || tomorrow}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition"
                />
              </div>
            </div>
          </div>

          {bookedRanges.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span>{bookedRanges.length} date range{bookedRanges.length > 1 ? "s are" : " is"} already booked for this property.</span>
            </div>
          )}

          {nights > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>GHS {listing.pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? "s" : ""}</span>
                <span className="font-medium">GHS {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total</span>
                <div className="text-right">
                  <p>GHS {totalPrice.toLocaleString()}</p>
                  <p className="text-xs font-normal text-slate-400">≈ ${totalUSD} USD</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => { if (validateDates()) setStep("payment"); }}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition text-sm"
          >
            Continue to Payment →
          </button>
        </div>
      )}

      {/* STEP 2: Mock Payment */}
      {step === "payment" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-center gap-2">
            <AlertCircle size={13} className="shrink-0" />
            <span>This is a demo. No real payment will be processed.</span>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase tracking-wide">Cardholder Name</label>
            <input type="text" defaultValue={user?.name} placeholder="Full name" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase tracking-wide">Card Number</label>
            <div className="relative">
              <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="text" defaultValue="4242 4242 4242 4242" placeholder="1234 5678 9012 3456" className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-emerald-500 transition" readOnly />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase tracking-wide">Expiry</label>
              <input type="text" defaultValue="12/28" placeholder="MM/YY" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition" readOnly />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase tracking-wide">CVV</label>
              <input type="text" defaultValue="123" placeholder="CVV" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition" readOnly />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>{format(new Date(checkIn), "MMM d")} → {format(new Date(checkOut), "MMM d, yyyy")}</span>
              <span>{nights} night{nights !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Due</span>
              <div className="text-right">
                <p>GHS {totalPrice.toLocaleString()}</p>
                <p className="text-xs font-normal text-slate-400">≈ ${totalUSD} USD</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep("dates")} className="flex-1 border border-slate-200 hover:border-slate-400 text-slate-600 py-3 rounded-xl text-sm transition">
              ← Back
            </button>
            <button
              onClick={handleBook}
              disabled={submitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 text-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck size={15} /> {submitting ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400">Your booking is protected. Free cancellation available.</p>
        </div>
      )}
    </div>
  );
}
