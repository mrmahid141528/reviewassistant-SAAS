"use client"

import { useState, useTransition } from "react"
import { updateSuperAdminProfile } from "./actions"

export function SettingsClient({ initialName, email }: { initialName: string, email: string }) {
    const [name, setName] = useState(initialName)
    const [password, setPassword] = useState("")
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        startTransition(async () => {
            const fd = new FormData()
            fd.append("name", name)
            fd.append("password", password)

            try {
                await updateSuperAdminProfile(fd)
                setPassword("")
                alert("Profile settings have been updated successfully.")
            } catch (err) {
                alert("An error occurred while updating settings.")
            }
        })
    }

    return (
        <div className="border rounded-lg bg-white shadow-sm overflow-hidden p-6 space-y-6">
            <div>
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full mt-2 border rounded-md px-4 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">SuperAdmin emails cannot be changed directly via standard layout.</p>
            </div>

            <div>
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full mt-2 border rounded-md px-4 py-2"
                />
            </div>

            <div className="pt-4 border-t">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Reset Account Password (Optional)</label>
                <input
                    type="password"
                    value={password}
                    placeholder="Leave blank to keep current password"
                    onChange={e => setPassword(e.target.value)}
                    className="w-full mt-2 border rounded-md px-4 py-2"
                />
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-primary text-primary-foreground font-medium px-6 py-2 rounded-md hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    {isPending ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </div>
    )
}
