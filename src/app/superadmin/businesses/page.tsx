import prisma from "@/lib/prisma";
import { toggleBusinessStatus, deleteBusiness } from "../actions";
import { AdminActionButtons } from "../components/AdminActionButtons";

export const dynamic = "force-dynamic";

export default async function SuperAdminBusinesses() {
    const businesses = await prisma.business.findMany({
        include: {
            members: {
                include: { user: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Business Tenants</h1>
                <p className="text-muted-foreground mt-1">Manage all SaaS consumers and their review campaigns.</p>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-gray-50/50 uppercase border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Business Name</th>
                                <th className="px-6 py-4 font-semibold">Project Slug</th>
                                <th className="px-6 py-4 font-semibold">Owner / Members</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Created On</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {businesses.map(b => (
                                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{b.name}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{b.slug}</td>
                                    <td className="px-6 py-4 text-xs text-muted-foreground">
                                        {b.members.slice(0, 2).map(m => m.user.email).join(", ")}
                                        {b.members.length > 2 && " ..."}
                                        {b.members.length === 0 && <span>No Members</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${b.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{b.createdAt.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <AdminActionButtons
                                            id={b.id}
                                            currentStatus={b.status}
                                            type="business"
                                            toggleAction={toggleBusinessStatus}
                                            deleteAction={deleteBusiness}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {businesses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No businesses found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
