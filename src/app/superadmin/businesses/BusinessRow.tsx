'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

export function BusinessRow({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const router = useRouter();
    return (
        <tr
            onClick={() => router.push(`/superadmin/businesses/${id}`)}
            className={`cursor-pointer hover:bg-slate-50 transition-colors group ${className || ''}`}
        >
            {children}
        </tr>
    );
}
