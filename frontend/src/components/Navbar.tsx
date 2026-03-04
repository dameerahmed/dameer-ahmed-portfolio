"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "Resume" },
    { href: "/services", label: "Services" },
    { href: "/projects", label: "Portfolio" },
    { href: "/contact", label: "Contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Ghost Trigger Logic
    const pressTimer = useRef<NodeJS.Timeout | null>(null);
    const [isPressing, setIsPressing] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handlePressStart = () => {
        setIsPressing(true);
        pressTimer.current = setTimeout(() => {
            router.push("/admin/home");
        }, 3000); // 3 seconds for ghost trigger
    };

    const handlePressEnd = () => {
        setIsPressing(false);
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    return (
        <>
            <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 flex items-center justify-between px-6 md:px-10 w-[95%] max-w-5xl h-16 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>

                {/* Branding */}
                <div
                    onMouseDown={handlePressStart}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                    className="cursor-pointer select-none group"
                >
                    <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter text-white transition-all group-active:scale-95 flex items-center gap-1">
                        DAMEER<span className="text-cyan-500">.</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-12">
                    {navLinks.map(({ href, label }) => {
                        const isActive = pathname === href;
                        return (
                            <div key={href} className="relative group">
                                <Link
                                    href={href}
                                    className={`text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:text-cyan-400 ${isActive ? "text-cyan-400" : "text-white/60"
                                        }`}
                                >
                                    {label}
                                </Link>
                                {/* Active Underglow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-active"
                                        className="absolute -bottom-2 left-0 right-0 h-[2px] bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                <button
                    className="md:hidden text-white p-2 hover:bg-white/5 rounded-xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu className="w-8 h-8" />
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed top-0 right-0 bottom-0 w-64 bg-[#0a0a0a] border-l border-white/10 z-[110] flex flex-col p-8 shadow-2xl md:hidden"
                        >
                            <div className="flex justify-end mb-12">
                                <button
                                    className="p-2 hover:bg-white/5 rounded-xl text-zinc-400"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex flex-col gap-6">
                                {navLinks.map(({ href, label }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`text-lg font-bold uppercase tracking-widest transition-colors ${pathname === href ? "text-cyan-400" : "text-zinc-400 hover:text-white"
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
