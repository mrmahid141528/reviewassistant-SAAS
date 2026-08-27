'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, CircleDot, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuditLogDetailDrawer } from './AuditLogDetailDrawer'
import { useDebouncedCallback } from 'use-debounce'

interface AuditLogClientProps {
    initialLogs: any[]
    initialKpis: { totalEvents: number; todayEvents: number; warningEvents: number; errorEvents: number }
}

export function AuditLogClient({ initialLogs, initialKpis }: AuditLogClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [logs, setLogs] = useState<any[]>(initialLogs)
    const [kpis, setKpis] = useState(initialKpis)

    // Realtime States
    const [isLive, setIsLive] = useState(true)
    const [newPendingLogs, setNewPendingLogs] = useState<any[]>([])

    // Detail Drawer States
    const [selectedLog, setSelectedLog] = useState<any | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Initialize Supabase Realtime on component mount
    useEffect(() => {
        if (!isLive) return

        const channel = supabase.channel('audit_log_realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_logs' },
                (payload) => {
                    const newLog = payload.new
                    setNewPendingLogs(prev => [newLog, ...prev])
                }
            )
            .subscribe((status) => {
                if (status !== 'SUBSCRIBED') {
                    // Fallback to polling or show disconnected state if needed, but for now we rely on the sub
                    console.log("Supabase Realtime Status:", status)
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [isLive, supabase])

    // Load new pending logs explicitly
    const handleLoadNewLogs = () => {
        setLogs(prev => [...newPendingLogs, ...prev])
        setKpis(prev => ({ ...prev, totalEvents: prev.totalEvents + newPendingLogs.length, todayEvents: prev.todayEvents + newPendingLogs.length }))
        setNewPendingLogs([])
    }

    // Filter handling
    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`?${params.toString()}`)
    }, [router, searchParams])

    const handleSearch = useDebouncedCallback((term: string) => {
        updateFilter('search', term)
    }, 500)

    const openDrawer = (log: any) => {
        setSelectedLog(log)
        setIsDrawerOpen(true)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header section with KPIs and Live states */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Audit Trail</h1>
                    <p className="text-muted-foreground mt-1">Immutable ledger of all critical changes and activity across your SaaS.</p>
                </div>

                <div className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-lg p-1.5 flex-none">
                    <Button variant="ghost" size="sm" className="h-8 gap-2 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsLive(!isLive)}>
                        <CircleDot className={`h-3.5 w-3.5 ${isLive ? 'text-emerald-500 animate-pulse' : 'text-slate-300'}`} />
                        <span className="text-sm font-medium">{isLive ? 'Live' : 'Paused'}</span>
                    </Button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <Button variant="ghost" size="sm" className="h-8 gap-2 px-3 text-slate-600">
                        <Download className="h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-500 font-medium">Total Events</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{kpis.totalEvents.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-500 font-medium">Today</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{kpis.todayEvents.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <p className="text-sm text-amber-600 font-medium">Warnings</p>
                        <p className="text-3xl font-bold text-amber-700 mt-2">{kpis.warningEvents.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <p className="text-sm text-rose-600 font-medium">Errors</p>
                        <p className="text-3xl font-bold text-rose-700 mt-2">{kpis.errorEvents.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            {/* If New Pending Logs show a chip */}
            {newPendingLogs.length > 0 && (
                <div className="w-full flex justify-center sticky top-4 z-40">
                    <Button
                        onClick={handleLoadNewLogs}
                        size="sm"
                        variant="secondary"
                        className="shadow-lg border border-slate-200 gap-2 bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 animate-in slide-in-from-top-4"
                    >
                        <CircleDot className="h-4 w-4 animate-pulse" />
                        {newPendingLogs.length} new activities. Click to load.
                    </Button>
                </div>
            )}

            {/* Table & Filters */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search logs by Business, Action, or Trace ID..."
                            className="pl-9 bg-white"
                            defaultValue={searchParams.get('search') ?? ''}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <Select onValueChange={(val) => updateFilter('action', val || '')} value={searchParams.get('action') ?? 'all'}>
                            <SelectTrigger className="w-[140px] bg-white"><SelectValue placeholder="All Actions" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="Login">Login</SelectItem>
                                <SelectItem value="Logout">Logout</SelectItem>
                                <SelectItem value="Created">Created</SelectItem>
                                <SelectItem value="Updated">Updated</SelectItem>
                                <SelectItem value="Deleted">Deleted</SelectItem>
                                <SelectItem value="Settings">Settings</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select onValueChange={(val) => updateFilter('actorType', val || '')} value={searchParams.get('actorType') ?? 'all'}>
                            <SelectTrigger className="w-[130px] bg-white"><SelectValue placeholder="All Actors" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actors</SelectItem>
                                <SelectItem value="superadmin">Superadmin</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="business_owner">Business Owner</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                                <SelectItem value="system_worker">System Worker</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select onValueChange={(val) => updateFilter('result', val || '')} value={searchParams.get('result') ?? 'all'}>
                            <SelectTrigger className="w-[130px] bg-white"><SelectValue placeholder="All Results" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Results</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select onValueChange={(val) => updateFilter('resourceType', val || '')} value={searchParams.get('resourceType') ?? 'all'}>
                            <SelectTrigger className="w-[140px] bg-white"><SelectValue placeholder="All Resources" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Resources</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="subscription">Subscription</SelectItem>
                                <SelectItem value="system">System Settings</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs font-medium text-slate-500 w-[120px]">Time</TableHead>
                                <TableHead className="text-xs font-medium text-slate-500 min-w-[200px]">Activity</TableHead>
                                <TableHead className="text-xs font-medium text-slate-500 min-w-[150px]">Performed By</TableHead>
                                <TableHead className="text-xs font-medium text-slate-500 min-w-[180px]">Target</TableHead>
                                <TableHead className="text-xs font-medium text-slate-500 text-right">Result</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        No audit logs found for standard filters.
                                    </TableCell>
                                </TableRow>
                            ) : logs.map((log) => {
                                const isSuccess = log.result === 'success'
                                const isWarning = log.result === 'warning'
                                const isError = log.result === 'failed'

                                return (
                                    <TableRow
                                        key={log.id}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => openDrawer(log)}
                                    >
                                        <TableCell suppressHydrationWarning className="text-xs text-slate-500 whitespace-nowrap align-top">
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <p className="text-[13px] font-semibold text-slate-900">{log.action}</p>
                                            {log.description && (
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{log.description}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <p className="text-xs font-medium text-slate-700 capitalize">{log.actorType}</p>
                                            {log.actorId && (
                                                <p className="text-[10px] font-mono text-slate-400 mt-0.5 max-w-[120px] truncate">{log.actorId}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <p className="text-xs font-medium text-slate-700 capitalize">{log.resourceType}</p>
                                            {log.resourceId && (
                                                <p className="text-[10px] font-mono text-slate-400 mt-0.5 max-w-[150px] truncate">{log.resourceId}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="align-top text-right">
                                            <div className="flex justify-end">
                                                {isSuccess && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2 gap-1.5"><CheckCircle2 className="h-3 w-3" /> Success</Badge>}
                                                {isWarning && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-2 gap-1.5"><AlertTriangle className="h-3 w-3" /> Warning</Badge>}
                                                {isError && <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 px-2 gap-1.5"><XCircle className="h-3 w-3" /> Error</Badge>}
                                                {!isSuccess && !isWarning && !isError && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-2 gap-1.5"><Info className="h-3 w-3" /> Info</Badge>}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AuditLogDetailDrawer
                log={selectedLog}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    )
}
