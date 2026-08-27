'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldAlert, ShieldCheck, Lock, Key, AlertOctagon, UserX, Activity, GlobeLock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDistanceToNow } from 'date-fns'
import { revokeSession, revokeAllOtherSessions, blockIP, unblockIP, toggleLockdownMode } from './actions'

type SecurityEvent = any;
type AdminSession = any;
type BlockedIP = any;
type SecuritySetting = any;

interface SecurityDashboardClientProps {
    metrics: {
        activeSessions: number;
        failedLogins: number;
        lockedAccounts: number;
        systemStatus: string;
    };
    failedLogins: SecurityEvent[];
    activeSessions: AdminSession[];
    blockedIPs: BlockedIP[];
    settings: SecuritySetting;
}

export function SecurityDashboardClient({
    metrics,
    failedLogins,
    activeSessions,
    blockedIPs,
    settings
}: SecurityDashboardClientProps) {

    const [ipToBlock, setIpToBlock] = React.useState("")
    const [isPending, startTransition] = React.useTransition()

    const handleRevoke = (id: string) => {
        startTransition(async () => {
            await revokeSession(id)
        })
    }

    const handleRevokeAll = () => {
        if (confirm("This will sign out all other admin sessions. Your current session will remain active.")) {
            startTransition(async () => {
                await revokeAllOtherSessions()
            })
        }
    }

    const handleBlockIp = () => {
        if (ipToBlock.trim()) {
            startTransition(async () => {
                await blockIP(ipToBlock.trim(), 'Brute force / Suspicious')
                setIpToBlock("")
            })
        }
    }

    const handleUnblockIp = (ip: string) => {
        startTransition(async () => {
            await unblockIP(ip)
        })
    }

    const handleToggleLockdown = () => {
        startTransition(async () => {
            await toggleLockdownMode(!settings.lockdownEnabled)
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Security Operations Center</h1>
                <p className="text-muted-foreground mt-1">Real-time threat monitoring, access control, and active session management.</p>
            </div>

            {/* TOP KPI CARDS */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="shadow-sm border-slate-200 bg-slate-900 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-300">System Status</CardTitle>
                        {metrics.systemStatus === 'Secure' ? (
                            <ShieldCheck className="h-5 w-5 text-emerald-400" />
                        ) : (
                            <ShieldAlert className="h-5 w-5 text-rose-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{metrics.systemStatus}</div>
                        <p className="text-xs text-slate-400 mt-1">Authentication perimeter</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Active Admin Sessions</CardTitle>
                        <Key className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{metrics.activeSessions}</div>
                        <p className="text-xs text-slate-500 mt-1">Currently running</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-rose-700">Failed Login Attempts</CardTitle>
                        <AlertOctagon className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{metrics.failedLogins}</div>
                        <p className="text-xs text-slate-500 mt-1">Past 24 hours</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[13px] font-semibold text-slate-600">Locked Accounts</CardTitle>
                        <Lock className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{metrics.lockedAccounts}</div>
                        <p className="text-xs text-slate-500 mt-1">Temporarily locked</p>
                    </CardContent>
                </Card>
            </div>

            {/* MIDDLE: Alerts & Sessions */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                            <AlertOctagon className="h-5 w-5 text-rose-500" /> Authentication Alerts
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">Recent failed login attempts & suspicious activity.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 max-h-[400px] overflow-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs text-slate-500">Time</TableHead>
                                    <TableHead className="text-xs text-slate-500">Email/User</TableHead>
                                    <TableHead className="text-xs text-slate-500">Event</TableHead>
                                    <TableHead className="text-xs text-slate-500">IP</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {failedLogins.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-sm py-4 text-slate-500">
                                            No alerts recorded.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {failedLogins.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-[12px] text-slate-500 whistespace-nowrap">
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-[12px] font-medium">{log.email || 'Unknown'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 whitespace-nowrap">
                                                {log.event}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-[11px] text-slate-600">{log.ipAddress}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                            <Key className="h-5 w-5 text-slate-500" /> Active Sessions
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">Currently active admin and superadmin sessions.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 max-h-[400px] overflow-auto">
                        {activeSessions.length === 0 && (
                            <p className="text-sm text-center text-slate-500 py-4">No active sessions found.</p>
                        )}
                        {activeSessions.map(session => (
                            <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50/50 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900 text-sm">
                                            {session.user?.name || session.user?.email || 'Unknown User'}
                                        </span>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] h-5">
                                            Active
                                        </Badge>
                                    </div>
                                    <div className="text-[12px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                                        <span>IP: <span className="font-mono">{session.ipAddress}</span></span>
                                        <span>Last active: {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 line-clamp-1" title={session.userAgent}>
                                        {session.userAgent}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 shrink-0"
                                    onClick={() => handleRevoke(session.id)}
                                    disabled={isPending}
                                >
                                    Revoke
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* BOTTOM: Controls & Blocked IPs */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                            <Lock className="h-5 w-5 text-slate-500" /> Access & Security Controls
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">Manual control over access restrictions and emergencies.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">

                        {/* Revoke All */}
                        <div className="flex items-center justify-between border-b pb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <Key className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">Revoke All Other Sessions</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Sign out all other active admin sessions except this one.</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRevokeAll}
                                disabled={isPending}
                            >
                                Execute
                            </Button>
                        </div>

                        {/* Block IP */}
                        <div className="border-b pb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <GlobeLock className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">Block IP Address</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Prevent a specific IP from accessing admin logins.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 items-end ml-13 pl-1">
                                <div className="space-y-1.5 flex-1 max-w-[200px]">
                                    <Label className="text-xs text-slate-500">IP Address</Label>
                                    <Input
                                        placeholder="e.g. 45.33.12.94"
                                        value={ipToBlock}
                                        onChange={(e) => setIpToBlock(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    onClick={handleBlockIp}
                                    disabled={!ipToBlock.trim() || isPending}
                                >
                                    Block ID
                                </Button>
                            </div>
                        </div>

                        {/* Lockdown Mode */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                    <ShieldAlert className="h-5 w-5 text-rose-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">Lockdown Mode</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Disable new admin logins temporarily. Active sessions remain unaffected.</p>
                                </div>
                            </div>
                            <Button
                                variant={settings.lockdownEnabled ? "destructive" : "outline"}
                                size="sm"
                                onClick={handleToggleLockdown}
                                disabled={isPending}
                            >
                                {settings.lockdownEnabled ? "Disable Lockdown" : "Enable Lockdown"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                            <GlobeLock className="h-5 w-5 text-slate-500" /> Blocked IP Addresses
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">IP Addresses permanently blocked from accessing the system.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 max-h-[400px] overflow-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs text-slate-500">IP Address</TableHead>
                                    <TableHead className="text-xs text-slate-500">Reason</TableHead>
                                    <TableHead className="text-xs text-slate-500">Status</TableHead>
                                    <TableHead className="text-xs text-slate-500 text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blockedIPs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-sm py-4 text-slate-500">
                                            No IPs are currently blocked.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {blockedIPs.map((b) => (
                                    <TableRow key={b.id}>
                                        <TableCell className="font-mono text-[12px] text-slate-700">{b.ipAddress}</TableCell>
                                        <TableCell className="text-[12px] text-slate-500">{b.reason}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={b.status === 'blocked' ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>
                                                {b.status === 'blocked' ? 'Blocked' : 'Unblocked'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {b.status === 'blocked' && (
                                                <button
                                                    className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                                                    disabled={isPending}
                                                    onClick={() => handleUnblockIp(b.ipAddress)}
                                                >
                                                    Unblock
                                                </button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
