"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"request" | "reset" | "done">("request");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${API}/admin/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("OTP sent to your admin email!");
                setStep("reset");
            } else {
                toast.error(data.detail || "Failed to send reset email");
            }
        } catch {
            toast.error("Server unreachable. Check that the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
        if (newPassword.length < 8) { toast.error("Min. 8 characters required"); return; }
        setIsLoading(true);
        try {
            const res = await fetch(`${API}/admin/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp_code: otp, new_password: newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setStep("done");
            } else {
                toast.error(data.detail || "Invalid or expired OTP");
            }
        } catch {
            toast.error("Request failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#080810] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <button
                    onClick={() => router.push("/login")}
                    className="flex items-center gap-2 text-zinc-600 hover:text-zinc-300 text-xs uppercase tracking-widest font-bold mb-10 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>

                <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-10 shadow-2xl">
                    {step === "done" ? (
                        <div className="text-center space-y-6 py-6">
                            <div className="flex justify-center">
                                <CheckCircle2 className="w-16 h-16 text-cyan-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Password Updated!</h1>
                            <p className="text-zinc-500 text-sm">Your admin password has been changed. You can now log in with your new password.</p>
                            <button
                                onClick={() => router.push("/login")}
                                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-sm transition-all active:scale-95"
                            >
                                Go to Login
                            </button>
                        </div>
                    ) : step === "request" ? (
                        <form onSubmit={handleRequest} className="space-y-8">
                            <div className="space-y-2">
                                <div className="p-3 rounded-2xl bg-cyan-500/10 w-fit mb-6">
                                    <Mail className="w-7 h-7 text-cyan-500" />
                                </div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    A one-time code will be sent to your registered admin email address.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-white hover:bg-cyan-400 text-black font-bold rounded-2xl text-sm transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                            >
                                {isLoading ? "Sending OTP..." : "Send Reset Code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-6">
                            <div className="space-y-2">
                                <div className="p-3 rounded-2xl bg-cyan-500/10 w-fit mb-6">
                                    <KeyRound className="w-7 h-7 text-cyan-500" />
                                </div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">Enter New Password</h1>
                                <p className="text-zinc-500 text-sm">Check your email for the 6-digit code.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] pl-1">OTP from Email</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="6-digit code"
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-white text-lg font-mono tracking-[0.5em] text-center focus:border-cyan-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] pl-1">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                            placeholder="Min. 8 characters" required
                                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-5 py-3.5 text-white focus:border-cyan-500/50 outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] pl-1">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat password" required
                                            className={`w-full bg-black/50 border rounded-xl pl-12 pr-5 py-3.5 text-white focus:border-cyan-500/50 outline-none transition-colors ${confirmPassword && confirmPassword !== newPassword ? "border-red-500/50" : "border-white/10"
                                                }`}
                                        />
                                    </div>
                                    {confirmPassword && confirmPassword !== newPassword && (
                                        <p className="text-red-400 text-[10px] pl-1">Passwords do not match</p>
                                    )}
                                </div>
                            </div>
                            <button type="submit"
                                disabled={isLoading || (confirmPassword.length > 0 && newPassword !== confirmPassword)}
                                className="w-full py-4 bg-white hover:bg-cyan-400 text-black font-bold rounded-2xl text-sm transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                            >
                                {isLoading ? "Setting Password..." : "Set New Password"}
                            </button>
                            <button type="button" onClick={() => setStep("request")} className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                                Didn't receive the code? Send again
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
