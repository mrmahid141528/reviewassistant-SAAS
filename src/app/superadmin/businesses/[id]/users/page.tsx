import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Key } from "lucide-react";

export default async function BusinessUsersTab(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const members = await prisma.businessMember.findMany({
        where: { businessId: id },
        include: { user: true },
        orderBy: { createdAt: 'asc' }
    });

    if (!members) notFound();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Users & Access</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage platform members associated with this tenant.</p>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg">Team Members ({members.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-slate-500">User</th>
                                    <th className="px-6 py-4 font-medium text-slate-500">System Role</th>
                                    <th className="px-6 py-4 font-medium text-slate-500">Tenant Role</th>
                                    <th className="px-6 py-4 font-medium text-slate-500">Linked Since</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {members.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{member.user.name || "Unnamed User"}</p>
                                                    <p className="text-xs text-slate-500">{member.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.user.email === 'mrmahid141528@gmail.com' ? (
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Superadmin</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600">Standard</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 capitalize font-medium text-slate-700">
                                                {member.role === 'owner' ? <Shield className="h-3.5 w-3.5 text-emerald-600" /> : <Key className="h-3.5 w-3.5 text-slate-400" />}
                                                {member.role}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-[13px]">
                                            {member.createdAt.toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
