"use client";

import { useState, useEffect, useRef } from "react";
import { getTemplates, createTemplate, deleteTemplate } from "./actions";
import { Upload, X, Trash2, LayoutTemplate, PlusCircle } from "lucide-react";

export default function TemplatesAdminPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("Restaurant");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = ["Restaurant", "Cafe", "Hotel", "Salon", "Retail", "Services", "All"];

    useEffect(() => {
        loadTemplates();
    }, []);

    async function loadTemplates() {
        setLoading(true);
        const res = await getTemplates();
        if (res.success) {
            setTemplates(res.templates || []);
        }
        setLoading(false);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Convert to base64 for MVP storage
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !imagePreview || !category) return;

        setIsUploading(true);
        const res = await createTemplate({ name, category, imageUrl: imagePreview });
        if (res.success) {
            setName("");
            setCategory("Restaurant");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            loadTemplates();
        }
        setIsUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        const res = await deleteTemplate(id);
        if (res.success) {
            loadTemplates();
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <LayoutTemplate className="w-8 h-8 text-blue-600" />
                    Template Assets CMS
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Upload and manage background graphic overlays for the Template Marketplace.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-1 border border-slate-200 bg-white rounded-2xl shadow-sm p-6 shrink-0 h-max sticky top-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-slate-400" /> Add New Template
                    </h2>

                    <form onSubmit={handleUploadTemplate} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Template Name</label>
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full h-11 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="e.g. Modern Pink Poster"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                            <select
                                required
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full h-11 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Template Graphic (PNG/JPG/SVG)</label>
                            {imagePreview ? (
                                <div className="relative border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50 p-2 flex items-center justify-center min-h-[300px]">
                                    <img src={imagePreview} className="max-w-full max-h-[300px] object-contain rounded drop-shadow-md" />
                                    <button
                                        type="button"
                                        onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/png, image/jpeg, image/svg+xml"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="template-upload"
                                    />
                                    <label htmlFor="template-upload" className="flex flex-col items-center justify-center w-full h-[200px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:border-slate-400">
                                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                                        <span className="font-semibold text-sm">Click to upload template</span>
                                        <span className="text-xs mt-1">Recommended: 4x6 / A4 scale</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={!name || !imagePreview || !category || isUploading}
                            className="w-full h-11 bg-slate-900 hover:bg-black text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isUploading ? "Uploading Data..." : (
                                <>Publish to Marketplace <Upload className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>

                {/* Templates Grid */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-slate-400 font-medium animate-pulse">Loading templates...</div>
                    ) : templates.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                            <LayoutTemplate className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="font-semibold text-slate-500">No templates uploaded yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {templates.map(tpl => (
                                <div key={tpl.id} className="group bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative pb-14 aspect-[3/4] flex flex-col">
                                    <div className="w-full flex-1 relative overflow-hidden bg-slate-100/50 p-2 border-b border-slate-100 flex items-center justify-center">
                                        <img src={tpl.imageUrl} alt={tpl.name} className="max-w-full max-h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500 ease-out" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full bg-white h-14 px-3 flex items-center justify-between z-10">
                                        <div className="flex-1 w-0 pr-2">
                                            <p className="font-bold text-slate-900 text-[13px] truncate">{tpl.name}</p>
                                            <p className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">{tpl.category}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(tpl.id)}
                                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
