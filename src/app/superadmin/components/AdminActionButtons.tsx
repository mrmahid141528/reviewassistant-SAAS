"use client"
import { useTransition } from 'react'

export function AdminActionButtons({
    id,
    currentStatus,
    type,
    toggleAction,
    deleteAction
}: {
    id: string
    currentStatus: string
    type: 'user' | 'business'
    toggleAction: (formData: FormData) => Promise<void>
    deleteAction: (formData: FormData) => Promise<void>
}) {
    const [isPending, startTransition] = useTransition()

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
        if (!confirm(`Are you sure you want to permanently delete this ${type}? All associated data will be wiped permanently. This cannot be undone.`)) {
            return
        }
        startTransition(async () => {
            const formData = new FormData()
            if (type === 'user') formData.append('userId', id)
            if (type === 'business') formData.append('businessId', id)
            await deleteAction(formData)
        })
    }

    return (
        <div className="flex justify-end gap-2">
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
        </div>
    )
}
