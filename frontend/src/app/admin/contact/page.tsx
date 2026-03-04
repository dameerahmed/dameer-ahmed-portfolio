"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Trash2, Edit3, Link as LinkIcon, Plus, Mail, Phone, Check, X, MapPin, Save } from "lucide-react";
import { getDeviceId, getContactIcon } from "@/lib/utils";
import { AdminSection, AdminEmpty } from "@/components/admin/AdminUI";

import { API } from "@/lib/api";

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "X-Device-ID": getDeviceId()
    };
}

const countries = [
    { code: "+92", name: "PK", flag: "🇵🇰" },
    { code: "+1", name: "US", flag: "🇺🇸" },
    { code: "+44", name: "UK", flag: "🇬🇧" },
    { code: "+971", name: "AE", flag: "🇦🇪" },
    { code: "+966", name: "SA", flag: "🇸🇦" },
    { code: "+91", name: "IN", flag: "🇮🇳" },
    { code: "+1", name: "CA", flag: "🇨🇦" },
];

export default function AdminContact() {
    const router = useRouter();
    const [socials, setSocials] = useState<any[]>([]);
    const [emails, setEmails] = useState<any[]>([]);
    const [phones, setPhones] = useState<any[]>([]);

    // Location state
    const [location, setLocation] = useState({ address: "", city: "", country: "" });
    const [isSavingLocation, setIsSavingLocation] = useState(false);

    const [newEmail, setNewEmail] = useState({ email: "", label: "Primary" });
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [phoneInput, setPhoneInput] = useState("");
    const [newPhone, setNewPhone] = useState({ number: "", label: "WhatsApp" });
    const [newSocial, setNewSocial] = useState({ platform: "", platform_name: "", url: "" });

    const [isSaving, setIsSaving] = useState(false);

    // Editing States
    const [editingEmailId, setEditingEmailId] = useState<number | null>(null);
    const [editEmailForm, setEditEmailForm] = useState({ email: "", label: "" });

    const [editingPhoneId, setEditingPhoneId] = useState<number | null>(null);
    const [editPhoneForm, setEditPhoneForm] = useState({ number: "", label: "" });

    const [editingSocialId, setEditingSocialId] = useState<number | null>(null);
    const [editSocialForm, setEditSocialForm] = useState({ platform: "", platform_name: "", url: "" });

    const loadData = useCallback(async () => {
        try {
            const [socialsRes, emailsRes, phonesRes, profileRes] = await Promise.all([
                fetch(`${API}/admin/socials`, { headers: { "X-Device-ID": getDeviceId() }, credentials: "include" }),
                fetch(`${API}/admin/contact/emails`, { headers: { "X-Device-ID": getDeviceId() }, credentials: "include" }),
                fetch(`${API}/admin/contact/phones`, { headers: { "X-Device-ID": getDeviceId() }, credentials: "include" }),
                fetch(`${API}/admin/profile`, { headers: { "X-Device-ID": getDeviceId() }, credentials: "include" }),
            ]);

            const socialsData = await socialsRes.json();
            const emailsData = await emailsRes.json();
            const phonesData = await phonesRes.json();
            const profileData = await profileRes.json();

            if (Array.isArray(socialsData)) setSocials(socialsData);
            if (Array.isArray(emailsData)) setEmails(emailsData);
            if (Array.isArray(phonesData)) setPhones(phonesData);
            if (profileData) {
                setLocation({
                    address: profileData.address || "",
                    city: profileData.city || "",
                    country: profileData.country || "",
                });
            }
        } catch (err) {
            console.error("Failed to load contact data:", err);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const saveLocation = async () => {
        setIsSavingLocation(true);
        try {
            const res = await fetch(`${API}/admin/profile`, {
                method: "PUT",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify(location),
            });
            if (res.ok) {
                toast.success("Location saved!");
                router.refresh();
            } else {
                toast.error(`Failed to save location: ${res.status}`);
            }
        } catch (err) {
            toast.error("Request failed");
        } finally {
            setIsSavingLocation(false);
        }
    };

    const addEmail = async () => {
        if (!newEmail.email) return;
        if (emails.some(e => e.email.toLowerCase() === newEmail.email.toLowerCase())) {
            toast.error("This email already exists");
            return;
        }
        try {
            const res = await fetch(`${API}/admin/contact/emails`, {
                method: "POST", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify(newEmail)
            });
            if (res.ok) {
                const data = await res.json();
                setEmails(prev => [...prev, data]);
                setNewEmail({ email: "", label: "Primary" });
                toast.success("Email added");
            } else {
                toast.error(`Failed: ${res.status}`);
            }
        } catch (err) {
            console.error("Error adding email:", err);
            toast.error("Request failed");
        }
    };

    const deleteEmail = async (id: number) => {
        try {
            const res = await fetch(`${API}/admin/contact/emails/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
            if (res.ok) {
                setEmails(prev => prev.filter(e => e.id !== id));
                toast.success("Email deleted");
            } else {
                toast.error(`Delete failed: ${res.status}`);
            }
        } catch (err) {
            console.error("Error deleting email:", err);
        }
    };

    const updateEmail = async (id: number) => {
        try {
            const res = await fetch(`${API}/admin/contact/emails/${id}`, {
                method: "PUT", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify(editEmailForm)
            });
            if (res.ok) {
                const data = await res.json();
                setEmails(prev => prev.map(e => e.id === id ? data : e));
                setEditingEmailId(null);
                toast.success("Email updated");
            }
        } catch (err) {
            console.error("Error updating email:", err);
        }
    };

    const addPhone = async () => {
        if (!phoneInput) return;
        const fullNumber = `${selectedCountry.code}${phoneInput}`;
        if (phones.some(p => p.number === fullNumber)) {
            toast.error("This number already exists");
            return;
        }
        try {
            const res = await fetch(`${API}/admin/contact/phones`, {
                method: "POST", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify({ number: fullNumber, label: newPhone.label })
            });
            if (res.ok) {
                const data = await res.json();
                setPhones(prev => [...prev, data]);
                setPhoneInput("");
                toast.success("Phone added");
            } else {
                toast.error(`Failed: ${res.status}`);
            }
        } catch (err) {
            console.error("Error adding phone:", err);
            toast.error("Request failed");
        }
    };

    const deletePhone = async (id: number) => {
        try {
            const res = await fetch(`${API}/admin/contact/phones/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
            if (res.ok) {
                setPhones(prev => prev.filter(p => p.id !== id));
                toast.success("Phone deleted");
            } else {
                toast.error(`Delete failed: ${res.status}`);
            }
        } catch (err) {
            console.error("Error deleting phone:", err);
        }
    };

    const updatePhone = async (id: number) => {
        try {
            const res = await fetch(`${API}/admin/contact/phones/${id}`, {
                method: "PUT", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify(editPhoneForm)
            });
            if (res.ok) {
                const data = await res.json();
                setPhones(prev => prev.map(p => p.id === id ? data : p));
                setEditingPhoneId(null);
                toast.success("Phone updated");
            }
        } catch (err) {
            console.error("Error updating phone:", err);
        }
    };

    const addSocial = async () => {
        if (!newSocial.url) return;
        if (socials.some(s => s.url.toLowerCase() === newSocial.url.toLowerCase())) {
            toast.error("This social link already exists");
            return;
        }

        let platform = newSocial.platform;
        let logo_url = getContactIcon(newSocial.platform_name, newSocial.url);

        try {
            const domain = new URL(newSocial.url).hostname.replace('www.', '');
            if (!platform) platform = domain.split('.')[0];
            if (!logo_url) logo_url = `https://logo.clearbit.com/${domain}`;
        } catch (e) { }

        const payload = { ...newSocial, platform, logo_url };

        try {
            const res = await fetch(`${API}/admin/socials`, {
                method: "POST", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                setSocials(prev => [...prev, data]);
                setNewSocial({ platform: "", platform_name: "", url: "" });
                toast.success("Social link deployed");
            } else {
                toast.error(`Failed: ${res.status}`);
            }
        } catch (err) {
            console.error("Error adding social:", err);
            toast.error("Request failed");
        }
    };

    const deleteSocial = async (id: number) => {
        try {
            const res = await fetch(`${API}/admin/socials/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: "include" });
            if (res.ok) {
                setSocials(prev => prev.filter(s => s.id !== id));
                toast.success("Social deleted");
            } else {
                toast.error(`Delete failed: ${res.status}`);
            }
        } catch (err) {
            console.error("Error deleting social:", err);
        }
    };

    const updateSocial = async (id: number) => {
        try {
            const res = await fetch(`${API}/admin/socials/${id}`, {
                method: "PUT", headers: getAuthHeaders(), credentials: "include",
                body: JSON.stringify(editSocialForm)
            });
            if (res.ok) {
                const data = await res.json();
                setSocials(prev => prev.map(s => s.id === id ? data : s));
                setEditingSocialId(null);
                toast.success("Social link updated");
            }
        } catch (err) {
            console.error("Error updating social:", err);
        }
    };

    return (
        <AdminSection title="Connect Settings" sub="Manage public contact points, location, and social web presence">
            <div className="w-full space-y-8 pb-20">

                {/* Location Details - NEW */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-cyan-500" />
                        <div>
                            <h3 className="text-lg font-bold tracking-tight text-white uppercase italic">Location Details</h3>
                            <p className="text-zinc-500 text-[11px] font-medium">Physical address shown on your Resume/About page.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Street Address</label>
                            <input
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 outline-none text-zinc-300 transition-colors"
                                value={location.address}
                                onChange={e => setLocation(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="e.g. 123 Main Street, Block A"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest pl-1">City</label>
                            <input
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 outline-none text-zinc-300 transition-colors"
                                value={location.city}
                                onChange={e => setLocation(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="e.g. Karachi"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Country</label>
                            <input
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 outline-none text-zinc-300 transition-colors"
                                value={location.country}
                                onChange={e => setLocation(prev => ({ ...prev, country: e.target.value }))}
                                placeholder="e.g. Pakistan"
                            />
                        </div>
                    </div>
                    <button
                        onClick={saveLocation}
                        disabled={isSavingLocation}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
                    >
                        <Save className="w-4 h-4" />
                        {isSavingLocation ? "Saving..." : "Save Location"}
                    </button>
                </div>

                {/* Emails + Phones Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Emails Section */}
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold tracking-tight text-white uppercase italic">Email Fleet</h3>
                            <p className="text-zinc-500 text-[11px] font-medium">Publicly accessible mail nodes.</p>
                        </div>

                        <div className="flex gap-2 items-end bg-black/40 p-4 rounded-2xl border border-white/5">
                            <div className="flex-1 space-y-2">
                                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Tag</label>
                                <div className="flex items-center gap-2 bg-zinc-950 border border-white/5 rounded-lg px-2 group">
                                    <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center p-1 shrink-0">
                                        {getContactIcon(newEmail.label, newEmail.email) ? (
                                            <img src={getContactIcon(newEmail.label, newEmail.email)!} alt="" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        ) : (
                                            <Mail className="w-3 h-3 text-zinc-700" />
                                        )}
                                    </div>
                                    <input className="w-full bg-transparent py-2 text-[10px] outline-none text-zinc-300"
                                        value={newEmail.label} onChange={e => setNewEmail({ ...newEmail, label: e.target.value })} placeholder="e.g. Work" />
                                </div>
                            </div>
                            <div className="flex-[2] space-y-2">
                                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Email Address</label>
                                <input className="w-full bg-zinc-950 border border-white/5 rounded-lg px-3 py-2 text-[10px] focus:border-cyan-500/50 outline-none text-zinc-300"
                                    value={newEmail.email} onChange={e => setNewEmail({ ...newEmail, email: e.target.value })} placeholder="name@domain.com" />
                            </div>
                            <button onClick={addEmail} className="bg-white text-black p-2.5 rounded-lg hover:bg-cyan-400 transition-all"><Plus className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-3">
                            {emails.map(e => {
                                const isEditing = editingEmailId === e.id;
                                return (
                                    <div key={e.id} className={`flex flex-col p-3 bg-white/5 rounded-xl border group transition-all ${isEditing ? "border-cyan-500/50" : "border-white/5 hover:border-cyan-500/20"}`}>
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <input value={editEmailForm.label} onChange={ev => setEditEmailForm(prev => ({ ...prev, label: ev.target.value }))}
                                                        className="w-1/3 bg-zinc-950 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-white" placeholder="Tag" />
                                                    <input value={editEmailForm.email} onChange={ev => setEditEmailForm(prev => ({ ...prev, email: ev.target.value }))}
                                                        className="w-2/3 bg-zinc-950 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-white" placeholder="Email" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateEmail(e.id)} className="flex-1 bg-cyan-500 text-black font-bold py-1.5 rounded-lg text-[9px] uppercase">Save</button>
                                                    <button onClick={() => setEditingEmailId(null)} className="flex-1 bg-zinc-900 text-zinc-500 font-bold py-1.5 rounded-lg text-[9px] uppercase">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden p-1.5 px-2">
                                                        {getContactIcon(e.label, e.email) ? <img src={getContactIcon(e.label, e.email)!} alt="" className="w-full h-full object-contain" /> : <Mail className="w-4 h-4 text-zinc-600" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">{e.label}</div>
                                                        <div className="text-xs text-zinc-400 font-medium">{e.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setEditingEmailId(e.id); setEditEmailForm({ label: e.label, email: e.email }) }} className="text-zinc-800 hover:text-cyan-500 p-1.5"><Edit3 className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => deleteEmail(e.id)} className="text-zinc-800 hover:text-red-500 p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Phones Section */}
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold tracking-tight text-white uppercase italic">Comm Channels</h3>
                            <p className="text-zinc-500 text-[11px] font-medium">Direct line identifiers.</p>
                        </div>

                        <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Label</label>
                                    <input className="w-full bg-zinc-950 border border-white/5 rounded-lg px-3 py-2 text-[10px] focus:border-cyan-500/50 outline-none text-zinc-300"
                                        value={newPhone.label} onChange={e => setNewPhone({ ...newPhone, label: e.target.value })} placeholder="WhatsApp" />
                                </div>
                                <div className="flex-[2] space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Number</label>
                                    <div className="flex gap-1">
                                        <select
                                            className="bg-zinc-950 border border-white/5 rounded-lg px-2 text-[10px] outline-none text-zinc-400 cursor-pointer"
                                            value={selectedCountry.code}
                                            onChange={(e) => setSelectedCountry(countries.find(c => c.code === e.target.value) || countries[0])}
                                        >
                                            {countries.map(c => <option key={c.name} value={c.code}>{c.flag} {c.code}</option>)}
                                        </select>
                                        <input className="w-full bg-zinc-950 border border-white/5 rounded-lg px-3 py-2 text-[10px] focus:border-cyan-500/50 outline-none text-zinc-300"
                                            value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="300 1234567" />
                                    </div>
                                </div>
                            </div>
                            <button onClick={addPhone} className="w-full bg-white text-black py-2.5 rounded-lg font-bold hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 text-xs">
                                <Plus className="w-3.5 h-3.5" /> DEPLOY NODE
                            </button>
                        </div>

                        <div className="space-y-3">
                            {phones.map(p => {
                                const isEditing = editingPhoneId === p.id;
                                return (
                                    <div key={p.id} className={`flex flex-col p-3 bg-white/5 rounded-xl border group transition-all ${isEditing ? "border-cyan-500/50" : "border-white/5 hover:border-cyan-500/20"}`}>
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <input value={editPhoneForm.label} onChange={ev => setEditPhoneForm(prev => ({ ...prev, label: ev.target.value }))}
                                                        className="w-1/3 bg-zinc-950 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-white" placeholder="Label" />
                                                    <input value={editPhoneForm.number} onChange={ev => setEditPhoneForm(prev => ({ ...prev, number: ev.target.value }))}
                                                        className="w-2/3 bg-zinc-950 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-white" placeholder="Number" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => updatePhone(p.id)} className="flex-1 bg-cyan-500 text-black font-bold py-1.5 rounded-lg text-[9px] uppercase">Save</button>
                                                    <button onClick={() => setEditingPhoneId(null)} className="flex-1 bg-zinc-900 text-zinc-500 font-bold py-1.5 rounded-lg text-[9px] uppercase">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden p-1.5">
                                                        {getContactIcon(p.label, p.number) ? <img src={getContactIcon(p.label, p.number)!} alt="" className="w-full h-full object-contain" /> : <Phone className="w-3.5 h-3.5 text-zinc-600" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">{p.label}</div>
                                                        <div className="text-xs text-zinc-400 font-medium">{p.number}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setEditingPhoneId(p.id); setEditPhoneForm({ label: p.label, number: p.number }) }} className="text-zinc-800 hover:text-cyan-500 p-1.5"><Edit3 className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => deletePhone(p.id)} className="text-zinc-800 hover:text-red-500 p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Socials Section (Full Width) */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-3 italic">
                            <LinkIcon className="w-4 h-4 text-purple-400" /> Web Presence
                        </h3>
                        <p className="text-zinc-500 text-[11px] font-medium">Official profiles with automated node validation.</p>
                    </div>

                    <div className="flex gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 items-end">
                        <div className="flex-[3] space-y-2">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Resource URL</label>
                            <div className="flex items-center gap-3 bg-zinc-950 border border-white/5 rounded-lg px-3 group">
                                <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center p-1 shrink-0">
                                    {getContactIcon("", newSocial.url) ? (
                                        <img src={getContactIcon("", newSocial.url)!} alt="" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    ) : (
                                        <LinkIcon className="w-3.5 h-3.5 text-zinc-700" />
                                    )}
                                </div>
                                <input className="w-full bg-transparent py-2.5 text-[10px] outline-none text-zinc-300"
                                    value={newSocial.url} onChange={e => setNewSocial({ ...newSocial, url: e.target.value })} placeholder="Paste profile URL here (e.g. https://fiverr.com/name)" />
                            </div>
                        </div>
                        <button onClick={addSocial} className="bg-white text-black h-[38px] px-8 rounded-lg font-bold text-[10px] hover:bg-cyan-400 transition-all uppercase tracking-widest shadow-lg active:scale-95 shrink-0">Deploy Link</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {socials.map((s, i) => {
                            const isEditing = editingSocialId === s.id;
                            return (
                                <div key={s.id || i} className={`border p-4 rounded-xl flex flex-col group transition-all shadow-lg ${isEditing ? "border-cyan-500/50 bg-black/60" : "bg-white/5 border-white/5 hover:border-cyan-500/20"}`}>
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <input value={editSocialForm.platform_name} onChange={ev => setEditSocialForm(prev => ({ ...prev, platform_name: ev.target.value }))}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-white" placeholder="Platform Name" />
                                            <input value={editSocialForm.url} onChange={ev => setEditSocialForm(prev => ({ ...prev, url: ev.target.value }))}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-white" placeholder="URL" />
                                            <div className="flex gap-2">
                                                <button onClick={() => updateSocial(s.id)} className="flex-1 bg-cyan-500 text-black font-bold py-1.5 rounded-lg text-[9px] uppercase">Save</button>
                                                <button onClick={() => setEditingSocialId(null)} className="flex-1 bg-zinc-900 text-zinc-500 font-bold py-1.5 rounded-lg text-[9px] uppercase">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 relative overflow-hidden group-hover:border-cyan-500/50 group-hover:bg-cyan-500/5 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                                {(s.logo_url || getContactIcon(s.platform_name, s.url)) ? (
                                                    <img src={getContactIcon(s.platform_name, s.url) || s.logo_url} alt="" className="w-full h-full object-contain transition-transform group-hover:scale-110" onError={(e) => { (e.target as any).src = ''; (e.target as any).style.display = 'none'; }} />
                                                ) : (
                                                    <LinkIcon className="w-4 h-4 text-zinc-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 truncate">
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] leading-none mb-1">{s.platform || "Node"}</p>
                                                <h4 className="text-xs text-white font-bold tracking-tight mb-0.5">{s.platform_name || "Official Link"}</h4>
                                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-zinc-500 truncate block hover:text-cyan-400 font-mono italic">{s.url}</a>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingSocialId(s.id); setEditSocialForm({ platform: s.platform, platform_name: s.platform_name, url: s.url }) }} className="text-zinc-800 hover:text-cyan-500 p-1.5"><Edit3 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => deleteSocial(s.id)} className="text-zinc-800 hover:text-red-500 shrink-0 p-2"><Trash2 className="w-3.5 h-3.5" /></button>
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
