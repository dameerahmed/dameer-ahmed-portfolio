"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface JourneyItem {
    year: string;
    milestone_title: string;
    description: string;
}

export default function JourneySection({ journey }: { journey: JourneyItem[] }) {
    const [selectedItem, setSelectedItem] = useState<JourneyItem | null>(null);

    return (
        <section>
            <div className="relative border-l border-white/5 ml-4 space-y-8 pb-4">
                {journey.map((item, idx) => {
                    const isLong = item.description.length > 180;
                    return (
                        <div key={idx} className="relative pl-10 group">
                            <div className="absolute -left-[5.5px] top-6 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10" />
                            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 group-hover:border-white/20 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.3em]">
                                        {item.year}
                                    </span>
                                    <h3 className="text-xl text-white font-bold tracking-tight">{item.milestone_title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed font-medium line-clamp-3">
                                        {item.description}
                                    </p>
                                    {isLong && (
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="pt-2 text-[10px] text-cyan-500 font-bold uppercase tracking-[0.3em] flex items-center gap-2 hover:text-cyan-400 transition-colors cursor-pointer group/btn"
                                        >
                                            Expand Milestone <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/5 px-4 py-1.5 rounded-full mb-6 inline-block tracking-widest border border-cyan-400/10">
                                {selectedItem.year}
                            </span>
                            <h2 className="text-3xl text-white mb-8 font-bold leading-tight">{selectedItem.milestone_title}</h2>
                            <div className="overflow-y-auto max-h-[50vh] pr-4 custom-scrollbar">
                                <p className="text-slate-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                    {selectedItem.description}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
