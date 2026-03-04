"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Define routes that should NOT have the navbar
    const isExcluded = pathname.startsWith("/login") || pathname.startsWith("/admin") || pathname.startsWith("/dameer-portal") || pathname.startsWith("/forgot-password");

    if (isExcluded) {
        return (
            <>
                <main className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500 selection:text-black">
                    {children}
                </main>
                <Toaster position="bottom-right" />
            </>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-cyan-500 selection:text-black">

            {/* Top Minimalist Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 w-full pt-24 pb-20">
                {/* Global Background Glows (Extreme Minimalist) */}
                <div className="fixed -top-40 -right-40 w-[800px] h-[800px] bg-cyan-900/5 blur-[200px] pointer-events-none -z-10" />

                <PageTransition>
                    <div className="w-full max-w-6xl mx-auto min-h-full px-4 sm:px-6 lg:px-12">
                        {children}
                    </div>
                </PageTransition>
            </main>

            <Toaster position="top-center" reverseOrder={false} toastOptions={{
                duration: 3000,
                style: {
                    background: '#0a0a0a',
                    color: '#00f3ff',
                    border: '1px solid #1a1a1a',
                    padding: '16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                },
            }} />
        </div>
    );
}
