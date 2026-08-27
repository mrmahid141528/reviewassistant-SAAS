import {
    getSecurityMetrics,
    getAuthAlerts,
    getActiveSessions,
    getBlockedIPs,
    getSecuritySettings
} from './actions'
import { SecurityDashboardClient } from './SecurityDashboardClient'

export const dynamic = "force-dynamic";

export default async function SuperAdminSecurityPage() {
    const [metrics, failedLogins, activeSessions, blockedIPs, settings] = await Promise.all([
        getSecurityMetrics(),
        getAuthAlerts(),
        getActiveSessions(),
        getBlockedIPs(),
        getSecuritySettings()
    ]);

    return (
        <SecurityDashboardClient
            metrics={metrics}
            failedLogins={failedLogins}
            activeSessions={activeSessions}
            blockedIPs={blockedIPs}
            settings={settings}
        />
    );
}
