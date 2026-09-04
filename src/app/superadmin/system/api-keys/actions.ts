'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPlatformApiKeys() {
    try {
        const keys = await prisma.platformApiKey.findMany({
            orderBy: { createdAt: "desc" }
        });
        return { success: true, keys };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function savePlatformApiKey(data: { provider: string, name: string, key: string }) {
    try {
        if (!data.provider || !data.key) return { success: false, error: "Provider and Key are required." };

        let status = "testing";

        // Initial Test Connection
        if (data.provider.toLowerCase() === "gemini") {
            const isValid = await testGeminiKey(data.key);
            status = isValid ? "active" : "invalid";
        } else {
            status = "active";
        }

        const apiKey = await prisma.platformApiKey.upsert({
            where: { provider: data.provider },
            update: {
                name: data.name,
                key: data.key,
                status: status,
                lastTestedAt: new Date(),
            },
            create: {
                provider: data.provider,
                name: data.name,
                key: data.key,
                status: status,
                lastTestedAt: new Date(),
            }
        });

        revalidatePath("/superadmin/system/api-keys");
        return { success: true, apiKey };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function testConnectionAction(provider: string) {
    try {
        const apiKey = await prisma.platformApiKey.findUnique({ where: { provider } });
        if (!apiKey) return { success: false, error: "Key not found in database." };

        let isValid = false;
        if (provider.toLowerCase() === "gemini") {
            isValid = await testGeminiKey(apiKey.key);
        } else {
            return { success: true, message: "No test logic implemented for this provider yet." };
        }

        const updated = await prisma.platformApiKey.update({
            where: { id: apiKey.id },
            data: {
                status: isValid ? "active" : "invalid",
                lastTestedAt: new Date()
            }
        });

        revalidatePath("/superadmin/system/api-keys");
        return { success: isValid, status: updated.status };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePlatformApiKey(id: string) {
    try {
        await prisma.platformApiKey.delete({ where: { id } });
        revalidatePath("/superadmin/system/api-keys");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

async function testGeminiKey(key: string): Promise<boolean> {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
            method: 'GET'
        });
        return res.ok;
    } catch (e) {
        return false;
    }
}
