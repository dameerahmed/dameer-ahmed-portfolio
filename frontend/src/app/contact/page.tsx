"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Github, Linkedin, Twitter, Facebook, Link as LinkIcon, Phone, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { getContactIcon } from "@/lib/utils";

import { API } from "@/lib/api";

type SocialLink = { id: number, platform: string, url: string };
type Profile = { name: string, bio: string, email?: string, phone?: string, address?: string, city?: string, country?: string };

const getSocialIcon = (url: string) => {
    const l = url.toLowerCase();
    if (l.includes("github.com")) return <Github className="w-5 h-5" />;
    if (l.includes("linkedin.com")) return <Linkedin className="w-5 h-5" />;
    if (l.includes("twitter.com") || l.includes("x.com")) return <Twitter className="w-5 h-5" />;
    if (l.includes("facebook.com")) return <Facebook className="w-5 h-5" />;
    if (l.includes("mailto:") || l.includes("gmail.com")) return <Mail className="w-5 h-5" />;
    return <LinkIcon className="w-5 h-5" />;
};


export default function ContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [socials, setSocials] = useState<any[]>([]);
    const [emails, setEmails] = useState<any[]>([]);
    const [phones, setPhones] = useState<any[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        // Fetch Socials
        fetch(`${API}/socials`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setSocials(data); })
            .catch(console.error);

        // Fetch Emails
        fetch(`${API}/contact/emails`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setEmails(data); })
            .catch(console.error);

        // Fetch Phones
        fetch(`${API}/contact/phones`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setPhones(data); })
            .catch(console.error);

        // Fetch Profile for name/bio
        fetch(`${API}/profile`)
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error("Please fill in all fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Message sent successfully!");
            setName(""); setEmail(""); setMessage("");
        } catch {
            toast.error("Failed to send message. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen py-20 px-6 bg-[#080808] relative">
            {/* Minimalist Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-900/5 blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
                    <p className="text-cyan-400 text-xs font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <span className="w-12 h-[2px] bg-cyan-500 rounded-full" /> Connection Hub
                    </p>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">
                        Let's <span className="text-cyan-500">Collaborate</span>
                    </h1>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Info Column */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-12">

                        {/* Grouped Contacts */}
                        <div className="space-y-4">
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest px-2 mb-4">Direct Communication Nodes</p>

                            {emails.map((e) => (
                                <div key={e.id}
                                    className="group flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-2xl md:rounded-[30px] bg-zinc-900/20 border border-zinc-900/50 hover:border-cyan-500/30 transition-all cursor-pointer"
                                    onClick={() => {
                                        if (e.email.toLowerCase().includes('gmail.com')) {
                                            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${e.email}`, '_blank');
                                        } else {
                                            window.location.href = `mailto:${e.email}`;
                                        }
                                    }}
                                >
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all overflow-hidden p-2.5 md:p-3 underline-offset-4 decoration-current">
                                        {getContactIcon(e.label || "") ?
                                            <img src={getContactIcon(e.label || "")!} alt="" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} /> :
                                            <Mail className="w-6 h-6" />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1 leading-none">{e.label || "Email Node"}</p>
                                        <p className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors tracking-tight">{e.email}</p>
                                    </div>
                                </div>
                            ))}

                            {phones.map((p) => (
                                <div key={p.id}
                                    className="group flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-2xl md:rounded-[30px] bg-zinc-900/20 border border-zinc-900/50 hover:border-emerald-500/30 transition-all cursor-pointer"
                                    onClick={() => window.location.href = `tel:${p.number}`}
                                >
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all overflow-hidden p-2.5 md:p-3">
                                        {getContactIcon(p.label || "") ?
                                            <img src={getContactIcon(p.label || "")!} alt="" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} /> :
                                            <Phone className="w-5 h-5 md:w-6 md:h-6" />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-[7px] md:text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1 leading-none">{p.label || "Call Node"}</p>
                                        <p className="text-base md:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">{p.number}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Location Section */}
                        {(profile?.address || profile?.city || profile?.country) && (
                            <div className="space-y-4">
                                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest px-2 mb-4">Location</p>
                                <div className="group flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-2xl md:rounded-[30px] bg-zinc-900/20 border border-zinc-900/50 hover:border-purple-500/30 transition-all">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all shrink-0">
                                        <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1 leading-none">Physical Location</p>
                                        {profile?.address && <p className="text-sm font-medium text-zinc-300">{profile.address}</p>}
                                        <p className="text-lg font-bold text-white tracking-tight">
                                            {[profile?.city, profile?.country].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {socials.length > 0 && (
                            <div className="space-y-6">
                                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest px-2">Global Presence Validators</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {socials.map((link) => (
                                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                                            className="group relative p-4 rounded-3xl bg-zinc-900/20 border border-zinc-900/50 flex flex-col items-center gap-3 hover:border-white/10 transition-all hover:bg-white/5">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-2.5 relative group-hover:border-cyan-500/50 group-hover:bg-cyan-500/5 transition-all">
                                                {(link.logo_url || getContactIcon(link.platform_name, link.url)) ? (
                                                    <img src={getContactIcon(link.platform_name, link.url) || link.logo_url} alt="" className="w-full h-full object-contain transition-transform group-hover:scale-110" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                ) : (
                                                    <LinkIcon className="w-5 h-5 text-zinc-600 group-hover:text-white" />
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    {!(link.logo_url || getContactIcon(link.platform_name, link.url)) && <LinkIcon className="w-4 h-4 text-cyan-400" />}
                                                </div>
                                                {/* Decorative Glow */}
                                                {(link.logo_url || getContactIcon(link.platform_name, link.url)) && <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none mb-1 group-hover:text-zinc-400 transition-colors">{link.platform || "Official"}</p>
                                                <p className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors truncate max-w-[100px]">{link.platform_name || "Profile"}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Form Column */}
                    <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} onSubmit={handleSubmit}
                        className="relative p-10 rounded-[45px] bg-[#0A0A0E] border border-zinc-900 flex flex-col gap-6 shadow-2xl">
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500/10 blur-3xl rounded-full" />

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">Identity</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                                placeholder="Your Name / Organization" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">Digital Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                                placeholder="name@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">Brief / Inquiry</label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium resize-none"
                                placeholder="Describe your project or request..." />
                        </div>
                        <button type="submit" disabled={isSubmitting}
                            className="mt-4 flex items-center justify-center gap-3 px-8 py-5 bg-white text-black font-black rounded-2xl hover:bg-cyan-500 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-white/5">
                            {isSubmitting ? "TRANSMITTING..." : "SEND MESSAGE"}
                            {!isSubmitting && <Send className="w-5 h-5" />}
                        </button>
                    </motion.form>
                </div>
            </div>
        </main>
    );
}
