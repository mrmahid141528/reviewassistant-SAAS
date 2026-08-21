"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export function ActionForm({ action, children, ...props }: any) {
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <form action={async (formData) => {
            const res = await action(formData);
            if (res?.error) setToast({ message: res.error, type: 'error' });
            else if (res?.success) setToast({ message: res.message || "Saved successfully!", type: 'success' });
            else setToast({ message: "Action completed", type: 'success' }); // Fallback
        }} {...props}>
            {children}

            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    {toast.message}
                </div>
            )}
        </form>
    );
}
