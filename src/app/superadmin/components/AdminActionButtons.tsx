"use client"
import { useTransition, useState, useEffect, useRef } from 'react'
import { MoreHorizontal, Edit, Key, Power, Trash2 } from 'lucide-react'

export function AdminActionButtons({
    id,
    currentStatus,
    type,
    userEmail,
    userName,
    toggleAction,
    deleteAction,
    editAction,
    resetPasswordAction
}: {
    id: string
    currentStatus: string
    type: 'user' | 'business'
    userEmail?: string
    userName?: string
    toggleAction: (formData: FormData) => Promise<void>
    deleteAction: (formData: FormData) => Promise<void>
    editAction?: (formData: FormData) => Promise<void>
    resetPasswordAction?: (formData: FormData) => Promise<void>
}) {
    const [isPending, startTransition] = useTransition()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isResetting, setIsResetting] = useState(false)

    const menuRef = useRef<HTMLDivElement>(null)
    const [editName, setEditName] = useState(userName || '')
    const [editEmail, setEditEmail] = useState(userEmail || '')
    const [newPassword, setNewPassword] = useState('')

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleToggle = () => {
        startTransition(async () => {
            const formData = new FormData()
            if (type === 'user') formData.append('userId', id)
            if (type === 'business') formData.append('businessId', id)
            formData.append('currentStatus', currentStatus)
            await toggleAction(formData)
        })
    }

    const handleDelete = () => {
        if (!confirm(`Are you sure you want to permanently delete this ${type}? All associated data will be wiped permanently.`)) return
        startTransition(async () => {
            const formData = new FormData()
            if (type === 'user') formData.append('userId', id)
            if (type === 'business') formData.append('businessId', id)
            await deleteAction(formData)
        })
    }

    const handleEditSave = () => {
        if (!editAction) return
        startTransition(async () => {
            const formData = new FormData()
            formData.append('userId', id)
            formData.append('name', editName)
            formData.append('email', editEmail)
            await editAction(formData)
            setIsEditing(false)
        })
    }

    const handlePasswordReset = () => {
        if (!newPassword || newPassword.length < 6) {
            alert("Password must be at least 6 characters")
            return
        }
        if (!resetPasswordAction) return
        startTransition(async () => {
            const formData = new FormData()
            formData.append('userId', id)
            formData.append('password', newPassword)
            await resetPasswordAction(formData)
            setIsResetting(false)
            setNewPassword('')
            alert("Password updated successfully!")
        })
    }

    return (
        <div className="flex justify-end gap-2 relative">
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors text-muted-foreground"
                >
                    <MoreHorizontal className="w-5 h-5" />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        {type === 'user' && (
                            <>
                                <button
                                    onClick={() => { setIsMenuOpen(false); setIsEditing(true); }}
                                    disabled={isPending}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4 text-blue-600" />
                                    Edit Account
                                </button>
                                <button
                                    onClick={() => { setIsMenuOpen(false); setIsResetting(true); }}
                                    disabled={isPending}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Key className="w-4 h-4 text-purple-600" />
                                    Reset Password
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => { setIsMenuOpen(false); handleToggle(); }}
                            disabled={isPending}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${currentStatus === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                            <Power className="w-4 h-4" />
                            {currentStatus === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                            onClick={() => { setIsMenuOpen(false); handleDelete(); }}
                            disabled={isPending}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Force Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Modal Native Equivalent */}
            {isEditing && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] text-left">
                        <h3 className="text-lg font-bold mb-4 text-foreground">Edit User Account</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full mt-1 border rounded-md px-3 py-2 text-sm text-foreground" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
                                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email" className="w-full mt-1 border rounded-md px-3 py-2 text-sm text-foreground" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
                            <button onClick={handleEditSave} disabled={isPending} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md transition-all">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal Native Equivalent */}
            {isResetting && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] text-left">
                        <h3 className="text-lg font-bold mb-2 text-foreground">Force Password Reset</h3>
                        <p className="text-sm text-muted-foreground mb-4">Set a strong manual override password for this user below.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">New Password</label>
                                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="text" placeholder="e.g. TempPass123!" className="w-full mt-1 border rounded-md px-3 py-2 text-sm text-foreground" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsResetting(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
                            <button onClick={handlePasswordReset} disabled={isPending} className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-all">Force Change</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
