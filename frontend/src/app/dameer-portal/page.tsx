"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    LogOut, MessageSquare, CheckCircle, Trash2, User, Zap,
    Clock, Plus, Upload, FileVideo, Briefcase, LayoutDashboard, Home, Image as ImageIcon, Settings, Link as LinkIcon
} from "lucide-react";
import { getDeviceId } from "@/lib/utils";
import { motion } from "framer-motion";
import ImageEditorModal from "@/components/ImageEditorModal";

import { API } from "@/lib/api";

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "X-Device-ID": getDeviceId()
    };
}

type Tab = "messages" | "identity" | "tech" | "skills" | "journey" | "projects";

export default function AdminPortal() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [tab, setTab] = useState<Tab>("messages");

    const [messages, setMessages] = useState<any[]>([]);
    const [profile, setProfile] = useState({ name: "", bio: "", profile_pic: "", resume_pdf_url: "" });
    const [skills, setSkills] = useState<any[]>([]);
    const [journey, setJourney] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [homeContent, setHomeContent] = useState({ hero_title: "", typing_tags: [] as string[], hero_description: "" });
    const [homeTagsInput, setHomeTagsInput] = useState("");
    const [techStack, setTechStack] = useState<any[]>([]);

    const [newTech, setNewTech] = useState({ name: "", category: "", years_of_experience: 1 });
    const [newSkill, setNewSkill] = useState({ name: "", percentage: 80, description: "" });
    const [newJourney, setNewJourney] = useState({ year: "", milestone_title: "", description: "" });
    const [newProject, setNewProject] = useState({ title: "", description: "", tech_tags: "", github_link: "", video_url: "" });
    const [socials, setSocials] = useState<any[]>([]);
    const [newSocial, setNewSocial] = useState({ platform: "Link", url: "" });

    const [projectFile, setProjectFile] = useState<File | null>(null);
    const [pictureFile, setPictureFile] = useState<File | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [pictureUseCloudinaryAI, setPictureUseCloudinaryAI] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // Image Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorImageSrc, setEditorImageSrc] = useState<string | null>(null);

    const load = useCallback(async (endpoint: string) => {
        try {
            const res = await fetch(`${API}/admin/${endpoint}`, {
                headers: { "X-Device-ID": getDeviceId() },
                credentials: "include"
            });
            if (res.status === 401 || res.status === 403) {
                router.replace("/login");
                return null;
            }
            return await res.json();
        } catch (err) {
            console.error(`Failed to load ${endpoint}:`, err);
            return null;
        }
    }, [router]);

    useEffect(() => {
        setReady(true);
        load("messages").then(d => d && setMessages(d));
        load("profile").then(d => d && setProfile(prev => ({ ...prev, ...d })));
        load("skills").then(d => d && setSkills(d));
        load("journey").then(d => d && setJourney(d));
        load("projects").then(d => d && setProjects(d));
        load("socials").then(d => {
            if (Array.isArray(d)) setSocials(d);
        });

        fetch(`${API}/v1/content/home`, { credentials: "include" })
            .then(res => res.json())
            .then(d => {
                if (d) {
                    setHomeContent(d);
                    setHomeTagsInput(d.typing_tags.join(", "));
                }
            });

        fetch(`${API}/v1/content/tech-stack`, { credentials: "include" })
            .then(res => res.json())
            .then(d => d && setTechStack(d));
    }, [load]);

    const uploadFile = async (file: File, removeBg: boolean = false): Promise<string> => {
        const form = new FormData();
        form.append("file", file);
        form.append("remove_bg", removeBg ? "true" : "false");
        const res = await fetch(`${API}/admin/upload`, {
            method: "POST",
            headers: { "X-Device-ID": getDeviceId() },
            credentials: "include",
            body: form
        });
        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        if (data.warning) {
            toast.error(data.warning, { duration: 5000 });
        }
        return data.url;
    };

    const markRead = async (id: number) => {
        await fetch(`${API}/admin/messages/${id}/read`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            credentials: "include"
        });
        setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    };

    const deleteMsg = async (id: number) => {
        await fetch(`${API}/admin/messages/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
            credentials: "include"
        });
        setMessages(prev => prev.filter(m => m.id !== id));
        toast.success("Deleted");
    };

    const saveIdentity = async () => {
        setIsUploading(true);
        try {
            let picUrl = profile.profile_pic;
            if (pictureFile) {
                picUrl = await uploadFile(pictureFile, pictureUseCloudinaryAI);
            }
            let resumeUrl = profile.resume_pdf_url;
            if (resumeFile) {
                // Upload Resume PDF without AI processing
                resumeUrl = await uploadFile(resumeFile, false);
            }

            // Sync Profile
            const profRes = await fetch(`${API}/admin/profile`, {
                method: "PUT",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify({ ...profile, profile_pic: picUrl, resume_pdf_url: resumeUrl })
            });
            if (!profRes.ok) throw new Error("Profile sync failed");
            setProfile(await profRes.json());

            // Sync Home Content
            const tags = homeTagsInput.split(",").map(s => s.trim()).filter(Boolean);
            const homeRes = await fetch(`${API}/v1/content/home`, {
                method: "PUT",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify({ ...homeContent, typing_tags: tags })
            });
            if (!homeRes.ok) throw new Error("Home content sync failed");
            const updatedHome = await homeRes.json();
            setHomeContent(updatedHome);
            setHomeTagsInput(updatedHome.typing_tags.join(", "));

            toast.success("Identity & Content synchronized.");
            setPictureFile(null);
            setResumeFile(null);
        } catch (e: any) {
            toast.error(e.message || "Sync failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const addTech = async () => {
        if (!newTech.name) { toast.error("Name required"); return; }
        const res = await fetch(`${API}/v1/content/tech-stack`, {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify({
                ...newTech,
                years_of_experience: parseInt(newTech.years_of_experience.toString()) || 0
            })
        });
        if (!res.ok) { toast.error("Failed adding tech"); return; }
        const t = await res.json();
        setTechStack(prev => [...prev, t].sort((a, b) => b.years_of_experience - a.years_of_experience));
        setNewTech({ name: "", category: "", years_of_experience: 1 });
        toast.success("Tech added.");
    };

    const deleteTech = async (id: number) => {
        await fetch(`${API}/v1/content/tech-stack/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
            credentials: "include"
        });
        setTechStack(prev => prev.filter(t => t.id !== id));
        toast.success("Tech removed.");
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API}/admin/logout`, { method: "POST", credentials: "include" });
            toast.success("Session terminated.");
            router.replace("/");
        } catch {
            toast.error("Logout failed.");
        }
    };

    const addSkill = async () => {
        if (!newSkill.name) return;
        const res = await fetch(`${API}/admin/skills`, {
            method: "POST", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(newSkill)
        });
        if (res.ok) {
            setSkills([...skills, await res.json()]);
            setNewSkill({ name: "", percentage: 80, description: "" });
            toast.success("Service added");
        } else toast.error("Failed to add");
    };
    const deleteSkill = async (id: number) => {
        const res = await fetch(`${API}/admin/skills/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
        if (res.ok) { setSkills(skills.filter(s => s.id !== id)); toast.success("Deleted"); }
    };
    const addJourney = async () => {
        if (!newJourney.year) return;
        const res = await fetch(`${API}/admin/journey`, {
            method: "POST", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(newJourney)
        });
        if (res.ok) {
            setJourney([await res.json(), ...journey]);
            setNewJourney({ year: "", milestone_title: "", description: "" });
            toast.success("Journey added");
        } else toast.error("Failed to add");
    };
    const deleteJourney = async (id: number) => {
        const res = await fetch(`${API}/admin/journey/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
        if (res.ok) { setJourney(journey.filter(j => j.id !== id)); toast.success("Deleted"); }
    };
    const addProject = async () => {
        if (!newProject.title) return;
        setIsUploading(true);
        try {
            let mediaUrl = newProject.video_url;
            if (projectFile) {
                mediaUrl = await uploadFile(projectFile, false); // No bg removal for project media
            }
            const res = await fetch(`${API}/admin/projects`, {
                method: "POST", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify({ ...newProject, video_url: mediaUrl })
            });
            if (res.ok) {
                setProjects([await res.json(), ...projects]);
                setNewProject({ title: "", description: "", tech_tags: "", github_link: "", video_url: "" });
                setProjectFile(null);
                toast.success("Project added");
            } else toast.error("Failed to add project");
        } catch (e) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };
    const deleteProject = async (id: number) => {
        const res = await fetch(`${API}/admin/projects/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
        if (res.ok) { setProjects(projects.filter(p => p.id !== id)); toast.success("Deleted"); }
    };
    const addSocial = async () => {
        if (!newSocial.url) return;
        const res = await fetch(`${API}/admin/socials`, {
            method: "POST", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(newSocial)
        });
        if (res.ok) {
            setSocials([...socials, await res.json()]);
            setNewSocial({ platform: "Link", url: "" });
            toast.success("Social link added");
        }
    };
    const deleteSocial = async (id: number) => {
        const res = await fetch(`${API}/admin/socials/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
        if (res.ok) { setSocials(socials.filter(s => s.id !== id)); toast.success("Deleted"); }
    };

    if (!ready) return null;

    const tabs: { key: Tab; label: string; icon: any; badge?: number }[] = [
        { key: "messages", label: "Messages", icon: MessageSquare, badge: messages.filter(m => !m.is_read).length || undefined },
        { key: "identity", label: "Identity & Home", icon: User },
        { key: "tech", label: "Tech Stack", icon: Zap },
        { key: "skills", label: "Services", icon: LayoutDashboard },
        { key: "journey", label: "Journey", icon: Clock },
        { key: "projects", label: "Projects", icon: Briefcase },
    ];

    return (
        <>
            <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-cyan-500 selection:text-black">

                {/* Minimalist Sidebar */}
                <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-900 bg-[#080808] flex flex-col h-auto md:h-screen sticky top-0 z-20">
                    <div className="p-10 border-b border-zinc-900">
                        <h2 className="font-black text-white text-2xl tracking-tighter italic">DAMEER.EXE</h2>
                        <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-[0.4em] mt-2">v4.0 Premium</p>
                    </div>
                    <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                        {tabs.map(({ key, label, icon: Icon, badge }) => (
                            <button key={key} onClick={() => setTab(key)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left text-sm font-bold transition-all ${tab === key ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,243,255,0.2)]" : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"}`}>
                                <Icon className="w-4 h-4 flex-shrink-0" /> {label}
                                {badge ? <span className="ml-auto bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span> : null}
                            </button>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-zinc-900">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-4 text-red-600 hover:bg-red-950/20 rounded-2xl text-sm font-black transition-colors">
                            <LogOut className="w-4 h-4" /> Terminate
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 p-10 md:p-16 overflow-y-auto max-h-screen">

                    {tab === "identity" && (
                        <Section title="Identity & Content" sub="Manage Hero visuals, strings, and your primary portrait">
                            <div className="max-w-xl space-y-10">

                                {/* Portrait Section */}
                                <div className="bg-[#080808] border border-zinc-900 rounded-3xl p-10 space-y-8">
                                    <div className="flex flex-col md:flex-row items-center gap-10">
                                        <div className="w-40 h-40 rounded-3xl border-2 border-dashed border-zinc-900 overflow-hidden bg-zinc-950 relative group">
                                            {profile.profile_pic ? <img src={profile.profile_pic} alt="Portrait" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-zinc-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                <Upload className="w-6 h-6 text-cyan-400" />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-4 text-center md:text-left">
                                            <label className="cursor-pointer inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-black px-6 py-3 rounded-full hover:bg-cyan-400 transition-all">
                                                Update Media
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.addEventListener("load", () => {
                                                                setEditorImageSrc(reader.result?.toString() || null);
                                                                setIsEditorOpen(true);
                                                            });
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">Accepted: JPG, PNG, WEBP. <br /> Preferred: 4:5 Portrait Ratio.</p>
                                            {pictureFile && <p className="text-[10px] text-cyan-500 font-bold italic">Ready: {pictureFile.name}</p>}
                                        </div>
                                    </div>

                                    {/* Resume Upload Section */}
                                    <div className="flex flex-col md:flex-row items-center gap-10 pt-8 border-t border-zinc-900 border-dashed pb-8">
                                        <div className="w-40 h-24 rounded-2xl border-2 border-dashed border-zinc-900 overflow-hidden bg-zinc-950 relative group flex flex-col items-center justify-center">
                                            {resumeFile ? (
                                                <div className="text-cyan-400 font-mono text-[10px] text-center p-2 truncate w-full">{resumeFile.name}</div>
                                            ) : profile.resume_pdf_url ? (
                                                <div className="flex flex-col items-center text-zinc-600">
                                                    <Briefcase className="w-6 h-6 mb-1" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Active PDF</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-zinc-800">
                                                    <Plus className="w-6 h-6 mb-1" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">No Resume</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file && file.type === "application/pdf") {
                                                        setResumeFile(file);
                                                    } else {
                                                        toast.error("Please select a PDF file");
                                                    }
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 text-center text-[8px] font-bold text-white uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform">Upload PDF</div>
                                        </div>
                                        <div className="flex-1 space-y-2 text-center md:text-left">
                                            <h3 className="text-xl font-bold tracking-tight text-white">Curriculum Vitae</h3>
                                            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                                                Upload your latest Resume in PDF format. This is linked across the site for downloads.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-zinc-900">
                                        <Field label="Full Branding Name" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
                                        <Field label="Hero Title" value={homeContent.hero_title} onChange={v => setHomeContent(p => ({ ...p, hero_title: v }))} />
                                        <Field label="Typing Animation Phrases (comma separated)" value={homeTagsInput} onChange={v => setHomeTagsInput(v)} />
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Intro Narrative</label>
                                            <textarea value={homeContent.hero_description} onChange={e => setHomeContent(p => ({ ...p, hero_description: e.target.value }))} rows={5}
                                                className="bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500 resize-none text-zinc-300 text-sm leading-relaxed" />
                                        </div>
                                    </div>

                                    <button onClick={saveIdentity} disabled={isUploading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-5 rounded-2xl transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(0,243,255,0.15)] active:scale-95">
                                        {isUploading ? (pictureUseCloudinaryAI && pictureFile ? "PROCESSING AI..." : "TRANSMITTING DATA...") : "SYNCHRONIZE CORE"}
                                    </button>

                                    {/* Social Links Manager */}
                                    <div className="space-y-6 pt-10 border-t border-zinc-900 mt-10">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                                                <LinkIcon className="w-5 h-5 text-cyan-400" /> Web Links
                                            </h3>
                                            <p className="text-zinc-500 text-sm">Add your social profiles. The site will automatically match the correct icon.</p>
                                        </div>

                                        <div className="flex gap-4 items-end bg-[#080808] p-6 rounded-2xl border border-zinc-900 flex-wrap">
                                            <div className="flex-1 min-w-[200px]">
                                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 block">Full URL</label>
                                                <input className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                                                    placeholder="https://github.com/dameerahmed" value={newSocial.url} onChange={e => setNewSocial({ ...newSocial, url: e.target.value })} />
                                            </div>
                                            <button onClick={addSocial} className="bg-cyan-500 text-black px-6 py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-cyan-400 transition-colors h-fit whitespace-nowrap">
                                                Add Link
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {socials.map((s, i) => (
                                                <div key={i} className="bg-[#050505] border border-zinc-800/50 p-4 rounded-xl flex items-center gap-4 group hover:border-cyan-500/30 transition-colors">
                                                    <div className="w-10 h-10 rounded-lg bg-[#080808] border border-zinc-800 flex items-center justify-center text-cyan-400">
                                                        <LinkIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 truncate">
                                                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{s.platform || "Link"}</p>
                                                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-white truncate block hover:text-cyan-400">{s.url}</a>
                                                    </div>
                                                    <button onClick={() => deleteSocial(s.id)} className="text-zinc-600 hover:text-red-500 transition-colors shrink-0">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </Section>
                    )}

                    {tab === "tech" && (
                        <Section title="Expertise Matrix" sub="Manage technologies and their manual experience years">
                            <div className="max-w-2xl space-y-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {techStack.map(t => (
                                        <div key={t.id} className="bg-[#080808] border border-zinc-900 rounded-2xl p-6 flex justify-between items-center group transition-all hover:border-cyan-500/40">
                                            <div>
                                                <div className="text-white font-bold text-lg tracking-tight">{t.name}</div>
                                                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-1">Manual: {t.years_of_experience}+ Years</div>
                                            </div>
                                            <button onClick={() => deleteTech(t.id)} className="text-zinc-800 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[#080808] border border-zinc-900 rounded-3xl p-8 space-y-6">
                                    <h3 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-2">Initialize New Insight</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <Field label="Technology" value={newTech.name} onChange={v => setNewTech(p => ({ ...p, name: v }))} placeholder="e.g. PyTorch" />
                                        <Field label="Years Experience" value={newTech.years_of_experience.toString()} onChange={v => setNewTech(p => ({ ...p, years_of_experience: parseInt(v) || 0 }))} type="number" />
                                    </div>
                                    <button onClick={addTech} className="w-full bg-white text-black font-black py-4 rounded-2xl transition-all hover:bg-cyan-400">
                                        ADD NODE
                                    </button>
                                </div>
                            </div>
                        </Section>
                    )}

                    {/* Other tab content like messages remains standard but fits the new style */}
                    {tab === "messages" && (
                        <Section title="Incoming Data" sub="Inquiries received through the front portal">
                            {messages.length === 0 ? <Empty icon={MessageSquare} label="No active inquiries" /> : (
                                <div className="space-y-4 max-w-3xl">
                                    {messages.map(m => (
                                        <div key={m.id} className={`bg-[#080808] border rounded-3xl p-8 ${m.is_read ? "border-zinc-900 opacity-60" : "border-cyan-500/20 shadow-[0_0_20px_rgba(0,243,255,0.03)]"}`}>
                                            <div className="flex items-start justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="font-black text-xl tracking-tight">{m.name}</span>
                                                        {!m.is_read && <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-black text-[9px] font-black uppercase tracking-widest">New</span>}
                                                    </div>
                                                    <p className="text-xs text-zinc-700 font-mono mb-6">{m.email}</p>
                                                    <p className="text-zinc-400 text-sm leading-relaxed italic">"{m.message}"</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!m.is_read && <button onClick={() => markRead(m.id)} className="p-4 rounded-2xl border border-zinc-900 hover:border-cyan-500 hover:text-cyan-400 text-zinc-700 transition-all"><CheckCircle className="w-5 h-5" /></button>}
                                                    <button onClick={() => deleteMsg(m.id)} className="p-4 rounded-2xl border border-zinc-900 hover:border-red-600 hover:text-red-500 text-zinc-700 transition-all"><Trash2 className="w-5 h-5" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                    )}

                    {tab === "skills" && (
                        <Section title="Services" sub="Manage offered services and skills">
                            <div className="max-w-2xl space-y-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {skills.map(s => (
                                        <div key={s.id} className="bg-[#080808] border border-zinc-900 rounded-2xl p-6 flex justify-between items-start group transition-all hover:border-cyan-500/40">
                                            <div>
                                                <div className="text-white font-bold text-lg tracking-tight">{s.name}</div>
                                                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-1">Proficiency: {s.percentage}%</div>
                                                {s.description && <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{s.description}</p>}
                                            </div>
                                            <button onClick={() => deleteSkill(s.id)} className="text-zinc-800 hover:text-red-500 transition-colors ml-4 shrink-0">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-[#080808] border border-zinc-900 rounded-3xl p-8 space-y-6">
                                    <h3 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-2">Initialize New Service</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <Field label="Service Name" value={newSkill.name} onChange={v => setNewSkill(p => ({ ...p, name: v }))} placeholder="e.g. AI Agent Development" />
                                        <Field label="Proficiency %" value={newSkill.percentage.toString()} onChange={v => setNewSkill(p => ({ ...p, percentage: parseInt(v) || 0 }))} type="number" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Description</label>
                                        <textarea value={newSkill.description} onChange={e => setNewSkill(p => ({ ...p, description: e.target.value }))} rows={3}
                                            className="bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500 resize-none text-zinc-300 text-sm" />
                                    </div>
                                    <button onClick={addSkill} className="w-full bg-white text-black font-black py-4 rounded-2xl transition-all hover:bg-cyan-400">
                                        ADD SERVICE
                                    </button>
                                </div>
                            </div>
                        </Section>
                    )}

                    {tab === "journey" && (
                        <Section title="Journey" sub="Manage timeline milestones">
                            <div className="max-w-2xl space-y-10">
                                <div className="space-y-4">
                                    {journey.map(j => (
                                        <div key={j.id} className="bg-[#080808] border border-zinc-900 rounded-2xl p-6 flex justify-between items-start group transition-all hover:border-cyan-500/40">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-cyan-500 font-mono text-xs font-bold bg-cyan-500/10 px-2 py-1 rounded">{j.year}</span>
                                                    <span className="text-white font-bold text-lg tracking-tight">{j.milestone_title}</span>
                                                </div>
                                                <p className="text-sm text-zinc-500 leading-relaxed max-w-lg">{j.description}</p>
                                            </div>
                                            <button onClick={() => deleteJourney(j.id)} className="text-zinc-800 hover:text-red-500 transition-colors shrink-0 ml-4 mt-1">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-[#080808] border border-zinc-900 rounded-3xl p-8 space-y-6">
                                    <h3 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-2">Initialize New Milestone</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <Field label="Year / Timeline" value={newJourney.year} onChange={v => setNewJourney(p => ({ ...p, year: v }))} placeholder="e.g. 2024" />
                                        <Field label="Milestone Title" value={newJourney.milestone_title} onChange={v => setNewJourney(p => ({ ...p, milestone_title: v }))} placeholder="e.g. Senior MLE" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Description</label>
                                        <textarea value={newJourney.description} onChange={e => setNewJourney(p => ({ ...p, description: e.target.value }))} rows={3}
                                            className="bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500 resize-none text-zinc-300 text-sm" />
                                    </div>
                                    <button onClick={addJourney} className="w-full bg-white text-black font-black py-4 rounded-2xl transition-all hover:bg-cyan-400">
                                        ADD MILESTONE
                                    </button>
                                </div>
                            </div>
                        </Section>
                    )}

                    {tab === "projects" && (
                        <Section title="Projects" sub="Manage portfolio projects and media">
                            <div className="max-w-4xl space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {projects.map(p => (
                                        <div key={p.id} className="bg-[#080808] border border-zinc-900 rounded-3xl overflow-hidden group transition-all hover:border-cyan-500/40 flex flex-col">
                                            {p.video_url && (
                                                <div className="h-48 bg-zinc-950 border-b border-zinc-900 relative">
                                                    {p.video_url.endsWith(".mp4") || p.video_url.endsWith(".webm") ? (
                                                        <video src={p.video_url} className="w-full h-full object-cover opacity-60" autoPlay loop muted playsInline />
                                                    ) : (
                                                        <img src={p.video_url} alt={p.title} className="w-full h-full object-cover opacity-60" />
                                                    )}
                                                </div>
                                            )}
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-white font-bold text-xl tracking-tight">{p.title}</h3>
                                                    <button onClick={() => deleteProject(p.id)} className="text-zinc-800 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <p className="text-zinc-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{p.description}</p>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {p.tech_tags.split(",").map((t: string, i: number) => t.trim() && (
                                                        <span key={i} className="text-[9px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-md">{t.trim()}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[#080808] border border-zinc-900 rounded-3xl p-8 space-y-6 max-w-2xl">
                                    <h3 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-2">Initialize New Project</h3>

                                    <div className="flex items-center gap-6">
                                        <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center bg-zinc-950 relative overflow-hidden group">
                                            {projectFile ? <FileVideo className="w-8 h-8 text-cyan-500" /> : <ImageIcon className="w-8 h-8 text-zinc-800" />}
                                            <input type="file" accept="image/*,video/*" onChange={e => setProjectFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 text-center text-[8px] font-bold text-white uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform">Upload Media</div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs font-bold text-white tracking-widest uppercase">Project Media</p>
                                            <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">Accepted: JPG, PNG, GIF, MP4 (max 50mb).</p>
                                            {projectFile && <p className="text-[10px] text-cyan-400 font-mono italic truncate">Selected: {projectFile.name}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Field label="Project Title" value={newProject.title} onChange={v => setNewProject(p => ({ ...p, title: v }))} placeholder="e.g. AI Workflow Engine" />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <Field label="Tech Tags (comma separated)" value={newProject.tech_tags} onChange={v => setNewProject(p => ({ ...p, tech_tags: v }))} placeholder="e.g. Python, FastAPI, React" />
                                            <Field label="GitHub / Live Link" value={newProject.github_link} onChange={v => setNewProject(p => ({ ...p, github_link: v }))} placeholder="https://..." />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Description</label>
                                            <textarea value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} rows={4}
                                                className="bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-500 resize-none text-zinc-300 text-sm" />
                                        </div>
                                    </div>
                                    <button onClick={addProject} disabled={isUploading} className="w-full bg-white text-black font-black py-4 rounded-2xl transition-all hover:bg-cyan-400 disabled:opacity-50">
                                        {isUploading ? "TRANSMITTING DATA..." : "ADD PROJECT"}
                                    </button>
                                </div>
                            </div>
                        </Section>
                    )}

                </main>
            </div>

            <ImageEditorModal
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditorImageSrc(null);
                }}
                imageSrc={editorImageSrc}
                onSave={(file, useCloudinaryAI) => {
                    setPictureFile(file);
                    setPictureUseCloudinaryAI(useCloudinaryAI);
                    setIsEditorOpen(false);
                    setEditorImageSrc(null);
                    toast.success("Image edited and queued for upload. Core synchronization required.");
                }}
            />
        </>
    );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-16">
                <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">{title}</h1>
                <div className="w-20 h-1 bg-cyan-500 mt-4 rounded-full" />
                <p className="text-zinc-700 text-[10px] font-mono mt-4 uppercase tracking-[0.4em]">{sub}</p>
            </div>
            {children}
        </motion.div>
    );
}

function Empty({ icon: Icon, label }: { icon: any; label: string }) {
    return <div className="text-center py-32 text-zinc-900 border border-dashed border-zinc-900 rounded-[3rem]"><Icon className="w-12 h-12 mx-auto mb-6 opacity-10" /><p className="font-mono text-xs uppercase tracking-[0.3em]">{label}</p></div>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
    return (
        <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500 text-zinc-200 text-sm font-medium transition-all" />
        </div>
    );
}
