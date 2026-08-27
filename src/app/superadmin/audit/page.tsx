import { fetchAuditLogs, fetchAuditKPIs } from './actions'
import { AuditLogClient } from './AuditLogClient'

export const dynamic = "force-dynamic";

export default async function SuperAdminAuditPage({
    searchParams
}: {
    searchParams: { [key: string]: string | undefined }
}) {
    // Resolve search parameters for server-side initial load filtering
    const filters = {
        action: searchParams.action,
        actorType: searchParams.actorType,
        result: searchParams.result,
        resourceType: searchParams.resourceType,
        search: searchParams.search
    }

    // Parallel fetch
    const [initialLogs, kpis] = await Promise.all([
        fetchAuditLogs(filters),
        fetchAuditKPIs()
    ])

    return (
        <AuditLogClient initialLogs={initialLogs} initialKpis={kpis} />
    );
}
