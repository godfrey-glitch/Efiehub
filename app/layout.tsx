import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Efiehub — Short-Term Rentals in Ghana",
  description: "Find and book beautiful short-term rentals across Ghana.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0284c7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Efiehub" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: "8px",
                background: "#0284c7",
                color: "#ffffff",
              },
            }}
          />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="text-white py-10 mt-20 text-sm" style={{background: "linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)"}}>
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-6 items-start">
              <div>
                <img src="/efiehub-logo.png" alt="Efiehub" className="h-10 w-auto mb-2" style={{filter: "brightness(0) invert(1)"}} />
                <p className="text-sky-200 text-xs">Short-term rentals across Ghana.</p>
              </div>
              <div className="flex gap-6 text-xs text-sky-300">
                <span>© {new Date().getFullYear()} Efiehub</span>
                <span>Accra · Kumasi · Tema · East Legon · Aburi</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
