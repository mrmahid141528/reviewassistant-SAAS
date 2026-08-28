"use client"

import { useState, useTransition } from "react"
import { saveLegalPage, deleteLegalPage } from "./actions"
import { Edit, Trash2, Plus, ExternalLink } from "lucide-react"

type PageType = {
    id: string
    title: string
    slug: string
    content: string
    status: string
}

export function CMSClient({ initialPages }: { initialPages: PageType[] }) {
    const [isPending, startTransition] = useTransition()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editData, setEditData] = useState<PageType | null>(null)

    const openCreate = () => {
        setEditData({ id: "", title: "", slug: "", content: "", status: "published" })
        setIsModalOpen(true)
    }

    const openEdit = (page: PageType) => {
        setEditData(page)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (!editData) return
        startTransition(async () => {
            const fd = new FormData()
            if (editData.id) fd.append("id", editData.id)
            fd.append("title", editData.title)
            fd.append("slug", editData.slug)
            fd.append("content", editData.content)
            fd.append("status", editData.status)

            try {
                await saveLegalPage(fd)
                setIsModalOpen(false)
            } catch (err: any) {
                alert(err.message || "Failed to save page")
            }
        })
    }

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this page permanently?")) return
        startTransition(async () => {
            const fd = new FormData()
            fd.append("id", id)
            await deleteLegalPage(fd)
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" /> New Page
                </button>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full block">
                    <table className="w-full text-sm text-left hidden md:table">
                        <thead className="text-xs text-muted-foreground bg-gray-50/50 uppercase border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Title</th>
                                <th className="px-6 py-4 font-semibold">URL Slug</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y mt-2">
                            {initialPages.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{p.title}</td>
                                    <td className="px-6 py-4 font-mono text-xs">/legal/{p.slug}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                                        <a href={`/legal/${p.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button onClick={() => openEdit(p)} disabled={isPending} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} disabled={isPending} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {initialPages.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No pages found. Create one.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Mobile Card List View (Option A) */}
                    <div className="md:hidden flex flex-col divide-y divide-slate-100">
                        {initialPages.map(p => (
                            <div key={p.id} className="p-4 flex flex-col gap-3 bg-white hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-slate-900">{p.title}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">/legal/{p.slug}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {p.status}
                                    </span>
                                </div>
                                <div className="flex justify-end pt-2 border-t mt-2 gap-3">
                                    <a href={`/legal/${p.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button onClick={() => openEdit(p)} disabled={isPending} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} disabled={isPending} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {initialPages.length === 0 && (
                            <div className="px-6 py-8 text-center text-muted-foreground">No pages found. Create one.</div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && editData && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                        <h3 className="text-xl font-bold mb-4 shrink-0">{editData.id ? 'Edit Page' : 'Create Custom Page'}</h3>

                        <div className="flex-1 overflow-y-auto pr-2 pb-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Page Title</label>
                                    <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} className="w-full mt-1 border rounded-md px-3 py-2 text-sm" placeholder="e.g. Privacy Policy" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">URL Slug</label>
                                    <input value={editData.slug} onChange={e => setEditData({ ...editData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} className="w-full mt-1 border rounded-md px-3 py-2 text-sm font-mono" placeholder="e.g. privacy-policy" />
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col mb-4 min-h-[300px]">
                                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1">Page Content (HTML/Markdown acceptable)</label>
                                <textarea
                                    value={editData.content}
                                    onChange={e => setEditData({ ...editData, content: e.target.value })}
                                    className="w-full flex-1 border rounded-md px-3 py-2 text-sm font-mono resize-none"
                                    placeholder="Write your policy text here... <h1>Header</h1> etc."
                                />
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Publish Status</label>
                                <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })} className="w-full mt-1 border rounded-md px-3 py-2 text-sm">
                                    <option value="published">Published (Live)</option>
                                    <option value="draft">Draft (Hidden)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4 shrink-0 pt-4 border-t">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
                            <button onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:opacity-90 transition-all">{isPending ? 'Saving...' : 'Save Page'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
