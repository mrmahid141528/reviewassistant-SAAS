import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Download, History } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function BillingHistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const membership = await prisma.businessMember.findFirst({
        where: { userId: user.id },
        select: { businessId: true }
    });

    if (!membership) redirect("/dashboard");

    const invoices = await prisma.payment.findMany({
        where: { businessId: membership.businessId },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4 ml-1">BILLING HISTORY</h3>

            {invoices.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
                    <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">No past invoices found.</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">
                                            {new Date(inv.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            Subscription Payment
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">
                                            {inv.currency === 'USD' ? '$' : '₹'}{Number(inv.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase ${inv.status.toLowerCase() === 'paid' || inv.status.toLowerCase() === 'successful' ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Button variant="ghost" size="sm" className="h-8 gap-2 font-semibold text-primary/80 hover:text-primary">
                                                PDF <Download className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
