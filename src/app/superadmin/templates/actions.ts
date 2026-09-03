"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTemplates() {
    try {
        const templates = await prisma.designTemplate.findMany({
            orderBy: { createdAt: "desc" },
        });
        return { success: true, templates };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to fetch templates" };
    }
}

export async function createTemplate(data: { name: string; category: string; imageUrl: string }) {
    try {
        const template = await prisma.designTemplate.create({
            data: {
                name: data.name,
                category: data.category,
                imageUrl: data.imageUrl,
            },
        });

        revalidatePath("/superadmin/templates");
        revalidatePath("/dashboard/templates");
        return { success: true, template };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to create template" };
    }
}

export async function deleteTemplate(id: string) {
    try {
        await prisma.designTemplate.delete({
            where: { id },
        });
        revalidatePath("/superadmin/templates");
        revalidatePath("/dashboard/templates");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to delete template" };
    }
}
