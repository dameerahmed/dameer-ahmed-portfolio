"use client";

import React from "react";
import { motion } from "framer-motion";

export function AdminSection({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 md:mb-10">
                <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase italic text-white/90">{title}</h1>
                <div className="w-12 md:w-8 h-[2px] bg-cyan-500 mt-2 rounded-full opacity-60" />
                <p className="text-zinc-600 text-[8px] md:text-[9px] font-medium mt-3 uppercase tracking-[0.4em] leading-relaxed">{sub}</p>
            </div>
            {children}
        </motion.div>
    );
}

export function AdminField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
    return (
        <div className="flex flex-col gap-1.5 md:gap-2">
            <label className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest pl-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-cyan-500/30 text-zinc-300 text-[11px] md:text-xs font-medium transition-all placeholder:text-zinc-800"
            />
        </div>
    );
}

export function AdminEmpty({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <div className="text-center py-20 text-zinc-900 border border-dashed border-zinc-900/50 rounded-[2.5rem]">
            <Icon className="w-10 h-10 mx-auto mb-4 opacity-5" />
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-800">{label}</p>
        </div>
    );
}
