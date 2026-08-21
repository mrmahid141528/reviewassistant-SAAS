"use client"
import { useTransition, useState } from 'react'

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
    const [isEditing, setIsEditing] = useState(false)
    const [isResetting, setIsResetting] = useState(false)

    // UI states for new values
    const [editName, setEditName] = useState(userName || '')
    const [editEmail, setEditEmail] = useState(userEmail || '')
    const [newPassword, setNewPassword] = useState('')

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
            {type === 'user' && (
                <>
                    <button
                        onClick={() => setIsEditing(true)}
                        disabled={isPending}
                        className="text-xs px-3 py-1 rounded border text-blue-600 border-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setIsResetting(true)}
                        disabled={isPending}
                        className="text-xs px-3 py-1 rounded border text-purple-600 border-purple-600 hover:bg-purple-50 disabled:opacity-50"
                    >
                        Reset Password
                    </button>
                </>
            )}

            <button
                onClick={handleToggle}
                disabled={isPending}
                className={`text-xs px-3 py-1 rounded border disabled:opacity-50 ${currentStatus === 'active' ? 'text-amber-600 border-amber-600 hover:bg-amber-50' : 'text-emerald-600 border-emerald-600 hover:bg-emerald-50'}`}
            >
                {currentStatus === 'active' ? 'Suspend' : 'Activate'}
            </button>
            <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs px-3 py-1 rounded border text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
            >
                Force Delete
            </button>

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
