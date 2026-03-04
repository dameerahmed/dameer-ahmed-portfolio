"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Share2, Trash2, Edit3, Plus, Upload, Image as ImageIcon, CheckCircle, Save } from "lucide-react";
import { getDeviceId } from "@/lib/utils";
import { AdminSection, AdminField } from "@/components/admin/AdminUI";
import ImageEditorModal from "@/components/ImageEditorModal";
import Dashboard from "@/components/admin/Dashboard";

import { API } from "@/lib/api";

export default function AdminHome() {
    const router = useRouter();
    const [profile, setProfile] = useState({ name: "", profile_pic: "" });
    const [homeContent, setHomeContent] = useState({ hero_title: "", typing_tags: [] as string[], hero_description: "" });
    const [homeTagsInput, setHomeTagsInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Image Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorImageSrc, setEditorImageSrc] = useState<string | null>(null);
    const [pictureFile, setPictureFile] = useState<File | null>(null);
    const [pictureUseCloudinaryAI, setPictureUseCloudinaryAI] = useState(false);

    useEffect(() => {
        fetch(`${API}/admin/profile`, { headers: { "X-Device-ID": getDeviceId() }, credentials: "include" })
            .then(res => res.json())
            .then(d => d && setProfile(prev => ({ ...prev, ...d })));

        fetch(`${API}/v1/content/home`, { credentials: "include" })
            .then(res => res.json())
            .then(d => {
                if (d) {
                    setHomeContent(d);
                    setHomeTagsInput(d.typing_tags.join(", "));
                }
            });
    }, []);

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
        return data.url;
    };

    const saveHome = async () => {
        setIsUploading(true);
        try {
            let picUrl = profile.profile_pic;
            if (pictureFile) {
                picUrl = await uploadFile(pictureFile, pictureUseCloudinaryAI);
            }

            // Sync Profile (Name & Pic)
            await fetch(`${API}/admin/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Device-ID": getDeviceId()
                },
                credentials: "include",
                body: JSON.stringify({ ...profile, profile_pic: picUrl })
            });

            // Sync Home Content (Use the current array from homeContent)
            const homeRes = await fetch(`${API}/v1/content/home`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Device-ID": getDeviceId()
                },
                credentials: "include",
                body: JSON.stringify(homeContent)
            });

            if (homeRes.ok) {
                toast.success("Home section synchronized.");
                setPictureFile(null);
                router.refresh();
            }
        } catch (e: any) {
            toast.error(e.message || "Sync failed.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AdminSection title="Home Page" sub="Manage Hero visuals, branding, and phrases">
            <div className="w-full lg:max-w-xl space-y-8 pb-10">
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                    {/* Portrait Section */}
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border border-dashed border-white/10 overflow-hidden bg-black/40 relative group shrink-0">
                            {profile.profile_pic ? <img src={profile.profile_pic} alt="Portrait" className="w-full h-full object-cover opacity-80" /> : <ImageIcon className="w-8 h-8 text-zinc-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                <Upload className="w-5 h-5 text-cyan-400" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-3 text-center md:text-left">
                            <label className="cursor-pointer inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white text-black px-5 py-2.5 rounded-full hover:bg-cyan-400 transition-all">
                                Update Portrait
                                <input
                                    type="file" className="sr-only" accept="image/*"
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
                            <p className="text-[9px] text-zinc-600 font-mono leading-relaxed">Accepted: JPG, PNG, WEBP. <br /> Preferred: 4:5 Portrait Ratio.</p>
                            {pictureFile && <p className="text-[9px] text-cyan-500 font-bold italic">Ready: {pictureFile.name}</p>}
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-white/5">
                        <AdminField label="Branding Name" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
                        <AdminField label="Hero Title" value={homeContent.hero_title} onChange={v => setHomeContent(p => ({ ...p, hero_title: v }))} />

                        {/* Dynamic Tags CRUD */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] pl-1">Dynamic Phrases</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {homeContent.typing_tags.map((tag, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1 rounded-full group transition-all hover:border-cyan-500/30">
                                        <span className="text-[10px] text-zinc-400 font-medium">{tag}</span>
                                        <button onClick={() => setHomeContent(prev => ({ ...prev, typing_tags: prev.typing_tags.filter((_, idx) => idx !== i) }))}
                                            className="text-zinc-600 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text" value={homeTagsInput} onChange={e => homeTagsInput.length < 30 && setHomeTagsInput(e.target.value)}
                                    placeholder="Add new phrase..."
                                    className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500/50 text-zinc-300"
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && homeTagsInput.trim()) {
                                            e.preventDefault();
                                            setHomeContent(prev => ({ ...prev, typing_tags: [...prev.typing_tags, homeTagsInput.trim()] }));
                                            setHomeTagsInput("");
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (homeTagsInput.trim()) {
                                            setHomeContent(prev => ({ ...prev, typing_tags: [...prev.typing_tags, homeTagsInput.trim()] }));
                                            setHomeTagsInput("");
                                        }
                                    }}
                                    className="p-2.5 rounded-xl border border-white/5 hover:border-cyan-500/50 hover:text-cyan-400 transition-all">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] pl-1">Hero Description</label>
                            <textarea value={homeContent.hero_description} onChange={e => setHomeContent(p => ({ ...p, hero_description: e.target.value }))} rows={5}
                                className="bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500/50 resize-none text-zinc-300 text-sm leading-relaxed font-medium" />
                        </div>
                    </div>

                    <button onClick={saveHome} disabled={isUploading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-xl active:scale-95 text-[10px] uppercase tracking-widest">
                        {isUploading ? "TRANSMITTING..." : "SAVE CHANGES"}
                    </button>
                </div>
            </div>

            <ImageEditorModal
                isOpen={isEditorOpen}
                onClose={() => { setIsEditorOpen(false); setEditorImageSrc(null); }}
                imageSrc={editorImageSrc}
                onSave={(file, useCloudinaryAI) => {
                    setPictureFile(file);
                    setPictureUseCloudinaryAI(useCloudinaryAI);
                    setIsEditorOpen(false);
                    setEditorImageSrc(null);
                    toast.success("Image edited and queued for upload.");
                }}
            />
        </AdminSection>
    );
}
