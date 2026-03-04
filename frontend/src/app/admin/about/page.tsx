"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Trash2, Edit3, Check, X, Plus, Briefcase, Zap, Code, Cpu, Settings, Database, Globe, Layers, Brain, Smartphone, Terminal, Shield, Cloud, Activity, Server, Layout, Heart, Languages } from "lucide-react";
import { getDeviceId } from "@/lib/utils";
import { AdminSection, AdminField } from "@/components/admin/AdminUI";
import ScrollSelector from "@/components/admin/ScrollSelector";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const IconMap: { [key: string]: any } = {
    Code, Zap, Cpu, Settings, Database, Globe, Layers, Brain, Smartphone, Terminal, Shield, Cloud, Activity, Server, Layout, Heart, Languages
};

const LUCIDE_ICONS_OPTIONS = Object.keys(IconMap).map(name => ({ label: name, value: name }));

const LANGUAGE_OPTIONS = [
    { label: "English", value: "English" },
    { label: "Urdu", value: "Urdu" },
    { label: "German", value: "German" },
    { label: "French", value: "French" },
    { label: "Spanish", value: "Spanish" },
    { label: "Arabic", value: "Arabic" },
    { label: "Mandarin", value: "Mandarin" },
    { label: "Japanese", value: "Japanese" }
].map(opt => ({ ...opt }));

const PROFICIENCY_LEVELS = [
    { label: "Native / Bilingual", value: "Native" },
    { label: "Fluent", value: "Fluent" },
    { label: "Professional Working", value: "Professional Working" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Elementary", value: "Elementary" }
];

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "X-Device-ID": getDeviceId()
    };
}

