import { fetchProfile, fetchTechStack, fetchJourney, fetchServices, fetchEducation, fetchHobbies, fetchLanguages } from "@/lib/api";
import { Download, Code, Zap, Cpu, Settings, Database, Globe, Layers, Brain, Smartphone, Terminal, Shield, Cloud, Activity, Server, Layout, Mail, Phone, MapPin, ExternalLink, GraduationCap, Heart, Languages } from "lucide-react";
import JourneySection from "@/components/about/JourneySection";
import { M_Span, M_H1, M_Div } from "@/components/about/ClientMotion";

// Icon mapping helper
const IconMap: { [key: string]: any } = {
    Code, Zap, Cpu, Settings, Database, Globe, Layers, Brain, Smartphone, Terminal, Shield, Cloud, Activity, Server, Layout
};

export const metadata = {
    title: "Resume | Dameer Ahmed",
    description: "Dameer Ahmed's professional journey, expertise matrix, and structural bio-data.",
};

export default async function AboutPage() {
    const [profile, techStack, journey, services, education, hobbies, languages] = await Promise.all([
        fetchProfile().catch(() => ({ name: "Dameer Ahmed", bio: "AI Agent Developer" })),
        fetchTechStack().catch(() => []),
        fetchJourney().catch(() => []),
        fetchServices().catch(() => []),
        fetchEducation().catch(() => []),
        fetchHobbies().catch(() => []),
        fetchLanguages().catch(() => []),
    ]);

    return (
        <main className="min-h-screen bg-[#050505] relative overflow-hidden pb-40 text-zinc-300">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-7xl h-[80vh] bg-gradient-to-b from-cyan-500/10 to-transparent blur-[120px] opacity-20" />
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10 pt-32 lg:pt-48">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* ─── LEFT COLUMN (SPAN 4) ─────────────────────────────────── */}
                    <aside className="lg:col-span-4 space-y-12">
                        {/* Portrait Frame with Anti-Gravity Feel */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-cyan-500/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] group">
                                {profile?.profile_pic ? (
                                    <img
                                        src={profile.profile_pic}
                                        alt={profile.name}
                                        className="w-full h-full object-cover grayscale brightness-110 contrast-125 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                                        style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-800 text-6xl font-black italic">
                                        {profile?.name?.charAt(0) || "D"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact & Social Links */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-8">
                            <div className="space-y-6 text-sm">
                                <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.3em]">Contact</h3>
                                <div className="space-y-4">
                                    {profile?.email && (
                                        <a href={`mailto:${profile.email}`} className="flex items-center gap-4 text-slate-400 hover:text-cyan-400 transition-colors group">
                                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all">
                                                <Mail className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs font-medium truncate">{profile.email}</span>
                                        </a>
                                    )}
                                    {profile?.phone && (
                                        <a href={`tel:${profile.phone}`} className="flex items-center gap-4 text-slate-400 hover:text-cyan-400 transition-colors group">
                                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all">
                                                <Phone className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs font-medium tracking-wider">{profile.phone}</span>
                                        </a>
                                    )}
                                    {(profile?.city || profile?.country || profile?.address) && (
                                        <div className="flex items-center gap-4 text-slate-400 group cursor-default">
                                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 shrink-0">
                                                <MapPin className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                {profile?.address && <div className="text-xs font-medium">{profile.address}</div>}
                                                <span className="text-xs font-medium uppercase tracking-widest">
                                                    {[profile?.city, profile?.country].filter(Boolean).join(", ")}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex gap-3">
                                <a href="/contact" className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <a href="/contact" className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center hover:text-white hover:border-white/20 transition-all">
                                    Get In Touch
                                </a>
                            </div>
                        </div>


                        {/* Linguistic Matrix */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-8">
                            <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.3em]">Languages</h3>
                            <div className="space-y-6">
                                {languages.map((l: any, i: number) => (
                                    <div key={i} className="space-y-2.5">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{l.name}</span>
                                            <span className="text-[9px] font-bold text-cyan-500/80 uppercase">{l.level}</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <M_Div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${l.percentage}%` }}
                                                transition={{ duration: 1.5, delay: i * 0.1 }}
                                                className="h-full bg-cyan-500/50"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hobbies / Interests */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6">
                            <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.3em]">Hobbies & Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {hobbies.map((h: any, i: number) => (
                                    <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-white hover:border-white/20 transition-all cursor-default">
                                        {h.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ─── RIGHT COLUMN (SPAN 8) ────────────────────────────────── */}
                    <article className="lg:col-span-8 space-y-24">

                        {/* Header Section */}
                        <header className="space-y-8">
                            <div className="space-y-2">
                                <M_Span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.4em] block"
                                >
                                    About Me // 001
                                </M_Span>
                                <M_H1
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-5xl lg:text-7xl font-bold text-white tracking-tighter"
                                >
                                    {profile?.name || "Dameer Ahmed"}
                                </M_H1>
                                <p className="text-xl lg:text-2xl font-light text-slate-400 tracking-tight">
                                    {profile?.bio?.split('.')[0] || "AI Solutions Architect"}
                                </p>
                            </div>

                            <div className="max-w-3xl">
                                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.3em] block mb-4">Introduction</label>
                                <p className="text-sm lg:text-base text-slate-400 leading-relaxed font-medium italic">
                                    "{profile?.bio || "I build intelligent systems and autonomous agents. Focusing on the intersection of human-computer interaction and artificial intelligence."}"
                                </p>
                            </div>
                        </header>

                        {/* 01 // Expertise Matrix (Slim Bars) */}
                        <section className="space-y-10 group">
                            <div className="flex items-center gap-6">
                                <h2 className="text-4xl font-bold text-white tracking-tighter">My Skills</h2>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                {techStack.map((tech: any, idx: number) => {
                                    const Icon = IconMap[tech.icon_name || "Code"] || Code;
                                    return (
                                        <div key={idx} className="space-y-3 group/item">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-cyan-500/50 group-hover/item:text-cyan-400 group-hover/item:border-cyan-400/30 transition-all duration-300">
                                                        <Icon className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">{tech.name}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-500">{tech.percentage || 85}% Mastery</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full relative overflow-hidden">
                                                <M_Div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${tech.percentage || 85}%` }}
                                                    transition={{ duration: 1, delay: idx * 0.05 }}
                                                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-cyan-500/60"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 02 // Career Timeline */}
                        <section className="space-y-12">
                            <div className="flex items-center gap-6">
                                <h2 className="text-4xl font-bold text-white tracking-tighter">My Experience</h2>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-1 lg:p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                                <JourneySection journey={journey} />
                            </div>
                        </section>

                        {/* 03 // Academic Framework */}
                        <section className="space-y-12">
                            <div className="flex items-center gap-6">
                                <h2 className="text-4xl font-bold text-white tracking-tighter">Education</h2>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {education.map((edu: any, i: number) => (
                                    <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6 hover:border-white/20 transition-all group">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.4em]">{edu.year}</span>
                                            <h3 className="text-xl text-white font-bold tracking-tight leading-tight">{edu.degree}</h3>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{edu.institution}</p>
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                            {edu.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* CV Interaction */}
                        {profile?.resume_pdf_url && (
                            <footer className="pt-12">
                                <a
                                    href={profile.resume_pdf_url}
                                    target="_blank"
                                    className="group relative inline-flex items-center gap-4 px-10 py-5 bg-white text-black font-bold rounded-2xl hover:bg-cyan-400 transition-all duration-300"
                                >
                                    <Download className="w-5 h-5" />
                                    <span className="text-xs uppercase tracking-[0.2em]">Acquire Full Dossier (CV)</span>
                                    <div className="absolute -inset-1 bg-cyan-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
                                </a>
                            </footer>
                        )}
                    </article>
                </div>
            </div>

            {/* Signature Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-20" />
        </main>
    );
}
