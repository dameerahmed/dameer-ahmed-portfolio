"use client";

import { useState } from "react";
import { ExternalLink, Github, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectCard({ project }: { project: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isVideo = project.video_url?.match(/\.(mp4|webm|ogg|mov)$|^.*cloudinary.*\/video\/upload\/.*$/i);

    return (
        <div className="group relative bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden hover:scale-[1.02] hover:border-cyan-500/30 transition-all duration-500 flex flex-col h-full transform-gpu shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            {/* Media Container */}
            <div
                className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer group/media"
                onClick={() => setIsExpanded(true)}
            >
                {project.video_url ? (
                    isVideo ? (
                        <video
                            src={project.video_url}
                            className="w-full h-full object-cover opacity-60 group-hover/media:opacity-100 transition-opacity duration-700"
                            muted
                            playsInline
                            loop
                            onMouseOver={(e) => e.currentTarget.play()}
                            onMouseOut={(e) => e.currentTarget.pause()}
                        />
                    ) : (
                        <img
                            src={project.video_url}
                            alt={project.title}
                            className="w-full h-full object-cover opacity-60 group-hover/media:opacity-100 transition-all duration-700 group-hover/media:scale-110"
                        />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-900 bg-zinc-950 font-black italic uppercase tracking-widest text-[10px]">
                        No Stream
                    </div>
                )}

                {/* Zoom Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-500 bg-black/40 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-black shadow-[0_0_30px_rgba(0,243,255,0.5)] transform scale-50 group-hover/media:scale-100 transition-transform duration-500">
                        <Maximize2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
            </div>

            {/* Content Container */}
            <div className="p-6 flex flex-col flex-grow relative z-10 -mt-8">
                <h3 className="text-white text-lg mb-2 group-hover:text-cyan-400 transition-colors duration-300 font-bold uppercase tracking-tight leading-tight">{project.title}</h3>
                <p className="text-slate-400 text-xs mb-5 flex-grow line-clamp-3 leading-relaxed font-medium">
                    {project.description}
                </p>

                {/* Tags */}
                {project.tech_tags && (
                    <div className="flex flex-wrap gap-2.5 mb-8">
                        {project.tech_tags.split(',').map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 rounded-full">
                                {tag.trim()}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer Links */}
                <div className="flex items-center gap-6 mt-auto pt-6 border-t border-white/5">
                    {project.github_link && (
                        <a
                            href={project.github_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] italic"
                        >
                            <Github className="w-4 h-4" /> Source Code
                        </a>
                    )}
                    <div className="ml-auto">
                        <button className="text-cyan-500 hover:text-cyan-400 transition-all flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 duration-500 italic">
                            Live Demo <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* FULLSCREEN LIGHTBOX MODAL */}
            <AnimatePresence>
                {isExpanded && project.video_url && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10"
                        onClick={() => setIsExpanded(false)}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 p-3 bg-zinc-900/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 rounded-full transition-all border border-zinc-800"
                            onClick={() => setIsExpanded(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.1)] border border-zinc-800"
                            onClick={(e) => e.stopPropagation()} // Prevent click-through closing
                        >
                            {isVideo ? (
                                <video
                                    src={project.video_url}
                                    className="w-full h-full object-contain"
                                    autoPlay
                                    controls
                                    playsInline
                                    loop
                                    preload="auto"
                                />
                            ) : (
                                <img
                                    src={project.video_url}
                                    alt={project.title}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
