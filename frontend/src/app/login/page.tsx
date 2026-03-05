"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, ArrowRight, User, KeyRound } from "lucide-react";
import { getDeviceId } from "@/lib/utils";
import { API } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Password, 2: OTP
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        otp: "",
        secretCode: ""
    });
    const [showSecretField, setShowSecretField] = useState(false);

    const deviceId = getDeviceId();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const reason = params.get("reason");
        if (reason === "session_ended") {
            toast.error("Session terminated or expired. Please login again.", {
                id: "session-error" // Prevent duplicates
            });
            // Clean URL
            router.replace("/login");
        }
    }, [router]);

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                }),
            });

            const data = await res.json();
            if (res.ok && data.status === "otp_sent") {
                toast.success("Credentials verified! Check your email for OTP.");
                setStep(2);
            } else {
                toast.error(data.detail || "Invalid credentials");
            }
        } catch (err) {
            toast.error("Connection failed");
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    code: formData.otp,
                    device_id: deviceId,
                    secret_code: formData.secretCode || null
                }),
            });

            const data = await res.json();
            if (res.ok) {
                // Store token in localStorage as fallback for cross-site cookie blocks
                if (data.access_token) {
                    localStorage.setItem("admin_token", data.access_token);
                }
                toast.success("Access Granted. Welcome, Admin.");
                router.push("/admin/home");
            } else {
                toast.error(data.detail || "Invalid or expired OTP");
            }
        } catch (err) {
            toast.error("Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/10 blur-[150px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative"
            >
                {/* Decorative Elements */}
                <div className="absolute -top-10 -left-10 w-32 h-32 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 border-b-2 border-r-2 border-cyan-500/20 rounded-br-3xl pointer-events-none" />

                <div className="bg-[#0d0d15] border border-zinc-800 rounded-2xl p-8 shadow-2xl overflow-hidden">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-cyan-950/30 border border-cyan-500/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,243,255,0.1)]">
                            {step === 1 ? <Lock className="w-8 h-8 text-cyan-400" /> : <ShieldCheck className="w-8 h-8 text-cyan-400" />}
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {step === 1 ? "Secure Login" : "2-Factor Auth"}
                        </h1>
                        <p className="text-zinc-500 text-sm mt-2 font-mono uppercase tracking-widest">
                            {step === 1 ? "Admin Identification Required" : "Identity Verification"}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleCredentialsSubmit}
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] ml-1">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full bg-[#080810] border border-zinc-800 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-cyan-500/50 transition-all"
                                            placeholder="Admin access code"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] ml-1">Password</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-[#080810] border border-zinc-800 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-900/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? "Authorizing..." : "Initiate Access"}
                                    {!loading && <ArrowRight className="w-4 h-4" />}
                                </button>
                                <div className="text-center pt-2">
                                    <a
                                        href="/forgot-password"
                                        className="text-[10px] font-mono text-zinc-600 hover:text-cyan-400 transition-colors uppercase tracking-widest"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleOTPSubmit}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] ml-1 text-center block">Enter 6-Digit OTP</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                        className="w-full bg-[#080810] border border-cyan-500/30 rounded-2xl py-5 text-center text-4xl font-bold tracking-[0.5em] text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all shadow-[inset_0_0_15px_rgba(0,243,255,0.05)]"
                                        placeholder="000000"
                                        required
                                        autoFocus
                                    />
                                    <p className="text-[10px] text-zinc-600 font-mono text-center">Tied to Device ID: <span className="text-zinc-500">{deviceId.substring(0, 8)}...</span></p>
                                </div>

                                <div className="space-y-4">
                                    {!showSecretField ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowSecretField(true)}
                                            className="w-full py-2 text-[10px] font-mono text-zinc-600 hover:text-indigo-400 transition-colors uppercase tracking-widest border border-dashed border-zinc-800 rounded-lg"
                                        >
                                            + Add Master Secret Code (Optional)
                                        </button>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="space-y-2 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10"
                                        >
                                            <label className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.2em] ml-1">Master Secret Code</label>
                                            <input
                                                type="password"
                                                value={formData.secretCode}
                                                onChange={(e) => setFormData({ ...formData, secretCode: e.target.value.toUpperCase() })}
                                                className="w-full bg-[#080810] border border-indigo-500/30 rounded-lg py-2.5 px-3 text-white placeholder:text-zinc-800 focus:outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                                                placeholder="FOR SUPER-ADMIN ACCESS"
                                            />
                                            <p className="text-[9px] text-zinc-600 italic">Enter your secret key to gain full control over all devices.</p>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loading ? "Verifying..." : "Confirm Identity"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-[10px] font-mono text-zinc-600 hover:text-cyan-400 transition-colors uppercase tracking-widest text-center"
                                    >
                                        Return to login
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
