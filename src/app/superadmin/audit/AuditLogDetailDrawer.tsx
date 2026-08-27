'use client'

import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, format } from 'date-fns'

interface DrawerProps {
    log: any | null
    isOpen: boolean
    onClose: () => void
}

export function AuditLogDetailDrawer({ log, isOpen, onClose }: DrawerProps) {
    if (!log) return null

    const isSuccess = log.result === 'success'
    const isWarning = log.result === 'warning'

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="overflow-y-auto sm:max-w-md w-full p-0">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <SheetHeader>
                        <SheetTitle className="text-xl flex items-center justify-between">
                            {log.action}
                            <Badge variant="outline" className={
                                isSuccess ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    isWarning ? "bg-amber-50 text-amber-700 border-amber-200" :
                                        "bg-rose-50 text-rose-700 border-rose-200"
                            }>
                                {isSuccess ? '🟢 Success' : isWarning ? '🟠 Warning' : '🔴 Failed'}
                            </Badge>
                        </SheetTitle>
                    </SheetHeader>
                    <p suppressHydrationWarning className="text-sm text-slate-500 mt-2">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Who Section */}
                    <div className="space-y-1 bg-slate-50 border rounded-md p-4">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Who</p>
                        <p className="font-medium text-slate-900 capitalize">{log.actorType}</p>
                        {log.actorId && <p className="font-mono text-xs text-slate-500">{log.actorId}</p>}
                    </div>

                    {/* What Section */}
                    <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">What Happened</p>
                        <p className="font-medium text-slate-900">{log.action}</p>
                        {log.description && <p className="text-sm text-slate-600 mt-1">{log.description}</p>}
                    </div>

                    <div className="h-px bg-slate-100 w-full my-4" />

                    {/* Target Section */}
                    <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target</p>
                        <p className="font-medium text-slate-900 capitalize">{log.resourceType}</p>
                        {log.resourceId && <p className="font-mono text-xs text-slate-500">{log.resourceId}</p>}
                    </div>

                    {/* Target Business Context if any */}
                    {log.businessId && (
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Record</p>
                            <p className="font-mono text-xs text-slate-500">{log.businessId}</p>
                        </div>
                    )}

                    <div className="h-px bg-slate-100 w-full my-4" />

                    {/* Data / Payload Section */}
                    {(log.beforeData || log.afterData) && (
                        <div className="space-y-4">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">State Changes</p>

                            {log.beforeData && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-700">Before:</p>
                                    <pre className="bg-slate-100 rounded-md p-3 text-xs overflow-x-auto text-slate-600 font-mono">
                                        {JSON.stringify(log.beforeData, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {log.afterData && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-700">After:</p>
                                    <pre className="bg-slate-100 rounded-md p-3 text-xs overflow-x-auto text-slate-600 font-mono">
                                        {JSON.stringify(log.afterData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="h-px bg-slate-100 w-full my-4" />

                    {/* Meta Logs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">When</p>
                            <p className="text-xs text-slate-900 font-medium">{format(new Date(log.createdAt), 'dd MMM yyyy')}</p>
                            <p className="text-xs text-slate-500">{format(new Date(log.createdAt), 'hh:mm a')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">IP Address</p>
                            <p className="font-mono text-xs text-slate-900">{log.ipAddress || 'System Internal'}</p>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Session / Trace ID</p>
                            {log.sessionId && <p className="font-mono text-[11px] text-slate-500 break-all mb-1">SES: {log.sessionId}</p>}
                            <p className="font-mono text-[11px] text-slate-500 break-all">AUD: {log.traceId}</p>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
