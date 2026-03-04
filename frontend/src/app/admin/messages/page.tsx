"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Trash2, MessageSquare, CheckCircle, Flag } from "lucide-react";
import { getDeviceId } from "@/lib/utils";
import { AdminSection, AdminEmpty } from "@/components/admin/AdminUI";

import { API } from "@/lib/api";

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "X-Device-ID": getDeviceId()
    };
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<any[]>([]);

    const loadMessages = useCallback(async () => {
        try {
            const res = await fetch(`${API}/admin/messages`, {
                headers: { "X-Device-ID": getDeviceId() },
                credentials: "include"
            });
            const data = await res.json();
            if (Array.isArray(data)) setMessages(data);
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    }, []);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const markRead = async (id: number) => {
        const res = await fetch(`${API}/admin/messages/${id}/read`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            credentials: "include"
        });
        if (res.ok) {
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        }
    };

    const toggleFlag = async (id: number) => {
        const res = await fetch(`${API}/admin/messages/${id}/flag`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            credentials: "include"
        });
        if (res.ok) {
            const data = await res.json();
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_flagged: data.is_flagged } : m));
        }
    };

    const deleteMsg = async (id: number) => {
        const res = await fetch(`${API}/admin/messages/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
            credentials: "include"
        });
        if (res.ok) {
            setMessages(prev => prev.filter(m => m.id !== id));
            toast.success("Deleted");
        }
    };

    return (
        <AdminSection title="Inquiries" sub="Review and manage communication received via contact forms">
            <div className="space-y-4 max-w-4xl">
                {messages.length === 0 ? <AdminEmpty icon={MessageSquare} label="No active inquiries" /> : messages.map(m => (
                    <div key={m.id} className={`bg-black/40 backdrop-blur-xl border rounded-3xl p-6 transition-all relative overflow-hidden group ${m.is_read ? "border-white/5 opacity-50" : "border-cyan-500/20 shadow-2xl"}`}>
                        {m.is_flagged && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[80px] pointer-events-none" />}

                        <div className="flex items-start justify-between gap-6 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-lg tracking-tight text-white">{m.name}</span>
                                    {!m.is_read && <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 text-[8px] font-bold uppercase tracking-widest">New Priority</span>}
                                    {m.is_flagged && <Flag className="w-3 h-3 text-red-500 fill-red-500" />}
                                </div>
                                <p className="text-[10px] text-zinc-600 font-mono mb-4">{m.email}</p>
                                <p className="text-zinc-400 text-sm leading-relaxed italic font-medium">"{m.message}"</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => toggleFlag(m.id)}
                                    className={`p-3 rounded-xl border transition-all ${m.is_flagged ? "bg-red-500/10 border-red-500/30 text-red-500" : "border-white/5 hover:border-red-500/30 text-zinc-700 hover:text-red-400"}`}>
                                    <Flag className={`w-4 h-4 ${m.is_flagged ? "fill-red-500" : ""}`} />
                                </button>
                                {!m.is_read && <button onClick={() => markRead(m.id)} className="p-3 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:text-cyan-400 text-zinc-700 transition-all"><CheckCircle className="w-4 h-4" /></button>}
                                <button onClick={() => deleteMsg(m.id)} className="p-3 rounded-xl border border-white/5 hover:border-zinc-500/30 hover:text-white text-zinc-800 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminSection>
    );
}
