import { getSecuritySettings } from '../actions'
import { SecuritySettingsClient } from './SecuritySettingsClient'

export const dynamic = "force-dynamic";

export default async function SecuritySettingsPage() {
    const settings = await getSecuritySettings();

    return (
        <SecuritySettingsClient settings={settings} />
    );
}
