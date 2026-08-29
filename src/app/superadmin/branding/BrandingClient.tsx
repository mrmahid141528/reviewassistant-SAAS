"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LogoUpload from "@/components/dashboard/LogoUpload"
import { SubmitButton } from "@/components/ui/submit-button"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { updateBrandSettings } from "./actions"

export function BrandingClient({ initialSettings }: { initialSettings: { platformName?: string, logoUrl?: string } }) {
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [platformName, setPlatformName] = useState(initialSettings.platformName || "Google Review Assistant")

    const handleSubmit = async (formData: FormData) => {
        setStatus(null)
        try {
            // Include current logo URL so it doesn't get overwritten if no new file is selected
            formData.append('currentLogoUrl', initialSettings.logoUrl || "");

            const res = await updateBrandSettings(formData);
            if (res.success) {
                setStatus({ type: 'success', msg: res.message || "Saved successfully." })
            } else {
                setStatus({ type: 'error', msg: res.error || "Failed to update." })
            }
        } catch (e: any) {
            setStatus({ type: 'error', msg: "An unexpected error occurred." })
        }
    }

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Branding</h1>
                <p className="text-muted-foreground mt-1 text-sm">Manage the global application logo and brand name across all tenant portals.</p>
            </div>

            <form action={handleSubmit}>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-xl">Global Identity</CardTitle>
                        <CardDescription>
                            These settings will take effect immediately across the Superadmin dashboard, Tenant modules, and Marketing pages.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {status && (
                            <div className={`p-4 rounded-xl flex items-start gap-3 border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                {status.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                                <p className="text-sm font-medium">{status.msg}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-bold text-slate-700">Platform Logo</Label>
                                <p className="text-[13px] text-slate-500 mb-4">This logo will replace the standard text logo across the application's top navigation bar and sidebars.</p>
                                <LogoUpload currentLogoUrl={initialSettings.logoUrl} />
                            </div>

                            <hr className="border-border/50" />

                            <div className="space-y-2 max-w-md">
                                <Label htmlFor="platformName" className="font-semibold text-slate-700">Platform Name</Label>
                                <Input
                                    id="platformName"
                                    name="platformName"
                                    value={platformName}
                                    onChange={(e) => setPlatformName(e.target.value)}
                                    placeholder="e.g. My RevHub"
                                />
                                <p className="text-xs text-muted-foreground">This name is used in email footers and page titles.</p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-slate-50/50 border-t py-4 px-6 flex justify-end">
                        <SubmitButton className="bg-blue-600 hover:bg-blue-700">
                            Save Changes
                        </SubmitButton>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
