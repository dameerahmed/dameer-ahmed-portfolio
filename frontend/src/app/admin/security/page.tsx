"use client";

import { useEffect, useState } from "react";
import { Shield, Smartphone, Monitor, Globe, Clock, Trash2, Zap, ShieldCheck, Edit3, Check, X, ShieldAlert, Crown, Unlock, Key, AlertTriangle, LifeBuoy } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminUI";
import { API, fetchWithAuth } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Session {
    id: number;
    device_id: string;
    device_name: string | null;
    ip_address: string;
    user_agent: string;
    last_active: string;
    is_current: boolean;
    is_protected: boolean;
}

export default function AdminSecurity() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newName, setNewName] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [newName, setNewName] = useState("");

    const fetchSessions = async () => {
        try {
            const res = await fetchWithAuth(`${API}/admin/sessions`);
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const terminateSession = async (id: number) => {
        if (!confirm("Are you sure you want to terminate this session? The device will be logged out immediately.")) return;

        try {
            const res = await fetchWithAuth(`${API}/admin/sessions/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Session terminated");
                fetchSessions();
            } else {
                const err = await res.json();
                toast.error(err.detail || "Failed to terminate session");
            }
        } catch (error) {
            toast.error("Failed to terminate session");
        }
    };

    const terminateOthers = async () => {
        if (!confirm("This will log out ALL other devices except this one. Continue?")) return;

        try {
            const res = await fetchWithAuth(`${API}/admin/sessions/terminate-others`, {
                method: "POST"
            });
            if (res.ok) {
                toast.success("All other sessions terminated");
                fetchSessions();
            }
        } catch (error) {
            toast.error("Failed to terminate sessions");
        }
    };

    const updateName = async (id: number) => {
        try {
            const res = await fetchWithAuth(`${API}/admin/sessions/${id}/name`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName })
            });
            if (res.ok) {
                toast.success("Device name updated");
                setEditingId(null);
                fetchSessions();
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const getDeviceIcon = (ua: string) => {
        const lowerUA = ua.toLowerCase();
        if (lowerUA.includes("mobi") || lowerUA.includes("android") || lowerUA.includes("iphone")) {
            return <Smartphone className="w-5 h-5" />;
        }
        return <Monitor className="w-5 h-5" />;
    };

    const formatUA = (ua: string) => {
        const lowerUA = ua.toLowerCase();
        let browser = "Browser";
        if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
        else if (ua.includes("Edge")) browser = "Edge";

        const isMobile = lowerUA.includes("mobi") || lowerUA.includes("android") || lowerUA.includes("iphone");
        return `${isMobile ? "Mobile" : "Desktop"} • ${browser}`;
    };

    const onProtectedDevice = sessions.find(s => s.is_current)?.is_protected;

    return (
        <AdminSection title="Security & Sessions" sub="Monitor active devices and enforce global access control">
            <div className="space-y-8 pb-32">

                {/* 1. Main Status Card */}
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 backdrop-blur-3xl border border-cyan-500/20 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    <div className="w-20 h-20 rounded-3xl bg-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                        <ShieldCheck className="w-10 h-10 text-black" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h3 className="text-xl font-black italic tracking-tight">Active Digital Footprint</h3>
                        <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-md">
                            {onProtectedDevice ? "You are logged in as SUPER ADMIN. All devices are visible." : "You are in Restricted View. Only your current device is visible."}
                        </p>
                    </div>
                    <button
                        onClick={terminateOthers}
                        className="bg-red-500 hover:bg-red-400 text-black font-black py-4 px-8 rounded-2xl transition-all shadow-[0_10px_20px_rgba(239,68,68,0.2)] active:scale-95 text-[10px] uppercase tracking-widest flex items-center gap-3"
                    >
                        <Zap className="w-4 h-4" /> Terminate All Others
                    </button>
                </div>

                {/* 3. Emergency Rescue Form removed - integrated into Login */}

                {/* 4. Sessions List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-6">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Logged-in Devices ({sessions.length})</h4>
                    </div>

                    <div className="grid gap-4">
                        {isLoading ? (
                            <div className="p-12 flex flex-col items-center gap-4">
                                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Scanning Network...</p>
                            </div>
                        ) : sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`group bg-black/40 backdrop-blur-xl border ${session.is_current ? 'border-cyan-500/30' : 'border-white/5'} rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all hover:bg-black/60`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${session.is_current ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-white/5 text-zinc-400'}`}>
                                    {getDeviceIcon(session.user_agent)}
                                </div>

                                <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center gap-3">
                                        {editingId === session.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:border-cyan-500 transition-colors"
                                                    value={newName}
                                                    onChange={e => setNewName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && updateName(session.id)}
                                                />
                                                <button onClick={() => updateName(session.id)} className="text-cyan-500"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingId(null)} className="text-zinc-500"><X className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 group/name">
                                                <h5 className="font-bold text-sm tracking-tight">{session.device_name || formatUA(session.user_agent)}</h5>
                                                <button
                                                    onClick={() => { setEditingId(session.id); setNewName(session.device_name || ""); }}
                                                    className="opacity-0 group-hover/name:opacity-100 text-zinc-700 hover:text-cyan-500 transition-all"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}

                                        {session.is_current && (
                                            <span className="bg-cyan-500 text-black text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse">
                                                Active & Yours
                                            </span>
                                        )}

                                        {session.is_protected && (
                                            <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20 flex items-center gap-1.5">
                                                <Shield className="w-2.5 h-2.5" /> Primary Locked
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono text-zinc-500">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-3 h-3 text-zinc-700" />
                                            <span>{session.ip_address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-zinc-700" />
                                            <span>{formatUA(session.user_agent)} • Seen {new Date(session.last_active).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-right">
                                    {session.is_protected && (
                                        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                            <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest">SUPER ADMIN</span>
                                        </div>
                                    )}

                                    {!session.is_current && !session.is_protected && (
                                        <button
                                            onClick={() => terminateSession(session.id)}
                                            className="md:opacity-0 group-hover:opacity-100 p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest border border-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" /> Logoff
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminSection>
    );
}
