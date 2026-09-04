import { getPlatformApiKeys } from "./actions";
import { Key } from "lucide-react";
import ApiKeysClient from "./ApiKeysClient";

export const metadata = {
    title: "System API Keys | SaaS Control",
};

export default async function SuperadminApiKeysPage() {
    const { keys } = await getPlatformApiKeys();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Key className="w-6 h-6 text-indigo-600" />
                        Platform API Keys
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Centrally manage API connections without relying on environment variables.
                        Keys saved here will instantly apply to the live platform.
                    </p>
                </div>
            </div>

            <ApiKeysClient initialKeys={keys || []} />
        </div>
    );
}