export default function AdminAbout() {
    const router = useRouter();
    const [profile, setProfile] = useState({ bio: "", resume_pdf_url: "" });
    const [techStack, setTechStack] = useState<any[]>([]);
    const [journey, setJourney] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [education, setEducation] = useState<any[]>([]);
    const [hobbies, setHobbies] = useState<any[]>([]);
    const [languages, setLanguages] = useState<any[]>([]);

    const [newTech, setNewTech] = useState({ name: "", category: "Primary", years_of_experience: 1, percentage: 80, icon_name: "Code" });
    const [newJourney, setNewJourney] = useState({ year: "", milestone_title: "", description: "" });
    const [newService, setNewService] = useState({ title: "", description: "", icon_name: "Zap" });
    const [newEducation, setNewEducation] = useState({ year: "", degree: "", institution: "", description: "" });
    const [newHobby, setNewHobby] = useState({ name: "" });
    const [newLanguage, setNewLanguage] = useState({ name: "", percentage: 100, level: "Fluent" });

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Editing States
    const [editingTechId, setEditingTechId] = useState<number | null>(null);
    const [editTechForm, setEditTechForm] = useState({ name: "", category: "", years_of_experience: 0, percentage: 0, icon_name: "" });

    const [editingJourneyId, setEditingJourneyId] = useState<number | null>(null);
    const [editJourneyForm, setEditJourneyForm] = useState({ year: "", milestone_title: "", description: "" });

    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [editServiceForm, setEditServiceForm] = useState({ title: "", description: "", icon_name: "" });

    const [editingEducationId, setEditingEducationId] = useState<number | null>(null);
    const [editEducationForm, setEditEducationForm] = useState({ year: "", degree: "", institution: "", description: "" });

    const [editingLanguageId, setEditingLanguageId] = useState<number | null>(null);
    const [editLanguageForm, setEditLanguageForm] = useState({ name: "", percentage: 0, level: "" });

    const [editingHobbyId, setEditingHobbyId] = useState<number | null>(null);
    const [editHobbyForm, setEditHobbyForm] = useState({ name: "" });

    const loadData = useCallback(async (endpoint: string) => {
        try {
            const res = await fetch(`${API}/${endpoint}`, {
                headers: { "X-Device-ID": getDeviceId() },
                credentials: "include"
            });
            return await res.json();
        } catch (err) {
            console.error(`Failed to load ${endpoint}:`, err);
            return null;
        }
    }, []);

    useEffect(() => {
        loadData("admin/profile").then(d => d && setProfile(prev => ({ ...prev, ...d })));
        loadData("v1/content/tech-stack").then(d => Array.isArray(d) && setTechStack(d));
        loadData("admin/journey").then(d => Array.isArray(d) && setJourney(d));
        loadData("admin/services").then(d => Array.isArray(d) && setServices(d));
        loadData("admin/education").then(d => Array.isArray(d) && setEducation(d));
        loadData("admin/hobbies").then(d => Array.isArray(d) && setHobbies(d));
        loadData("admin/languages").then(d => Array.isArray(d) && setLanguages(d));
    }, [loadData]);

    const uploadFile = async (file: File): Promise<string> => {
        const form = new FormData();
        form.append("file", file);
        form.append("remove_bg", "false");
        const res = await fetch(`${API}/admin/upload`, {
            method: "POST",
            headers: { "X-Device-ID": getDeviceId() },
            credentials: "include",
            body: form
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
    };

    const saveProfileAndResume = async () => {
        setIsUploading(true);
        try {
            let resumeUrl = profile.resume_pdf_url;
            if (resumeFile) {
                resumeUrl = await uploadFile(resumeFile);
            }

            const res = await fetch(`${API}/admin/profile`, {
                method: "PUT",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify({ ...profile, resume_pdf_url: resumeUrl })
            });

            if (res.ok) {
                toast.success("Profile & Resume updated.");
                setResumeFile(null);
                router.refresh();
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to save.");
        } finally {
            setIsUploading(false);
        }
    };

    const addTech = async () => {
        if (!newTech.name) return;
        try {
            const res = await fetch(`${API}/v1/content/tech-stack`, {
                method: "POST", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify(newTech)
            });
            if (res.ok) {
                const data = await res.json();
                setTechStack(prev => [...prev, data].sort((a, b) => (b.percentage || 0) - (a.percentage || 0)));
                setNewTech({ name: "", category: "Primary", years_of_experience: 1, percentage: 80, icon_name: "Code" });
                toast.success("Tech added.");
                router.refresh();
            } else {
                toast.error(`Tech add failed: ${await res.text()}`);
            }
        } catch (e: any) { toast.error(e.message); }
    };

    const deleteTech = async (id: number) => {
        try {
            const res = await fetch(`${API}/v1/content/tech-stack/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
            if (res.ok) { setTechStack(prev => prev.filter(t => t.id !== id)); toast.success("Removed."); router.refresh(); }
            else { toast.error(`Tech delete failed: ${await res.text()}`); }
        } catch (e: any) { toast.error(e.message); }
    };

    const addJourney = async () => {
        if (!newJourney.year) return;
        try {
            const res = await fetch(`${API}/admin/journey`, {
                method: "POST", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify(newJourney)
            });
            if (res.ok) {
                const data = await res.json();
                setJourney(prev => [data, ...prev]);
                setNewJourney({ year: "", milestone_title: "", description: "" });
                toast.success("Milestone added.");
                router.refresh();
            } else { toast.error(`Journey add failed: ${await res.text()}`); }
        } catch (e: any) { toast.error(e.message); }
    };

    const deleteJourney = async (id: number) => {
        try {
            const res = await fetch(`${API}/admin/journey/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
            if (res.ok) { setJourney(prev => prev.filter(j => j.id !== id)); toast.success("Deleted."); router.refresh(); }
            else { toast.error(`Journey delete failed: ${await res.text()}`); }
        } catch (e: any) { toast.error(e.message); }
    };

    const updateTech = async (id: number) => {
        try {
            const res = await fetch(`${API}/v1/content/tech-stack/${id}`, {
                method: "PUT", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify(editTechForm)
            });
            if (res.ok) {
                const data = await res.json();
                setTechStack(prev => prev.map(t => t.id === id ? data : t));
                setEditingTechId(null);
                toast.success("Tech updated.");
                router.refresh();
            } else { toast.error(`Tech update failed: ${await res.text()}`); }
        } catch (e: any) { toast.error(e.message); }
    };

    const updateJourney = async (id: number) => {
        try {
            const res = await fetch(`${API}/admin/journey/${id}`, {
                method: "PUT", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify(editJourneyForm)
            });
            if (res.ok) {
                const data = await res.json();
                setJourney(prev => prev.map(j => j.id === id ? data : j));
                setEditingJourneyId(null);
                toast.success("Journey updated.");
                router.refresh();
            } else { toast.error(`Journey update failed: ${await res.text()}`); }
        } catch (e: any) { toast.error(e.message); }
    };

    const addService = async () => {
        if (!newService.title) return;
        const res = await fetch(`${API}/admin/services`, {
            method: "POST", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(newService)
        });
        if (res.ok) {
            const data = await res.json();
            setServices(prev => [...prev, data]);
            setNewService({ title: "", description: "", icon_name: "Zap" });
            toast.success("Service added.");
            router.refresh();
        }
    };

    const deleteService = async (id: number) => {
        const res = await fetch(`${API}/admin/services/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
        if (res.ok) { setServices(prev => prev.filter(s => s.id !== id)); toast.success("Deleted."); router.refresh(); }
    };

    const updateService = async (id: number) => {
        const res = await fetch(`${API}/admin/services/${id}`, {
            method: "PUT", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(editServiceForm)
        });
        if (res.ok) {
            const data = await res.json();
            setServices(prev => prev.map(s => s.id === id ? data : s));
            setEditingServiceId(null);
            toast.success("Service updated.");
            router.refresh();
        }
    };

    const addEducation = async () => {
        if (!newEducation.degree) return;
        const res = await fetch(`${API}/admin/education`, {
            method: "POST", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(newEducation)
        });
        if (res.ok) {
            const data = await res.json();
            setEducation(prev => [...prev, data]);
            setNewEducation({ year: "", degree: "", institution: "", description: "" });
            toast.success("Education added.");
            router.refresh();
        }
    };

    const deleteEducation = async (id: number) => {
        const res = await fetch(`${API}/admin/education/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
        if (res.ok) { setEducation(prev => prev.filter(e => e.id !== id)); toast.success("Deleted."); router.refresh(); }
    };

    const updateEducation = async (id: number) => {
        const res = await fetch(`${API}/admin/education/${id}`, {
            method: "PUT", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(editEducationForm)
        });
        if (res.ok) {
            const data = await res.json();
            setEducation(prev => prev.map(e => e.id === id ? data : e));
            setEditingEducationId(null);
            toast.success("Education updated.");
            router.refresh();
        }
    };

    const addHobby = async () => {
        if (!newHobby.name) return;
        const res = await fetch(`${API}/admin/hobbies`, {
            method: "POST", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(newHobby)
        });
        if (res.ok) {
            const data = await res.json();
            setHobbies(prev => [...prev, data]);
            setNewHobby({ name: "" });
            toast.success("Hobby added.");
            router.refresh();
        }
    };

    const deleteHobby = async (id: number) => {
        const res = await fetch(`${API}/admin/hobbies/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
        if (res.ok) { setHobbies(prev => prev.filter(h => h.id !== id)); toast.success("Deleted."); router.refresh(); }
    };

    const updateHobby = async (id: number) => {
        const res = await fetch(`${API}/admin/hobbies/${id}`, {
            method: "PUT", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(editHobbyForm)
        });
        if (res.ok) {
            const data = await res.json();
            setHobbies(prev => prev.map(h => h.id === id ? data : h));
            setEditingHobbyId(null);
            toast.success("Hobby updated.");
            router.refresh();
        }
    };

    const addLanguage = async () => {
        if (!newLanguage.name) return;
        const res = await fetch(`${API}/admin/languages`, {
            method: "POST", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(newLanguage)
        });
        if (res.ok) {
            const data = await res.json();
            setLanguages(prev => [...prev, data]);
            setNewLanguage({ name: "", percentage: 100, level: "Fluent" });
            toast.success("Language added.");
            router.refresh();
        }
    };

    const deleteLanguage = async (id: number) => {
        const res = await fetch(`${API}/admin/languages/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
        if (res.ok) { setLanguages(prev => prev.filter(l => l.id !== id)); toast.success("Deleted."); router.refresh(); }
    };

    const updateLanguage = async (id: number) => {
        const res = await fetch(`${API}/admin/languages/${id}`, {
            method: "PUT", headers: getAuthHeaders(), credentials: "include",
            body: JSON.stringify(editLanguageForm)
        });
        if (res.ok) {
            const data = await res.json();
            setLanguages(prev => prev.map(l => l.id === id ? data : l));
            setEditingLanguageId(null);
            toast.success("Language updated.");
            router.refresh();
        }
    };

    return (
        <AdminSection title="About & Resume Hub" sub="Manage biography, expertise, offerings, and professional timeline">
            <div className="max-w-4xl space-y-12 pb-20">
                {/* 1. Profile Status Info */}
                {!profile.bio && (
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 flex items-center gap-3 text-cyan-400">
                        <Activity className="w-5 h-5 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Bio Data...</span>
                    </div>
                )}

                {/* Biography & Resume Section */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Biography / Narrative</label>
                        <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={6}
                            className="bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500/50 resize-none text-zinc-300 text-sm leading-relaxed font-medium" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 pt-6 border-t border-white/5 border-dashed">
                        <div className="w-32 h-24 rounded-2xl border border-dashed border-white/10 overflow-hidden bg-black/40 relative group flex flex-col items-center justify-center transition-all hover:border-cyan-500/50">
                            {resumeFile ? <div className="text-cyan-400 font-mono text-[9px] text-center p-2 truncate w-full">{resumeFile.name}</div>
                                : (profile.resume_pdf_url ? <div className="text-zinc-600 flex flex-col items-center"><Briefcase className="w-5 h-5 mb-1" /><span className="text-[8px] font-bold uppercase tracking-tighter">Active PDF</span></div>
                                    : <div className="text-zinc-800 flex flex-col items-center"><Plus className="w-5 h-5 mb-1" /><span className="text-[8px] font-bold uppercase tracking-tighter">No Resume</span></div>)}
                            <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setResumeFile(e.target.files?.[0] || null)} />
                            <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 text-center text-[8px] font-bold text-white uppercase translate-y-full group-hover:translate-y-0 transition-transform">Upload PDF</div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="text-lg font-bold text-white tracking-tight">Professional CV</h3>
                            <p className="text-zinc-500 text-xs font-medium">Upload your latest Resume in PDF format for public viewing.</p>
                        </div>
                    </div>

                    <button onClick={saveProfileAndResume} disabled={isUploading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 active:scale-95 text-[10px] uppercase tracking-widest shadow-xl">
                        {isUploading ? "TRANSMITTING..." : "SAVE BIO & RESUME"}
                    </button>
                </div>

                {/* Languages & Hobbies Grid (Sidebar Items) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Languages */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold italic tracking-tight text-white uppercase flex items-center gap-3">
                            <div className="w-1 h-6 bg-zinc-500 rounded-full" />
                            Languages
                        </h2>
                        <div className="space-y-3">
                            {(languages || []).map(l => {
                                const isEditing = editingLanguageId === l.id;
                                return (
                                    <div key={l.id} className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-4 flex flex-col hover:border-cyan-500/30 transition-all shadow-lg ${isEditing ? "border-cyan-500/50" : "border-white/5"}`}>
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <ScrollSelector
                                                    label="Language"
                                                    value={editLanguageForm.name}
                                                    options={LANGUAGE_OPTIONS}
                                                    onChange={v => setEditLanguageForm(prev => ({ ...prev, name: v }))}
                                                />
                                                <ScrollSelector
                                                    label="Level"
                                                    value={editLanguageForm.level}
                                                    options={PROFICIENCY_LEVELS}
                                                    onChange={v => setEditLanguageForm(prev => ({ ...prev, level: v }))}
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateLanguage(l.id)} className="flex-1 bg-cyan-500 text-black font-bold py-2 rounded-lg text-[10px] uppercase">Save</button>
                                                    <button onClick={() => setEditingLanguageId(null)} className="flex-1 bg-zinc-900 text-zinc-500 font-bold py-2 rounded-lg text-[10px] uppercase">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center w-full">
                                                <div>
                                                    <div className="text-white font-bold text-sm tracking-tight">{l.name}</div>
                                                    <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">{l.level} • {l.percentage}%</div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => { setEditingLanguageId(l.id); setEditLanguageForm({ name: l.name, level: l.level, percentage: l.percentage }) }} className="text-zinc-800 hover:text-cyan-500 transition-colors p-2 rounded-lg hover:bg-cyan-500/5"><Edit3 className="w-4 h-4" /></button>
                                                    <button onClick={() => deleteLanguage(l.id)} className="text-zinc-800 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/5"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-4">
                            <ScrollSelector
                                label="Language"
                                value={newLanguage.name}
                                options={LANGUAGE_OPTIONS}
                                onChange={v => setNewLanguage(p => ({ ...p, name: v }))}
                            />
                            <ScrollSelector
                                label="Proficiency Level"
                                value={newLanguage.level}
                                options={PROFICIENCY_LEVELS}
                                onChange={v => setNewLanguage(p => ({ ...p, level: v }))}
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mastery % ({newLanguage.percentage}%)</label>
                                <input type="range" min="0" max="100" value={newLanguage.percentage} onChange={e => setNewLanguage(p => ({ ...p, percentage: parseInt(e.target.value) }))}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                            </div>
                            <button onClick={addLanguage} className="w-full bg-zinc-900 text-white border border-white/10 font-bold py-3 rounded-xl hover:bg-white hover:text-black transition-all text-[8px] uppercase tracking-widest">ADD LANGUAGE</button>
                        </div>
                    </div>

                    {/* Hobbies */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold italic tracking-tight text-white uppercase flex items-center gap-3">
                            <div className="w-1 h-6 bg-zinc-500 rounded-full" />
                            Hobbies & Interests
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {hobbies.map(h => {
                                const isEditing = editingHobbyId === h.id;
                                return (
                                    <div key={h.id} className={`bg-black/40 backdrop-blur-xl border rounded-full px-4 py-2 flex items-center gap-3 hover:border-cyan-500/30 transition-all group shadow-md ${isEditing ? "border-cyan-500/50" : "border-white/5"}`}>
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <input value={editHobbyForm.name} onChange={e => setEditHobbyForm({ name: e.target.value })}
                                                    className="bg-zinc-950 border-none outline-none text-xs text-white max-w-[80px]" />
                                                <button onClick={() => updateHobby(h.id)} className="text-cyan-500"><Check className="w-3 h-3" /></button>
                                                <button onClick={() => setEditingHobbyId(null)} className="text-zinc-500"><X className="w-3 h-3" /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-xs text-zinc-300 font-medium">{h.name}</span>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                                    <button onClick={() => { setEditingHobbyId(h.id); setEditHobbyForm({ name: h.name }) }} className="text-zinc-700 hover:text-cyan-500"><Edit3 className="w-3 h-3" /></button>
                                                    <button onClick={() => deleteHobby(h.id)} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-4">
                            <AdminField label="New Interest" value={newHobby.name} onChange={v => setNewHobby(p => ({ ...p, name: v }))} placeholder="e.g. Chess" />
                            <button onClick={addHobby} className="w-full bg-zinc-900 text-white border border-white/10 font-bold py-3 rounded-xl hover:bg-white hover:text-black transition-all text-[8px] uppercase tracking-widest">ADD INTEREST</button>
                        </div>
                    </div>
                </div>

                {/* Tech Stack Matrix */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold italic tracking-tight text-white uppercase flex items-center gap-3">
                        <div className="w-1 h-6 bg-cyan-500 rounded-full" />
                        01 // My Skills
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(techStack || []).map(t => {
                            const isEditing = editingTechId === t.id;
                            return (
                                <div key={t.id} className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-4 flex flex-col group transition-all shadow-lg ${isEditing ? "border-cyan-500/50" : "border-white/5 hover:border-cyan-500/30"}`}>
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <input value={editTechForm.name} onChange={e => setEditTechForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-white font-bold text-sm" placeholder="Name" />
                                            <div className="flex gap-2">
                                                <input value={editTechForm.years_of_experience} type="number" onChange={e => setEditTechForm(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                                                    className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-white text-xs" placeholder="Years" />
                                                <div className="w-full">
                                                    <ScrollSelector
                                                        label=""
                                                        value={editTechForm.icon_name}
                                                        options={LUCIDE_ICONS_OPTIONS}
                                                        onChange={(v) => setEditTechForm(prev => ({ ...prev, icon_name: v }))}
                                                        iconMap={IconMap}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => updateTech(t.id)} className="flex-1 bg-cyan-500 text-black font-bold py-2 rounded-lg text-[10px] uppercase">Save</button>
                                                <button onClick={() => setEditingTechId(null)} className="flex-1 bg-zinc-900 text-zinc-500 font-bold py-2 rounded-lg text-[10px] uppercase">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-cyan-400 border border-white/5 group-hover:bg-cyan-500 group-hover:text-black transition-colors duration-500">
                                                    {(() => {
                                                        const Icon = IconMap[t.icon_name || "Code"] || Code;
                                                        return <Icon className="w-5 h-5" />;
                                                    })()}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm tracking-tight">{t.name}</div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">{t.years_of_experience}+ Years</div>
                                                        <span className="text-[9px] text-cyan-500 font-bold">{t.percentage || 0}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingTechId(t.id); setEditTechForm({ name: t.name, category: t.category, years_of_experience: t.years_of_experience, percentage: t.percentage, icon_name: t.icon_name || "Code" }) }} className="text-zinc-800 hover:text-cyan-500 transition-colors p-2 rounded-lg hover:bg-cyan-500/5"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => deleteTech(t.id)} className="text-zinc-800 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/5"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AdminField label="Skill / Tool Name" value={newTech.name} onChange={v => setNewTech(p => ({ ...p, name: v }))} placeholder="e.g. PyTorch" />
                            <AdminField label="Experience (Years)" value={newTech.years_of_experience.toString()} onChange={v => setNewTech(p => ({ ...p, years_of_experience: parseInt(v) || 0 }))} type="number" />
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Mastery % ({newTech.percentage}%)</label>
                                <input type="range" min="0" max="100" value={newTech.percentage} onChange={e => setNewTech(p => ({ ...p, percentage: parseInt(e.target.value) }))}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <ScrollSelector
                                    label="Icon Symbol"
                                    value={newTech.icon_name}
                                    options={LUCIDE_ICONS_OPTIONS}
                                    onChange={(v) => setNewTech(p => ({ ...p, icon_name: v }))}
                                    iconMap={IconMap}
                                />
                            </div>
                            <AdminField label="Category" value={newTech.category} onChange={v => setNewTech(p => ({ ...p, category: v }))} placeholder="e.g. Machine Learning" />
                        </div>
                        <button onClick={addTech} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-cyan-400 transition-all active:scale-95 text-[10px] uppercase tracking-widest shadow-xl">INJECT NODE</button>
                    </div>
                </div>

                {/* Professional Journey Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold italic tracking-tight text-white uppercase flex items-center gap-3">
                        <div className="w-1 h-6 bg-cyan-500 rounded-full" />
                        02 // My Experience
                    </h2>
                    <div className="space-y-4">
                        {(journey || []).map(j => {
                            const isEditing = editingJourneyId === j.id;
                            return (
                                <div key={j.id} className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-6 flex flex-col hover:border-cyan-500/30 transition-all group shadow-lg ${isEditing ? "border-cyan-500/50" : "border-white/5"}`}>
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input value={editJourneyForm.year} onChange={e => setEditJourneyForm(prev => ({ ...prev, year: e.target.value }))}
                                                    className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-white text-xs" placeholder="Period" />
                                                <input value={editJourneyForm.milestone_title} onChange={e => setEditJourneyForm(prev => ({ ...prev, milestone_title: e.target.value }))}
                                                    className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-white font-bold text-sm" placeholder="Title" />
                                            </div>
                                            <textarea value={editJourneyForm.description} onChange={e => setEditJourneyForm(prev => ({ ...prev, description: e.target.value }))} rows={2}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-zinc-500 text-xs resize-none" placeholder="Description" />
                                            <div className="flex gap-2">
                                                <button onClick={() => updateJourney(j.id)} className="flex-1 bg-cyan-500 text-black font-bold py-2 rounded-lg text-[10px] uppercase">Save</button>
                                                <button onClick={() => setEditingJourneyId(null)} className="flex-1 bg-zinc-900 text-zinc-500 font-bold py-2 rounded-lg text-[10px] uppercase">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <span className="text-cyan-500 font-mono text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">{j.year}</span>
                                                <h3 className="text-white font-bold text-base tracking-tight">{j.milestone_title}</h3>
                                                <p className="text-xs text-zinc-500 max-w-lg leading-relaxed font-medium">{j.description}</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingJourneyId(j.id); setEditJourneyForm({ year: j.year, milestone_title: j.milestone_title, description: j.description }) }} className="text-zinc-800 hover:text-cyan-500 transition-colors p-2 rounded-lg hover:bg-cyan-500/5"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => deleteJourney(j.id)} className="text-zinc-800 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/5"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <AdminField label="Year / Period" value={newJourney.year} onChange={v => setNewJourney(p => ({ ...p, year: v }))} placeholder="e.g. 2021 - 2024" />
                            <AdminField label="Milestone Title / Role" value={newJourney.milestone_title} onChange={v => setNewJourney(p => ({ ...p, milestone_title: v }))} placeholder="e.g. AI Agent Developer" />
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Journey Description</label>
                            <textarea value={newJourney.description} onChange={e => setNewJourney(p => ({ ...p, description: e.target.value }))} rows={3}
                                className="bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500/50 resize-none text-zinc-300 text-sm font-medium" placeholder="Core responsibilities & tech used..." />
                        </div>
                        <button onClick={addJourney} className="w-full bg-zinc-900 text-cyan-500 border border-cyan-500/20 font-bold py-4 rounded-xl hover:bg-cyan-500 hover:text-black transition-all active:scale-95 text-[10px] uppercase tracking-widest">LOG EXPERIENCE</button>
                    </div>
                </div>

                {/* Academic Background Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold italic tracking-tight text-white uppercase flex items-center gap-3">
                        <div className="w-1 h-6 bg-cyan-500 rounded-full" />
                        03 // Education
                    </h2>
                    <div className="space-y-4">
                        {(education || []).map(e => {
                            const isEditing = editingEducationId === e.id;
                            return (
                                <div key={e.id} className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-6 flex flex-col hover:border-cyan-500/30 transition-all group shadow-lg ${isEditing ? "border-cyan-500/50" : "border-white/5"}`}>
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input value={editEducationForm.year} onChange={e => setEditEducationForm(prev => ({ ...prev, year: e.target.value }))}
                                                    className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-white text-xs" placeholder="Period" />
                                                <input value={editEducationForm.degree} onChange={e => setEditEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                                                    className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-white font-bold text-sm" placeholder="Degree" />
                                            </div>
                                            <input value={editEducationForm.institution} onChange={e => setEditEducationForm(prev => ({ ...prev, institution: e.target.value }))}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-zinc-400 text-xs" placeholder="Institution" />
                                            <textarea value={editEducationForm.description} onChange={e => setEditEducationForm(prev => ({ ...prev, description: e.target.value }))} rows={2}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-zinc-500 text-xs resize-none" placeholder="Description" />
                                            <div className="flex gap-2">
                                                <button onClick={() => updateEducation(e.id)} className="flex-1 bg-cyan-500 text-black font-bold py-2 rounded-lg text-[10px] uppercase">Save</button>
                                                <button onClick={() => setEditingEducationId(null)} className="flex-1 bg-zinc-900 text-zinc-500 font-bold py-2 rounded-lg text-[10px] uppercase">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <span className="text-cyan-500 font-mono text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">{e.year}</span>
                                                <h3 className="text-white font-bold text-base tracking-tight">{e.degree}</h3>
                                                <p className="text-xs text-zinc-400 font-bold">{e.institution}</p>
                                                <p className="text-xs text-zinc-500 max-w-lg leading-relaxed font-medium">{e.description}</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingEducationId(e.id); setEditEducationForm({ year: e.year, degree: e.degree, institution: e.institution, description: e.description }) }} className="text-zinc-800 hover:text-cyan-500 transition-colors p-2 rounded-lg hover:bg-cyan-500/5"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => deleteEducation(e.id)} className="text-zinc-800 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/5"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <AdminField label="Year / Period" value={newEducation.year} onChange={v => setNewEducation(p => ({ ...p, year: v }))} placeholder="e.g. 2019 - 2023" />
                            <AdminField label="Degree / Qualification" value={newEducation.degree} onChange={v => setNewEducation(p => ({ ...p, degree: v }))} placeholder="e.g. BS Artificial Intelligence" />
                        </div>
                        <AdminField label="Institution" value={newEducation.institution} onChange={v => setNewEducation(p => ({ ...p, institution: v }))} placeholder="e.g. Stanford University" />
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Education Description</label>
                            <textarea value={newEducation.description} onChange={e => setNewEducation(p => ({ ...p, description: e.target.value }))} rows={3}
                                className="bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500/50 resize-none text-zinc-300 text-sm font-medium" placeholder="GPA, honors, key modules..." />
                        </div>
                        <button onClick={addEducation} className="w-full bg-zinc-900 text-cyan-500 border border-cyan-500/20 font-bold py-4 rounded-xl hover:bg-cyan-500 hover:text-black transition-all active:scale-95 text-[10px] uppercase tracking-widest">LOG EDUCATION</button>
                    </div>
                </div>

                {/* Services Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold italic tracking-tight text-white uppercase flex items-center gap-3">
                        <div className="w-1 h-6 bg-cyan-500 rounded-full" />
                        04 // My Services
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(services || []).map(s => {
                            const isEditing = editingServiceId === s.id;
                            return (
                                <div key={s.id} className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-5 flex flex-col hover:border-cyan-500/30 transition-all group shadow-lg ${isEditing ? "border-cyan-500/50" : "border-white/5"}`}>
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <input value={editServiceForm.title} onChange={e => setEditServiceForm(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-white font-bold text-sm" placeholder="Title" />
                                            <textarea value={editServiceForm.description} onChange={e => setEditServiceForm(prev => ({ ...prev, description: e.target.value }))} rows={2}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-zinc-500 text-[11px] resize-none" placeholder="Description" />
                                            <div className="flex gap-2">
                                                <button onClick={() => updateService(s.id)} className="flex-1 bg-cyan-500 text-black font-bold py-2 rounded-lg text-[10px] uppercase">Save</button>
                                                <button onClick={() => setEditingServiceId(null)} className="flex-1 bg-zinc-900 text-zinc-500 font-bold py-2 rounded-lg text-[10px] uppercase">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start w-full">
                                            <div className="space-y-2 flex-1 pr-4">
                                                <div className="text-cyan-400 mb-2">
                                                    {(() => {
                                                        const Icon = IconMap[s.icon_name || "Zap"] || Zap;
                                                        return <Icon className="w-5 h-5" />;
                                                    })()}
                                                </div>
                                                <h3 className="text-white font-bold text-base tracking-tight leading-none">{s.title}</h3>
                                                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium mt-1">{s.description}</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingServiceId(s.id); setEditServiceForm({ title: s.title, description: s.description, icon_name: s.icon_name || "Zap" }) }} className="text-zinc-800 hover:text-cyan-500 transition-colors p-2 rounded-lg hover:bg-cyan-500/5"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => deleteService(s.id)} className="text-zinc-800 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/5"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <AdminField label="Capability Title" value={newService.title} onChange={v => setNewService(p => ({ ...p, title: v }))} placeholder="e.g. Agentic AI Development" />
                            <div className="space-y-2.5">
                                <ScrollSelector
                                    label="Visual Symbol (Icon)"
                                    value={newService.icon_name}
                                    options={LUCIDE_ICONS_OPTIONS}
                                    onChange={v => setNewService(p => ({ ...p, icon_name: v }))}
                                    iconMap={IconMap}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Capability Description</label>
                            <textarea value={newService.description} onChange={e => setNewService(p => ({ ...p, description: e.target.value }))} rows={3}
                                className="bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500/50 resize-none text-zinc-300 text-sm font-medium" placeholder="Specify core impact..." />
                        </div>
                        <button onClick={addService} className="w-full bg-zinc-900 text-cyan-500 border border-cyan-500/20 font-bold py-4 rounded-xl hover:bg-cyan-500 hover:text-black transition-all active:scale-95 text-[10px] uppercase tracking-widest shadow-xl">ADD SERVICE</button>
                    </div>
                </div>

            </div>
        </AdminSection>
    );
}
