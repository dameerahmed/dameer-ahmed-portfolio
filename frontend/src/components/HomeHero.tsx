"use client";

import { motion, useAnimationControls } from "framer-motion";
import { Github, ExternalLink, ArrowRight, Twitter, Linkedin, Mail, Code, Zap, Cpu, Settings, Database, Globe, Layers, Brain, Smartphone, Terminal, Shield, Cloud, Activity, Server, Layout } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

// Icon Map for Tech Stack
const IconMap: { [key: string]: any } = {
    Code, Zap, Cpu, Settings, Database, Globe, Layers, Brain, Smartphone, Terminal, Shield, Cloud, Activity, Server, Layout
};

interface HomeHeroProps {
    initialContent: {
        hero_title: string;
        typing_tags: string[];
        hero_description: string;
    };
    techStack: { name: string; years_of_experience: number; icon_name?: string }[];
    portraitUrl?: string;
    socialLinks?: { github?: string; twitter?: string; linkedin?: string };
}

export default function HomeHero({ initialContent, techStack, portraitUrl, socialLinks }: HomeHeroProps) {
    const { hero_title, typing_tags, hero_description } = initialContent;
    const [roleIndex, setRoleIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [cacheBuster, setCacheBuster] = useState("");
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        setCacheBuster(`?v=${Date.now()}`);
    }, [portraitUrl]);

    useEffect(() => {
        if (!typing_tags || typing_tags.length === 0) return;
        const currentRole = typing_tags[roleIndex];
        let timeout: NodeJS.Timeout;

        if (!isDeleting && displayText === currentRole) {
            timeout = setTimeout(() => setIsDeleting(true), 2500);
        } else if (isDeleting && displayText === "") {
            setIsDeleting(false);
            setRoleIndex((prev) => (prev + 1) % typing_tags.length);
        } else {
            timeout = setTimeout(() => {
                setDisplayText(prev =>
                    isDeleting ? prev.slice(0, -1) : currentRole.slice(0, prev.length + 1)
                );
            }, isDeleting ? 40 : 80);
        }
        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, roleIndex, typing_tags]);

    const transformedPortraitUrl = portraitUrl ? `${portraitUrl}${cacheBuster}` : undefined;

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const moveX = (clientX - window.innerWidth / 2) * 0.01;
        const moveY = (clientY - window.innerHeight / 2) * 0.01;
        setMousePos({ x: moveX, y: moveY });
    };

    // 3D Orbital Logic
    const [winWidth, setWinWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWinWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const orbitalLayers = useMemo(() => {
        const isMobile = winWidth < 768;
        const outerRadius = isMobile ? 180 : 360;
        const innerRadius = isMobile ? 130 : 260;

        const items = techStack.slice(0, 15);
        const layers = [
            { radius: innerRadius, speed: 50, tilt: 15, items: items.slice(0, 6) },
            { radius: outerRadius, speed: 75, tilt: -10, items: items.slice(6, 15) }
        ];

        return layers.map((layer, lIdx) => ({
            ...layer,
            items: layer.items.map((tech, iIdx) => {
                const Icon = IconMap[tech.icon_name || "Code"] || Code;
                return { ...tech, Icon, index: iIdx, total: layer.items.length, layerIndex: lIdx };
            })
        }));
    }, [techStack, winWidth]);

    return (
        <section
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#030303]"
            style={{ perspective: "1500px" }}
        >
            {/* Animated Mesh Gradient Background layer */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-cyan-500/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20 min-h-screen py-16 lg:py-0 relative z-10">

                {/* 1. Portrait & 3D Orbital Cloud - Placed first for mobile top-stacking */}
                <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center order-first lg:order-last">
                    {/* Backdrop Aura Glow */}
                    <div className="absolute inset-0 bg-cyan-500/15 blur-3xl rounded-full -z-10 animate-pulse scale-110" />

                    {/* Perspective-Tilted Matrix */}
                    <motion.div
                        style={{
                            rotateX: mousePos.y * 2,
                            rotateY: -mousePos.x * 2,
                            transformStyle: "preserve-3d"
                        }}
                        className="absolute inset-0 flex items-center justify-center p-8"
                    >
                        {orbitalLayers.map((layer, lIdx) => (
                            <motion.div
                                key={lIdx}
                                animate={{ rotate: isPaused ? 0 : 360 }}
                                transition={{ duration: layer.speed, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    transformStyle: "preserve-3d",
                                    rotateX: layer.tilt
                                }}
                            >
                                {layer.items.map((item, idx) => {
                                    const angle = (idx / item.total) * (2 * Math.PI);
                                    const x = Math.cos(angle) * layer.radius;
                                    const z = Math.sin(angle) * layer.radius;
                                    const depthFactor = (z + layer.radius) / (layer.radius * 2);

                                    return (
                                        <motion.div
                                            key={`${lIdx}-${item.name}`}
                                            style={{
                                                position: 'absolute',
                                                left: '50%',
                                                top: '50%',
                                                x: x,
                                                z: z,
                                                y: Math.sin(angle * 2 + lIdx) * 40,
                                                marginLeft: -40,
                                                marginTop: -40,
                                                transformStyle: "preserve-3d"
                                            }}
                                            animate={{ rotate: isPaused ? 0 : -360 }}
                                            transition={{ duration: layer.speed, repeat: Infinity, ease: "linear" }}
                                            className="pointer-events-auto"
                                        >
                                            <motion.div
                                                className="group relative flex flex-col items-center gap-2"
                                                onMouseEnter={() => setIsPaused(true)}
                                                onMouseLeave={() => setIsPaused(false)}
                                                style={{
                                                    opacity: 0.15 + (depthFactor * 0.85),
                                                    scale: 0.6 + (depthFactor * 0.7),
                                                }}
                                            >
                                                <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-black/40 backdrop-blur-2xl border border-white/5 rounded-full transition-all duration-300 group-hover:border-cyan-500 group-hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                                                    style={{
                                                        boxShadow: depthFactor > 0.8 ? `0 0 ${20 * depthFactor}px rgba(0, 243, 255, ${0.2 * depthFactor})` : 'none'
                                                    }}>
                                                    <item.Icon className="w-6 h-6 text-white/60 group-hover:text-cyan-400 transition-colors" />
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/90 border border-white/5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-cyan-400 shadow-xl">
                                                    {item.name}
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Portrait Image (Circle Removed) */}
                    <motion.div
                        animate={{ x: mousePos.x * 2, y: mousePos.y * 2 }}
                        className="relative w-64 h-64 md:w-full md:h-full max-w-[420px] max-h-[420px] z-20 pointer-events-none flex items-end justify-center"
                    >
                        <div className="w-full h-full relative z-10">
                            {transformedPortraitUrl ? (
                                <img
                                    src={transformedPortraitUrl}
                                    alt="Dameer Ahmed"
                                    className="w-full h-full object-cover object-top brightness-110 grayscale hover:grayscale-0 transition-all duration-1000"
                                    style={{
                                        WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
                                        maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)"
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-zinc-800 text-6xl font-black italic">DA</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* 2. Text Content - Centered */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-12 z-40 relative">

                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-4"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-zinc-500 opacity-30 text-[10px] tracking-[0.4em] uppercase mb-2">Signature</span>
                            <h1 className="text-3xl md:text-6xl font-black text-white leading-[1.1] tracking-tight uppercase">
                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 inline-block">{hero_title}</span>
                            </h1>
                        </div>

                        <div className="text-sm md:text-base font-black italic text-cyan-400 uppercase tracking-[0.3em] flex items-center justify-center lg:justify-start gap-3 h-10">
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,243,255,1)] animate-pulse" />
                            <span className="font-mono">{displayText}</span>
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="w-[1px] h-6 bg-cyan-400"
                            />
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-sm md:text-base text-slate-400 leading-relaxed font-medium max-w-xl"
                    >
                        {hero_description}
                    </motion.p>

                    <div className="flex flex-col items-center gap-8 w-full pb-8 pt-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="flex flex-wrap justify-center gap-5"
                        >
                            <Link
                                href="/projects"
                                className="group relative px-8 py-3.5 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:-translate-y-1 active:scale-95"
                            >
                                Signature Works
                                <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={12} />
                            </Link>

                            <Link
                                href="/contact"
                                className="group relative px-8 py-3.5 bg-transparent border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-full shadow-2xl transition-all duration-300 hover:bg-white/5 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:-translate-y-1 active:scale-95"
                            >
                                Let's Talk
                            </Link>

                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="flex justify-center gap-4 mt-2"
                        >
                            {[
                                { Icon: Github, href: "https://github.com/dameerahmed" },
                                { Icon: Linkedin, href: "https://www.linkedin.com/in/dameer-ahmed-ghouri-73045131a/" },
                                { Icon: Mail, href: "https://mail.google.com/mail/?view=cm&fs=1&to=dameerahmedghouri05@gmail.com" }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    className={`group relative w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-center text-zinc-400 transition-all duration-500 hover:bg-cyan-400/10 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:text-cyan-400 hover:-translate-y-2 active:scale-90`}
                                >
                                    <social.Icon
                                        size={18}
                                        strokeWidth={1.5}
                                        className={`transition-all duration-500 group-hover:scale-110`}
                                    />
                                </a>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Mask */}
            <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none h-40 bg-gradient-to-t from-[#030303] to-transparent" />


            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 opacity-20"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
            </motion.div>
        </section >
    );
}

// Add these to globals.css if not already there
/*
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  display: flex;
  width: max-content;
  animation: marquee 30s linear infinite;
}
*/
