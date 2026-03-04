"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Trash2, Edit3, Plus, ImageIcon, FileVideo } from "lucide-react";
import { getDeviceId } from "@/lib/utils";
import { AdminSection, AdminField, AdminEmpty } from "@/components/admin/AdminUI";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "X-Device-ID": getDeviceId()
    };
}

export default function AdminProjects() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [newProject, setNewProject] = useState({ title: "", description: "", tech_tags: "", github_link: "", video_url: "" });
    const [projectFile, setProjectFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ title: "", description: "", tech_tags: "", github_link: "", video_url: "" });

    const loadProjects = useCallback(async () => {
        try {
            const res = await fetch(`${API}/admin/projects`, {
                headers: { "X-Device-ID": getDeviceId() },
                credentials: "include"
            });
            const data = await res.json();
            if (Array.isArray(data)) setProjects(data);
        } catch (err) {
            console.error("Failed to load projects:", err);
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

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

    const addProject = async () => {
        if (!newProject.title) return;
        setIsUploading(true);
        try {
            let mediaUrl = newProject.video_url;
            if (projectFile) {
                mediaUrl = await uploadFile(projectFile);
            }
            const res = await fetch(`${API}/admin/projects`, {
                method: "POST", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify({ ...newProject, video_url: mediaUrl })
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(prev => [data, ...prev]);
                setNewProject({ title: "", description: "", tech_tags: "", github_link: "", video_url: "" });
                setProjectFile(null);
                toast.success("Project added");
                router.refresh();
            }
        } catch (e) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const deleteProject = async (id: number) => {
        const res = await fetch(`${API}/admin/projects/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
        if (res.ok) { setProjects(projects.filter(p => p.id !== id)); toast.success("Deleted"); router.refresh(); }
    };

    const startEditing = (p: any) => {
        setEditingId(p.id);
        setEditForm({
            title: p.title,
            description: p.description,
            tech_tags: p.tech_tags,
            github_link: p.github_link,
            video_url: p.video_url
        });
    };

    const saveEdit = async (id: number) => {
        try {
            const res = await fetch(`${API}/admin/projects/${id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                const updated = await res.json();
                setProjects(prev => prev.map(p => p.id === id ? updated : p));
                setEditingId(null);
                toast.success("Project updated");
                router.refresh();
            }
        } catch (e) {
            toast.error("Failed to update");
        }
    };

    return (
        <AdminSection title="Projects" sub="Manage portfolio projects and media">
            <div className="w-full lg:max-w-4xl space-y-10">

                {/* Projects List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {projects.length === 0 ? <div className="col-span-1 md:col-span-2"><AdminEmpty icon={Plus} label="No projects yet" /></div> : projects.map(p => {
                        const isEditing = editingId === p.id;
                        return (
                            <div key={p.id} className={`bg-black/40 backdrop-blur-xl border rounded-3xl overflow-hidden group hover:border-cyan-500/30 transition-all flex flex-col shadow-xl ${isEditing ? "border-cyan-500/50" : "border-white/5"}`}>
                                {isEditing ? (
                                    <div className="p-6 space-y-4">
                                        <input value={editForm.title} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-white font-bold text-sm" placeholder="Title" />
                                        <textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} rows={3}
                                            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-zinc-400 text-xs resize-none" placeholder="Description" />
                                        <input value={editForm.tech_tags} onChange={e => setEditForm(prev => ({ ...prev, tech_tags: e.target.value }))}
                                            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-zinc-400 text-xs" placeholder="Tags (comma separated)" />
                                        <input value={editForm.github_link} onChange={e => setEditForm(prev => ({ ...prev, github_link: e.target.value }))}
                                            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-zinc-400 text-xs" placeholder="External Link" />
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={() => saveEdit(p.id)} className="flex-1 bg-cyan-500 text-black font-bold py-2 rounded-lg text-[10px] uppercase">Save</button>
                                            <button onClick={() => setEditingId(null)} className="flex-1 bg-zinc-900 text-zinc-500 font-bold py-2 rounded-lg text-[10px] uppercase">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {p.video_url && (
                                            <div className="h-44 bg-zinc-950 border-b border-white/5 relative">
                                                {p.video_url.endsWith(".mp4") || p.video_url.endsWith(".webm") ? (
                                                    <video src={p.video_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" autoPlay loop muted playsInline />
                                                ) : (
                                                    <img src={p.video_url} alt={p.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                                                )}
                                            </div>
                                        )}
                                        <div className="p-5 md:p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-white font-bold text-lg tracking-tight leading-tight">{p.title}</h3>
                                                <div className="flex gap-1">
                                                    <button onClick={() => startEditing(p)} className="text-zinc-800 hover:text-cyan-500 transition-colors p-1"><Edit3 className="w-4 h-4" /></button>
                                                    <button onClick={() => deleteProject(p.id)} className="text-zinc-800 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <p className="text-zinc-500 text-xs leading-relaxed mb-4 flex-1 line-clamp-3 font-medium">{p.description}</p>
                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                {p.tech_tags.split(",").map((t: string, i: number) => t.trim() && (
                                                    <span key={i} className="text-[8px] font-bold uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/5 border border-cyan-400/10 px-2 py-0.5 rounded-full">{t.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* New Project Form */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 max-w-2xl shadow-2xl">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">Initialize New Project</h3>

                    <div className="flex items-center gap-6">
                        <div className="w-28 h-28 rounded-2xl border border-dashed border-white/10 flex items-center justify-center bg-black/40 relative overflow-hidden group transition-all hover:border-cyan-500/50">
                            {projectFile ? <FileVideo className="w-6 h-6 text-cyan-400" /> : <ImageIcon className="w-6 h-6 text-zinc-800" />}
                            <input type="file" accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setProjectFile(e.target.files?.[0] || null)} />
                            <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 text-center text-[8px] font-bold text-white uppercase translate-y-full group-hover:translate-y-0 transition-transform">Upload Media</div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-xs font-bold text-white uppercase tracking-widest">Project Media</p>
                            <p className="text-[9px] text-zinc-600 font-mono leading-relaxed">Accepted: JPG, PNG, GIF, MP4 (max 50mb).</p>
                            {projectFile && <p className="text-[9px] text-cyan-400 font-mono italic truncate">Selected: {projectFile.name}</p>}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <AdminField label="Project Title" value={newProject.title} onChange={v => setNewProject(p => ({ ...p, title: v }))} placeholder="e.g. AI Workflow Engine" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <AdminField label="Stack (e.g. React, Node)" value={newProject.tech_tags} onChange={v => setNewProject(p => ({ ...p, tech_tags: v }))} placeholder="Comma separated" />
                            <AdminField label="External Link" value={newProject.github_link} onChange={v => setNewProject(p => ({ ...p, github_link: v }))} placeholder="https://..." />
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Description</label>
                            <textarea value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} rows={4}
                                className="bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500/50 resize-none text-zinc-300 text-sm font-medium" />
                        </div>
                    </div>
                    <button onClick={addProject} disabled={isUploading} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 text-[10px] uppercase tracking-widest shadow-xl">
                        {isUploading ? "TRANSMITTING DATA..." : "ADD PROJECT"}
                    </button>
                </div>

            </div>
        </AdminSection>
    );
}
