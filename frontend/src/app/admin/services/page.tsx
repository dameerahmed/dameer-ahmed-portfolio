"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Edit3, Plus, Zap, Code, Cpu, Settings, Database, Globe, Layers, Brain, Smartphone, Terminal, Shield, Cloud, Activity, Server, Layout, Check, X } from "lucide-react";
import { getDeviceId } from "@/lib/utils";
import { AdminSection, AdminField } from "@/components/admin/AdminUI";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const IconMap: { [key: string]: any } = {
    Code, Zap, Cpu, Settings, Database, Globe, Layers, Brain, Smartphone, Terminal, Shield, Cloud, Activity, Server, Layout
};

const LUCIDE_ICONS = Object.keys(IconMap);

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "X-Device-ID": getDeviceId()
    };
}

export default function AdminServices() {
    const [services, setServices] = useState<any[]>([]);
    const [newService, setNewService] = useState({ title: "", description: "", icon_name: "Zap" });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ title: "", description: "", icon_name: "" });

    const loadServices = useCallback(async () => {
        try {
            const res = await fetch(`${API}/admin/services`, {
                headers: { "X-Device-ID": getDeviceId() },
                credentials: "include"
            });
            const data = await res.json();
            if (Array.isArray(data)) setServices(data);
        } catch (err) {
            console.error("Failed to load services:", err);
        }
    }, []);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    const addService = async () => {
        if (!newService.title) return;
        const res = await fetch(`${API}/admin/services`, {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify(newService)
        });
        if (res.ok) {
            const data = await res.json();
            setServices(prev => [...prev, data]);
            setNewService({ title: "", description: "", icon_name: "Zap" });
            toast.success("Service deployed.");
        }
    };

    const deleteService = async (id: number) => {
        const res = await fetch(`${API}/admin/services/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
        if (res.ok) {
            setServices(prev => prev.filter(s => s.id !== id));
            toast.success("Service removed.");
        }
    };

    const startEditing = (s: any) => {
        setEditingId(s.id);
        setEditForm({ title: s.title, description: s.description, icon_name: s.icon_name || "Zap" });
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveEdit = async (id: number) => {
        const res = await fetch(`${API}/admin/services/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify(editForm)
        });
        if (res.ok) {
            const updated = await res.json();
            setServices(prev => prev.map(s => s.id === id ? updated : s));
            setEditingId(null);
            toast.success("Service updated.");
        }
    };

    return (
        <AdminSection title="My Services" sub="Manage your services and expertise packages">
            <div className="max-w-4xl space-y-12 pb-20">

                {/* Add New Service */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                    <h2 className="text-lg font-bold text-white flex items-center gap-3 uppercase italic tracking-tight">
                        <div className="w-1 h-6 bg-purple-500 rounded-full" />
                        Deploy New Service
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AdminField label="Service Title" value={newService.title} onChange={v => setNewService(p => ({ ...p, title: v }))} placeholder="e.g. AI Agent Development" />
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Visual Identity (Icon)</label>
                            <select value={newService.icon_name} onChange={e => setNewService(p => ({ ...p, icon_name: e.target.value }))}
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-purple-500 text-zinc-300">
                                {LUCIDE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Detailed Description</label>
                        <textarea value={newService.description} onChange={e => setNewService(p => ({ ...p, description: e.target.value }))} rows={4}
                            className="bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500 resize-none text-zinc-300 text-sm leading-relaxed"
                            placeholder="Briefly explain the value proposition..." />
                    </div>

                    <button onClick={addService} className="w-full bg-purple-500 hover:bg-purple-400 text-black font-bold py-4 rounded-xl transition-all active:scale-95 shadow-xl shadow-purple-500/10 text-xs uppercase tracking-widest">
                        <Plus className="inline-block w-4 h-4 mr-2 mb-0.5" /> DEPLOY TO PORTFOLIO
                    </button>
                </div>

                {/* Existing Services List */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-zinc-500 flex items-center gap-3 uppercase italic tracking-tight px-2">
                        My Services ({services.length})
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {services.map(s => {
                            const isEditing = editingId === s.id;
                            const Icon = IconMap[s.icon_name || "Zap"] || Zap;

                            return (
                                <div key={s.id} className={`group relative p-6 rounded-3xl border transition-all duration-500 ${isEditing ? "bg-zinc-900/50 border-purple-500/50" : "bg-black/40 backdrop-blur-xl border-white/5 hover:border-white/10"}`}>
                                    {isEditing ? (
                                        <div className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                                                    className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-white font-bold text-sm" />
                                                <select value={editForm.icon_name} onChange={e => setEditForm(p => ({ ...p, icon_name: e.target.value }))}
                                                    className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-zinc-400 text-sm">
                                                    {LUCIDE_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                                                </select>
                                            </div>
                                            <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-3.5 text-zinc-400 text-sm" />
                                            <div className="flex gap-3">
                                                <button onClick={() => saveEdit(s.id)} className="flex-1 bg-white text-black font-bold py-2.5 rounded-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                                                    <Check className="w-3.5 h-3.5" /> COMMIT
                                                </button>
                                                <button onClick={cancelEditing} className="flex-1 bg-zinc-900 text-zinc-500 font-bold py-2.5 rounded-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                                                    <X className="w-3.5 h-3.5" /> ABORT
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all duration-500 shadow-xl">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1.5 pt-1">
                                                    <h3 className="text-lg font-bold text-white tracking-tight leading-none">{s.title}</h3>
                                                    <p className="text-zinc-500 text-xs leading-relaxed max-w-2xl font-medium">{s.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditing(s)} className="p-2.5 rounded-lg bg-zinc-900 text-zinc-500 hover:text-cyan-400 hover:bg-zinc-800 transition-all">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteService(s.id)} className="p-2.5 rounded-lg bg-zinc-900 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </AdminSection>
    );
}
