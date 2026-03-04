"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import {
    LogOut, MessageSquare, User, Zap,
    Clock, Briefcase, LayoutDashboard, Settings, Shield
} from "lucide-react";
import { getDeviceId } from "@/lib/utils";
import { toast } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ready, setReady] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch(`${API}/admin/me`, {
                headers: { "X-Device-ID": getDeviceId() },
                credentials: "include",
            });
            if (!res.ok) {
                // Any non-200 response (401, 403, 500) = redirect
                router.replace("/login");
                return;
            }
            // Authenticated — now fetch unread count separately
            const msgRes = await fetch(`${API}/admin/messages`, {
                headers: { "X-Device-ID": getDeviceId() },
                credentials: "include",
            });
            if (msgRes.ok) {
                const messages = await msgRes.json();
                if (Array.isArray(messages)) {
                    setUnreadCount(messages.filter((m: any) => !m.is_read).length);
                }
            }
            setReady(true);
        } catch {
            // Network error = redirect to login
            router.replace("/login");
        }
    }, [router]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleLogout = async () => {
        try {
            await fetch(`${API}/admin/logout`, { method: "POST", credentials: "include" });
            toast.success("Session terminated.");
            router.replace("/");
        } catch {
            toast.error("Logout failed.");
        }
    };

    // Block ALL rendering until auth is confirmed — never let admin UI flash
    if (!ready) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Verifying Session...</p>
                </div>
            </div>
        );
    }

    const navItems = [
        { href: "/admin/home", label: "Home", icon: User },
        { href: "/admin/about", label: "About & Profile", icon: Clock },
        { href: "/admin/projects", label: "Projects", icon: Briefcase },
        { href: "/admin/contact", label: "Contact", icon: Settings },
        { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
        { href: "/admin/security", label: "Security", icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-cyan-500 selection:text-black overflow-hidden relative">

            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-30 w-full px-6 py-4 bg-black/60 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between">
                <div>
                    <h2 className="font-black text-white text-sm tracking-tight italic m-0">DAMEER.EXE</h2>
                    <p className="text-[7px] text-zinc-600 font-mono uppercase tracking-[0.3em]">v4.0 Admin Node</p>
                </div>
                <button onClick={handleLogout} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95">
                    <LogOut className="w-4 h-4" />
                </button>
            </header>

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="hidden md:flex w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex-col h-screen sticky top-0 z-20 flex-shrink-0">
                <div className="p-8 border-b border-white/5">
                    <h2 className="font-bold text-white text-xl tracking-tight italic m-0">DAMEER.EXE</h2>
                    <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.3em] mt-1.5">v4.0 Admin Node</p>
                </div>
                <nav className="flex-1 p-5 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
                    {navItems.map(({ href, label, icon: Icon, badge }) => (
                        <button
                            key={href}
                            onClick={() => router.push(href)}
                            className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-left text-[10px] font-bold uppercase tracking-widest transition-all ${pathname === href ? "bg-cyan-500 text-black shadow-[0_10px_20px_rgba(0,243,255,0.15)]" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
                        >
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {label}
                            {badge ? <span className="ml-auto bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span> : null}
                        </button>
                    ))}
                </nav>
                <div className="p-5 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3.5 px-5 py-3.5 text-red-500/80 hover:bg-red-500/5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Terminate Session
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm h-16 bg-zinc-950/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] flex items-center justify-around px-2 shadow-2xl">
                {navItems.map(({ href, label, icon: Icon, badge }) => (
                    <button
                        key={href}
                        onClick={() => router.push(href)}
                        className={`relative p-3.5 rounded-full transition-all active:scale-90 ${pathname === href ? "text-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        <Icon className="w-5 h-5" />
                        {badge ? (
                            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[8px] font-black text-black">
                                {badge}
                            </span>
                        ) : null}
                        {pathname === href && (
                            <motion.div layoutId="activeNav" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />
                        )}
                    </button>
                ))}
            </nav>

            {/* Content Area */}
            <main className="flex-1 w-full p-6 md:p-8 lg:p-12 overflow-y-auto h-screen bg-[#050505] pb-32 md:pb-8">
                <div className="max-w-6xl mx-auto space-y-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
