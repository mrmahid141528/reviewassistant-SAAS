'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, ShieldAlert, Key, Bell, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateSecuritySettings } from '../actions'

type SecuritySetting = any;

interface SecuritySettingsClientProps {
    settings: SecuritySetting
}

export function SecuritySettingsClient({ settings }: SecuritySettingsClientProps) {
    const [isPending, startTransition] = React.useTransition()
    const [formData, setFormData] = React.useState({
        // Auth
        admin2faEnabled: settings.admin2faEnabled,
        sessionTimeout: settings.sessionTimeout,
        maxLoginAttempts: settings.maxLoginAttempts,
        accountLockDuration: settings.accountLockDuration,
        // Login Sec
        loginNotification: settings.loginNotification,
        newDeviceNotification: settings.newDeviceNotification,
        suspiciousLoginDetect: settings.suspiciousLoginDetect,
        // Session
        maxConcurrentSessions: settings.maxConcurrentSessions,
        revokeOnPasswordChange: settings.revokeOnPasswordChange,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: parseInt(e.target.value) || 0
        }))
    }

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }))
    }

    const handleSave = () => {
        startTransition(async () => {
            await updateSecuritySettings(formData)
            alert("Security settings saved successfully.")
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Security Settings</h1>
                <p className="text-muted-foreground mt-1">Configure global authentication, session limits, and security notifications.</p>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-slate-500" /> Authentication
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">Policies governing admin login attempts and requirements.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between border-b pb-6">
                        <div className="space-y-0.5 max-w-[400px]">
                            <Label className="text-base text-slate-900 font-semibold">Admin 2FA</Label>
                            <p className="text-sm text-slate-500">Require Two-Factor Authentication for all admin and superadmin logins.</p>
                        </div>
                        <Switch
                            checked={formData.admin2faEnabled}
                            onCheckedChange={(c) => handleSwitchChange('admin2faEnabled', c)}
                            disabled={isPending}
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5 flex-1">
                            <Label className="text-sm font-medium text-slate-700">Max Login Attempts</Label>
                            <Input
                                type="number"
                                name="maxLoginAttempts"
                                value={formData.maxLoginAttempts}
                                onChange={handleChange}
                                disabled={isPending}
                            />
                            <p className="text-[11px] text-slate-500">Failed attempts before locking.</p>
                        </div>
                        <div className="space-y-1.5 flex-1">
                            <Label className="text-sm font-medium text-slate-700">Account Lock Duration (Minutes)</Label>
                            <Input
                                type="number"
                                name="accountLockDuration"
                                value={formData.accountLockDuration}
                                onChange={handleChange}
                                disabled={isPending}
                            />
                            <p className="text-[11px] text-slate-500">Time until auto-unlock.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                        <Key className="h-5 w-5 text-slate-500" /> Session Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6 pb-6 border-b">
                        <div className="space-y-1.5 flex-1">
                            <Label className="text-sm font-medium text-slate-700">Session Timeout (Minutes)</Label>
                            <Input
                                type="number"
                                name="sessionTimeout"
                                value={formData.sessionTimeout}
                                onChange={handleChange}
                                disabled={isPending}
                            />
                            <p className="text-[11px] text-slate-500">Inactivity required before auto logout.</p>
                        </div>
                        <div className="space-y-1.5 flex-1">
                            <Label className="text-sm font-medium text-slate-700">Max Concurrent Sessions</Label>
                            <Input
                                type="number"
                                name="maxConcurrentSessions"
                                value={formData.maxConcurrentSessions}
                                onChange={handleChange}
                                disabled={isPending}
                            />
                            <p className="text-[11px] text-slate-500">Maximum devices logged in simultaneously per admin.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 max-w-[400px]">
                            <Label className="text-sm font-medium text-slate-900">Revoke sessions on password change</Label>
                            <p className="text-[11px] text-slate-500">Automatically sign out all other active sessions when an admin resets their password.</p>
                        </div>
                        <Switch
                            checked={formData.revokeOnPasswordChange}
                            onCheckedChange={(c) => handleSwitchChange('revokeOnPasswordChange', c)}
                            disabled={isPending}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-slate-500" /> Login Security Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between border-b pb-6">
                        <div className="space-y-0.5 max-w-[400px]">
                            <Label className="text-sm font-medium text-slate-900">New Device Notification</Label>
                            <p className="text-[11px] text-slate-500">Email superadmins when a login is detected from an unrecognized IP or device.</p>
                        </div>
                        <Switch
                            checked={formData.newDeviceNotification}
                            onCheckedChange={(c) => handleSwitchChange('newDeviceNotification', c)}
                            disabled={isPending}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 max-w-[400px]">
                            <Label className="text-sm font-medium text-slate-900">Suspicious Login Detection</Label>
                            <p className="text-[11px] text-slate-500">Automatically flag and notify superadmins of sequential failed authentication attempts.</p>
                        </div>
                        <Switch
                            checked={formData.suspiciousLoginDetect}
                            onCheckedChange={(c) => handleSwitchChange('suspiciousLoginDetect', c)}
                            disabled={isPending}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline">Reset Defaults</Button>
                <Button onClick={handleSave} disabled={isPending} className="px-8">
                    {isPending ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>
    )
}
