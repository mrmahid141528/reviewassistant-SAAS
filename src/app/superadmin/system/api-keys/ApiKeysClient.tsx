'use client';

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, XCircle, RefreshCw, AlertCircle, KeyRound, Save, Activity } from "lucide-react";
import { savePlatformApiKey, testConnectionAction, deletePlatformApiKey } from "./actions";

type ApiKey = {
    id: string;
    provider: string;
    name: string;
    key: string;
    status: string;
    lastTestedAt: Date | null;
    lastUsedAt?: Date | null;
    lastResponseMs?: number | null;
    lastStatus?: string | null;
    lastModel?: string | null;
    lastTokens?: number | null;
    lastError?: string | null;
}

export default function ApiKeysClient({ initialKeys }: { initialKeys: ApiKey[] }) {
    const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [provider, setProvider] = useState("");
    const [name, setName] = useState("");
    const [apiKey, setApiKey] = useState("");

    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!provider || !apiKey) {
            setError("Provider and API Key are required.");
            return;
        }

        setError("");
        setLoadingId("saving");

        const res = await savePlatformApiKey({ provider, name, key: apiKey });
        if (res.success && res.apiKey) {
            // Update local state by replacing if exists, or adding new
            setKeys(prev => {
                const filtered = prev.filter(k => k.provider !== res.apiKey.provider);
                return [res.apiKey, ...filtered];
            });
            setIsAdding(false);
            setProvider("");
            setName("");
            setApiKey("");
        } else {
            setError(res.error || "Failed to save key.");
        }
        setLoadingId(null);
    };

    const handleTest = async (provider: string, id: string) => {
        setLoadingId(id);
        const res = await testConnectionAction(provider);
        if (res.success || res.status) {
            setKeys(prev => prev.map(k => k.id === id ? { ...k, status: res.status!, lastTestedAt: new Date() } : k));
        } else {
            alert(res.error || "Testing failed.");
        }
        setLoadingId(null);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the API Key: ${name}?`)) return;
        setLoadingId(id);
        const res = await deletePlatformApiKey(id);
        if (res.success) {
            setKeys(prev => prev.filter(k => k.id !== id));
        }
        setLoadingId(null);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-semibold text-slate-900">Configured Connections</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Add Key</>}
                </button>
            </div>

            {isAdding && (
                <div className="p-6 border-b border-slate-200 bg-indigo-50/30">
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <h4 className="font-medium text-slate-800">Add New Connection</h4>
                        {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Provider ID (e.g. gemini)</label>
                                <input value={provider} onChange={e => setProvider(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} className="w-full text-sm rounded-lg border-slate-200" placeholder="gemini" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Friendly Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} className="w-full text-sm rounded-lg border-slate-200" placeholder="Google Gemini AI" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Secret Key</label>
                            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full text-sm rounded-lg border-slate-200" placeholder="AIzaSy..." />
                        </div>
                        <div>
                            <button
                                onClick={handleSave}
                                disabled={loadingId === "saving"}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loadingId === "saving" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save & Deploy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Service</th>
                            <th className="px-6 py-4 font-semibold">Connection</th>
                            <th className="px-6 py-4 font-semibold">Live Integration Diagnostics</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {keys.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <KeyRound className="h-8 w-8 text-slate-300 mb-3" />
                                        <p className="font-medium text-slate-600">No API keys configured</p>
                                        <p className="text-xs mt-1">Application will fallback to hardcoded .env variables</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            keys.map((k) => (
                                <tr key={k.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{k.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Provider: {k.provider}</div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-1 blur-sm hover:blur-none transition-all cursor-pointer">
                                            {k.key.substring(0, 15)}...
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            {k.status === "active" ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
                                                </div>
                                            ) : k.status === "testing" ? (
                                                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Testing</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Deactivated</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-1">
                                            Tested: {k.lastTestedAt ? new Date(k.lastTestedAt).toLocaleDateString() : 'Never'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {k.provider === 'gemini' ? (
                                            <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-3 text-xs shadow-sm w-[320px]">
                                                <div className="flex justify-between items-center pb-2 border-b border-slate-200 mb-2">
                                                    <span className="font-semibold text-slate-800 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-indigo-500" /> AI Generation Telemetry</span>
                                                    <span className="text-[10px] text-slate-500 font-medium bg-white px-1.5 py-0.5 rounded border border-slate-100 shadow-sm">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleTimeString() : 'Pending'}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
                                                    <div className="flex justify-between text-slate-500"><span className="font-medium">Status</span> <span className={k.lastStatus === 'SUCCESS' ? 'text-emerald-600 font-bold' : k.lastStatus ? 'text-rose-600 font-bold' : ''}>{k.lastStatus || 'N/A'}</span></div>
                                                    <div className="flex justify-between text-slate-500"><span className="font-medium">Tokens</span> <span className="text-slate-700">{k.lastTokens || 0}</span></div>
                                                    <div className="flex justify-between text-slate-500"><span className="font-medium">Latency</span> <span className="text-slate-700">{k.lastResponseMs ? ((k.lastResponseMs / 1000).toFixed(2) + 's') : 'N/A'}</span></div>
                                                    <div className="flex justify-between text-slate-500"><span className="font-medium">Model</span> <span className="text-indigo-600 font-mono text-[10px] truncate max-w-[80px]" title={k.lastModel || "N/A"}>{k.lastModel || 'N/A'}</span></div>
                                                </div>
                                                {k.lastError && k.lastError !== 'NONE' && (
                                                    <div className="mt-2.5 text-[10px] text-rose-600 bg-rose-50/80 p-2 rounded border border-rose-100 font-mono break-all max-h-[80px] overflow-y-auto leading-relaxed shadow-inner">
                                                        <span className="font-bold">ERR:</span> {k.lastError}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-400 italic">Live diagnostics not available for this provider</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleTest(k.provider, k.id)}
                                                disabled={loadingId === k.id}
                                                className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold uppercase flex items-center gap-1"
                                                title="Test Connection"
                                            >
                                                {loadingId === k.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                                Test
                                            </button>
                                            <button
                                                onClick={() => handleDelete(k.id, k.name)}
                                                disabled={loadingId === k.id}
                                                className="text-rose-500 hover:text-rose-700 bg-rose-50 p-1.5 rounded"
                                                title="Delete Key"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
