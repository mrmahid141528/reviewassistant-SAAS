import prisma from "@/lib/prisma";
import { toggleUserStatus, deleteUser, editUser, resetUserPassword } from "../actions";
import { AdminActionButtons } from "../components/AdminActionButtons";

export const dynamic = "force-dynamic";

export default async function SuperAdminUsers() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Users Directory</h1>
                <p className="text-muted-foreground mt-1">Manage all registered users on the platform.</p>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full block">
                    {/* Desktop Table View */}
                    <table className="w-full text-sm text-left hidden md:table">
                        <thead className="text-xs text-muted-foreground bg-gray-50/50 uppercase border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Joined at</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{u.id.substring(0, 8)}...</td>
                                    <td className="px-6 py-4 font-medium">{u.email || "No Email"}</td>
                                    <td className="px-6 py-4">{u.name || "N/A"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{u.createdAt.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <AdminActionButtons
                                            id={u.id}
                                            currentStatus={u.status}
                                            type="user"
                                            userEmail={u.email || ""}
                                            userName={u.name || ""}
                                            toggleAction={toggleUserStatus}
                                            deleteAction={deleteUser}
                                            editAction={editUser}
                                            resetPasswordAction={resetUserPassword}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Mobile Card List View (Option A) */}
                    <div className="md:hidden flex flex-col divide-y divide-slate-100">
                        {users.map(u => (
                            <div key={u.id} className="p-4 flex flex-col gap-3 bg-white hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold text-slate-900">{u.name || "N/A"}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{u.email || "No Email"}</div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-1">ID: {u.id.substring(0, 8)}...</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {u.status}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{u.createdAt.toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2 border-t mt-2">
                                    <AdminActionButtons
                                        id={u.id}
                                        currentStatus={u.status}
                                        type="user"
                                        userEmail={u.email || ""}
                                        userName={u.name || ""}
                                        toggleAction={toggleUserStatus}
                                        deleteAction={deleteUser}
                                        editAction={editUser}
                                        resetPasswordAction={resetUserPassword}
                                    />
                                </div>
                            </div>
                        ))}
                        {users.length === 0 && (
                            <div className="px-6 py-8 text-center text-muted-foreground">No users found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
