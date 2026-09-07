"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export default function DownloadInvoiceButton({ invoice, businessName }: { invoice: any, businessName: string }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = () => {
        setIsGenerating(true);
        setTimeout(() => {
            try {
                const doc = new jsPDF();
                const invoiceId = invoice.paymentId ? invoice.paymentId : invoice.id.substring(0, 8).toUpperCase();
                const dateStr = format(new Date(invoice.createdAt), "dd MMM yyyy");
                const currencySymbol = invoice.currency === 'USD' ? '$' : 'INR ';

                // Set Document Properties
                doc.setProperties({
                    title: `Invoice_INV-${invoiceId}`,
                    creator: "Platform",
                });

                // Add Logo/Header Text
                doc.setFont("helvetica", "bold");
                doc.setFontSize(22);
                doc.setTextColor(33, 33, 33);
                doc.text("INVOICE", 14, 25);

                doc.setFontSize(14);
                doc.setTextColor(59, 130, 246); // Blue color for platform name
                doc.text("Google Review Assistant", 14, 35);

                // Invoice details on the right
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Invoice Number: INV-${invoiceId}`, 130, 25);
                doc.text(`Date of Issue: ${dateStr}`, 130, 31);
                doc.text(`Status: ${invoice.status.toUpperCase()}`, 130, 37);

                // Bill To section
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.setTextColor(33, 33, 33);
                doc.text("Bill To:", 14, 55);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                doc.text(businessName, 14, 62);

                // Table
                autoTable(doc, {
                    startY: 75,
                    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
                    bodyStyles: { textColor: 50 },
                    alternateRowStyles: { fillColor: [250, 250, 250] },
                    head: [['Description', 'Currency', 'Amount']],
                    body: [
                        ['Pro Subscription Payment', invoice.currency || 'INR', `${currencySymbol}${Number(invoice.amount).toFixed(2)}`],
                    ],
                    theme: 'grid',
                    margin: { left: 14, right: 14 },
                });

                // Total Section
                const finalY = (doc as any).lastAutoTable.finalY || 100;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text("Total Paid:", 135, finalY + 15);

                doc.setFont("helvetica", "bold");
                doc.setTextColor(22, 163, 74); // Green amount
                doc.text(`${currencySymbol}${Number(invoice.amount).toFixed(2)}`, 165, finalY + 15);

                // Footer
                doc.setFont("helvetica", "italic");
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                const footerY = doc.internal.pageSize.height - 20;
                doc.text("Thank you for your business. For support, please contact help@platform.com.", 14, footerY);

                // Save
                doc.save(`Invoice_INV-${invoiceId}.pdf`);
            } catch (error) {
                console.error("PDF generation failed:", error);
            } finally {
                setIsGenerating(false);
            }
        }, 300);
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={isGenerating}
            variant="ghost"
            size="sm"
            className="h-8 gap-2 font-semibold text-primary/80 hover:text-primary transition-all active:scale-95"
        >
            {isGenerating ? "Generating..." : "PDF"} <Download className="h-4 w-4" />
        </Button>
    )
}
