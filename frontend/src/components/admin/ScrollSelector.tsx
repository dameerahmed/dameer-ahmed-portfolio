"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check, LucideIcon } from "lucide-react";

interface Option {
    label: string;
    value: string;
    icon?: LucideIcon;
}

interface ScrollSelectorProps {
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder?: string;
    iconMap?: { [key: string]: LucideIcon };
}

export default function ScrollSelector({ label, value, options, onChange, placeholder = "Select...", iconMap }: ScrollSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        opt.value.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="flex flex-col gap-2 relative" ref={containerRef}>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">{label}</label>

            <button
                type="button"
                onClick={toggleOpen}
                className={`flex items-center justify-between w-full bg-zinc-950 border rounded-xl px-5 py-3.5 text-sm transition-all text-left ${isOpen ? "border-cyan-500/50 ring-4 ring-cyan-500/5" : "border-white/5 hover:border-white/10"
                    }`}
            >
                <div className="flex items-center gap-3">
                    {selectedOption && iconMap && selectedOption.value && iconMap[selectedOption.value] && (
                        <div className="text-cyan-500">
                            {React.createElement(iconMap[selectedOption.value], { size: 16 })}
                        </div>
                    )}
                    <span className={selectedOption ? "text-zinc-200" : "text-zinc-600"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 z-50 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl"
                    >
                        {/* Search Bar */}
                        <div className="p-3 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full bg-zinc-900/50 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/30 font-medium"
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-2">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => {
                                    const isSelected = opt.value === value;
                                    const Icon = iconMap ? iconMap[opt.value] : null;

                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                onChange(opt.value);
                                                setIsOpen(false);
                                                setSearch("");
                                            }}
                                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left text-xs transition-all mb-1 group ${isSelected ? "bg-cyan-500 text-black font-bold" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {Icon && (
                                                    <Icon className={`w-4 h-4 ${isSelected ? "text-black" : "text-cyan-500/50 group-hover:text-cyan-400"}`} />
                                                )}
                                                <span>{opt.label}</span>
                                            </div>
                                            {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                                    No results found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
