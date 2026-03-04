"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Shield, Lock, Eye, EyeOff, CheckCircle2, KeyRound, LogOut } from "lucide-react";
import { getDeviceId } from "@/lib/utils";

import { API } from "@/lib/api";

export default function SecurityPage() {
    const router = useRouter();
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const strength = (pw: string) => {
        if (pw.length === 0) return null;
        if (pw.length < 8) return { label: "Too Short", color: "bg-red-500", width: "25%" };
        if (pw.length < 12 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: "Fair", color: "bg-yellow-500", width: "55%" };
        if (/[^A-Za-z0-9]/.test(pw)) return { label: "Strong", color: "bg-emerald-500", width: "100%" };
        return { label: "Good", color: "bg-cyan-500", width: "75%" };
    };

    const pwStrength = strength(newPw);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPw !== confirmPw) { toast.error("Passwords do not match"); return; }
        if (newPw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
        setIsLoading(true);
        try {
            const res = await fetch(`${API}/admin/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Device-ID": getDeviceId() },
                credentials: "include",
                body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                toast.success("Password changed successfully!");
                setCurrentPw(""); setNewPw(""); setConfirmPw("");
            } else {
                toast.error(data.detail || "Failed to change password");
            }
        } catch {
            toast.error("Request failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTerminateAll = async () => {
        try {
            await fetch(`${API}/admin/logout`, { method: "POST", credentials: "include" });
            toast.success("All sessions terminated.");
            router.replace("/login");
        } catch {
            toast.error("Failed to terminate sessions.");
        }
    };

    return (
        <div className="space-y-8 max-w-xl">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <Shield className="w-5 h-5 text-cyan-500" />
                    <h1 className="text-xl font-bold text-white tracking-tight">Security</h1>
                </div>
                <p className="text-zinc-500 text-sm ml-8">Manage your admin password and active sessions.</p>
            </div>

            {/* Change Password Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10">
                        <KeyRound className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Change Password</h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Must be at least 8 characters</p>
                    </div>
                </div>

                {success && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <p className="text-emerald-400 text-sm font-medium">Password updated! Your new password is now active.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] pl-1">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPw}
                                onChange={e => setCurrentPw(e.target.value)}
                                required
                                placeholder="Your current password"
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white focus:border-cyan-500/50 outline-none transition-colors text-sm"
                            />
                            <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300">
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] pl-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPw}
                                onChange={e => { setNewPw(e.target.value); setSuccess(false); }}
                                required
                                placeholder="Min. 8 characters"
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white focus:border-cyan-500/50 outline-none transition-colors text-sm"
                            />
                            <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300">
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {pwStrength && (
                            <div className="space-y-1 pt-1">
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${pwStrength.color}`} style={{ width: pwStrength.width }} />
                                </div>
                                <p className={`text-[9px] font-bold uppercase tracking-widest pl-1 ${pwStrength.color.replace('bg-', 'text-')}`}>{pwStrength.label}</p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] pl-1">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="password"
                                value={confirmPw}
                                onChange={e => setConfirmPw(e.target.value)}
                                required
                                placeholder="Repeat new password"
                                className={`w-full bg-black/40 border rounded-xl pl-12 pr-5 py-3.5 text-white focus:border-cyan-500/50 outline-none transition-colors text-sm ${confirmPw && confirmPw !== newPw ? "border-red-500/50" : "border-white/10"
                                    }`}
                            />
                        </div>
                        {confirmPw && confirmPw !== newPw && (
                            <p className="text-red-400 text-[10px] pl-1">Passwords do not match</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || (confirmPw.length > 0 && newPw !== confirmPw)}
                        className="w-full py-3.5 bg-white hover:bg-cyan-400 text-black font-bold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 mt-2"
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>

            {/* Session Management Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/10">
                        <LogOut className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Session Management</h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Terminate all active sessions</p>
                    </div>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed">
                    Signs out of all active admin sessions on all devices. You will need to log in again after this.
                </p>
                <button
                    onClick={handleTerminateAll}
                    className="w-full py-3.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white font-bold rounded-xl text-sm transition-all active:scale-95"
                >
                    Terminate All Sessions
                </button>
            </div>
        </div>
    );
}
