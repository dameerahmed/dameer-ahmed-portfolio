"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Zap, MessageSquare, Briefcase, Cpu,
    Globe, Shield, ArrowUpRight, Plus,
    Activity, Database, Terminal
} from "lucide-react";
import { useRouter } from "next/navigation";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: any;
    trend?: string;
    color: string;
}

const StatCard = ({ title, value, icon: Icon, trend, color }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] hover:border-cyan-500/30 transition-all group overflow-hidden relative"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity bg-${color}-500`} />

        <div className="flex justify-between items-start relative z-10">
            <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{trend}</span>
            )}
        </div>

        <div className="mt-6 relative z-10">
            <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{title}</h4>
            <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
        </div>
    </motion.div>
);

export default function Dashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ messages: 0, projects: 0, experience: "3+ Yrs" });
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Simulated live Logs
        const logMessages = [
            "Initializing Admin Core...",
            "Syncing with Neural API...",
            "Encrypting session data...",
            "Uplink established.",
            "Monitoring mission status...",
            "Optimizing cloud radius...",
            "Scanning for inquiries...",
        ];

        let i = 0;
        const interval = setInterval(() => {
            setLogs(prev => [logMessages[i % logMessages.length], ...prev.slice(0, 4)]);
            i++;
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-10">
            {/* Mission Overview Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight italic">COMMAND<span className="text-cyan-500">_CENTRE</span></h1>
                    <p className="text-zinc-500 text-xs font-medium mt-2">Operational overview and system telemetry.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => router.push('/admin/messages')} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                        <Terminal className="w-3 h-3 text-cyan-500" /> Neural Logs
                    </button>
                    <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                        <Activity className="w-3 h-3 animate-pulse" /> Live System
                    </div>
                </div>
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Neural Inquiries"
                    value="12"
                    icon={MessageSquare}
                    trend="Active"
                    color="cyan"
                />
                <StatCard
                    title="Mission Projects"
                    value="08"
                    icon={Briefcase}
                    trend="Stable"
                    color="purple"
                />
                <StatCard
                    title="Tech Velocity"
                    value="99%"
                    icon={Zap}
                    trend="Peak"
                    color="yellow"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Status Block */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                            <Cpu className="w-6 h-6 text-zinc-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white tracking-widest italic uppercase">Core Health</h3>
                            <p className="text-[10px] text-zinc-600 font-mono">NODE_DAMEER_V4.0</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <Database className="w-4 h-4 text-cyan-500" />
                                <span className="text-xs font-bold text-zinc-300">Neural Connect</span>
                            </div>
                            <span className="text-[10px] font-mono text-cyan-400 uppercase">Operational</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-bold text-zinc-300">Admin Security</span>
                            </div>
                            <span className="text-[10px] font-mono text-green-400 uppercase">High Shield</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-purple-500" />
                                <span className="text-xs font-bold text-zinc-300">Edge Broadcast</span>
                            </div>
                            <span className="text-[10px] font-mono text-purple-400 uppercase">Latency 2ms</span>
                        </div>
                    </div>
                </div>

                {/* Console Output Block */}
                <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-2xl overflow-hidden relative">
                    <div className="flex flex-col gap-1 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="ml-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Neural_Terminal</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 font-mono">
                        {logs.map((log, i) => (
                            <motion.div
                                key={log + i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1 - i * 0.2, x: 0 }}
                                className="flex gap-4 text-[11px]"
                            >
                                <span className="text-cyan-500/50">[{new Date().toLocaleTimeString()}]</span>
                                <span className="text-zinc-400">{log}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                        <button
                            onClick={() => router.push('/admin/about')}
                            className="bg-cyan-500 text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95 flex items-center gap-2"
                        >
                            Sync Branding <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
