import React from "react";
import { TableTent } from "./table-tent";

export type PrintTemplateType = "table-tent" | "a4-poster" | "a5-portrait";

interface PrintLayoutProps {
    templateType: PrintTemplateType;
    businessName: string;
    logoUrl?: string;
    brandColor?: string;
    qrUrl: string;
    shortTitle?: string;
    tagline?: string;
}

export function PrintLayout(props: PrintLayoutProps) {
    if (props.templateType === "table-tent") {
        return (
            <div className="relative w-full min-h-[650px] bg-white flex flex-col items-center justify-center bg-transparent print:min-h-0 print:h-auto print:block print:p-0">
                <div className="scale-90 sm:scale-100 print:scale-100 print:m-0 mx-auto w-max print:break-inside-avoid">
                    <TableTent {...props} />
                </div>
            </div>
        )
    }

    if (props.templateType === "a4-poster") {
        return (
            <div className="relative w-full h-full bg-white flex items-center justify-center p-8 bg-slate-50 print:bg-white print:p-0">
                <div className="scale-100 lg:scale-[1.3] xl:scale-[1.5] origin-center print:scale-[1.6]">
                    <TableTent {...props} />
                </div>
            </div>
        )
    }

    if (props.templateType === "a5-portrait") {
        return (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-transparent">
                <div className="scale-[1.1] origin-center print:scale-[1.15]">
                    <TableTent {...props} />
                </div>
            </div>
        )
    }

    return null;
}
