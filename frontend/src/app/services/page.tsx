"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Code, Cpu, Settings, Database, Globe, Layers, Brain, Smartphone, Terminal, Shield, Cloud, Activity, Server, Layout } from "lucide-react";

import { API } from "@/lib/api";

const IconMap: { [key: string]: any } = {
    Code, Zap, Cpu, Settings, Database, Globe, Layers, Brain, Smartphone, Terminal, Shield, Cloud, Activity, Server, Layout
};

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/services`)
            .then(res => res.json())
            .then(data => {
                setServices(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <main className="min-h-screen section-padding bg-[#050505] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-900/5 blur-[120px] pointer-events-none" />

            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <p className="text-cyan-400 text-xs font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <span className="w-12 h-0.5 bg-cyan-500 rounded-full" /> Service Matrix
                    </p>
                    <h1 className="text-white">
                        Professional <span className="text-cyan-500">Offerings</span>
                    </h1>
                </motion.div>

                {/* Floating Glass Card Wrapper */}
                <div className="bg-black/20 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-8 md:p-12 mb-24">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64 animate-pulse" />
                            ))}
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">No active deployments found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service, i) => {
                                const SvgIcon = IconMap[service.icon_name || "Zap"] || Zap;

                                return (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group p-6 relative overflow-hidden bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all duration-500 min-h-[16rem] flex flex-col"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-cyan-400 mb-6 border border-white/10 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                                <SvgIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <h3 className="text-white text-lg mb-3 group-hover:text-cyan-400 transition-all duration-300 font-bold uppercase tracking-tight">{service.title}</h3>
                                            <p className="text-slate-400 text-xs leading-relaxed font-medium line-clamp-4">
                                                {service.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
