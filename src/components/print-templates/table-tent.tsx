import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, Users, Star, Heart } from "lucide-react";

interface TableTentProps {
    businessName: string;
    logoUrl?: string;
    brandColor?: string;
    qrUrl: string;
    shortTitle?: string;
    tagline?: string;
}

export function TableTent({
    businessName,
    logoUrl,
    brandColor = "#0f172a", // Default navy
    qrUrl,
    shortTitle = "Enjoyed Your\nExperience?",
    tagline = "Tagline Goes Here"
}: TableTentProps) {

    // Helper for Google colored text in the sentence
    const GoogleText = () => (
        <span className="inline-flex font-bold font-sans tracking-tighter">
            <span style={{ color: "#4285F4" }}>G</span>
            <span style={{ color: "#EA4335" }}>o</span>
            <span style={{ color: "#FBBC05" }}>o</span>
            <span style={{ color: "#4285F4" }}>g</span>
            <span style={{ color: "#34A853" }}>l</span>
            <span style={{ color: "#EA4335" }}>e</span>
        </span>
    );

    return (
        <div className="w-[450px] h-[650px] bg-white relative flex flex-col shadow-[0px_10px_40px_-5px_rgba(0,0,0,0.15)] rounded-sm overflow-hidden font-sans shrink-0 border border-slate-100">

            {/* Background patterns */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

            {/* Faded G background element (top right) */}
            <div className="absolute -top-12 -right-16 z-0 text-[300px] font-black leading-none opacity-5 tracking-tighter" style={{ fontFamily: 'sans-serif' }}>
                <span style={{ color: "#4285F4" }}>G</span>
            </div>

            {/* Top Left Curved Navy Element */}
            <div className="absolute top-0 left-0 w-[500px] h-[250px] -translate-x-[200px] -translate-y-[120px] -rotate-[15deg] z-0 overflow-hidden rounded-[100%] shadow-[0px_5px_0px_#eab308]" style={{ backgroundColor: brandColor }}></div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-4 relative z-10 px-8 text-center mt-2">

                {/* Logo Section */}
                <div className="flex items-center justify-center w-full mb-3 gap-3 relative">
                    <div className="h-[1px] w-12 bg-amber-400"></div>
                    {logoUrl ? (
                        <div className="w-16 h-16 bg-white flex items-center justify-center p-1 border-2 border-amber-400 font-bold">
                            <img src={logoUrl} alt={businessName} className="max-h-full max-w-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-white flex items-center justify-center border-[3px] border-amber-400 relative">
                            {/* Hexagon shape illusion with a simple rotated box or just standard B */}
                            <div className="text-3xl font-black text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{businessName.charAt(0).toUpperCase()}</div>
                        </div>
                    )}
                    <div className="h-[1px] w-12 bg-amber-400"></div>
                </div>

                {/* Business Name */}
                <h1 className="text-[26px] font-black text-slate-900 uppercase tracking-tight leading-tight w-full drop-shadow-sm mb-1" style={{ color: brandColor }}>
                    {businessName}
                </h1>

                {/* Tagline */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="h-[1px] w-6 bg-amber-400 opacity-50"></div>
                    <p className="text-[14px] font-semibold text-slate-500 capitalize tracking-wide">
                        {tagline}
                    </p>
                    <div className="h-[1px] w-6 bg-amber-400 opacity-50"></div>
                </div>

                {/* Stars floating */}
                <div className="flex gap-2 text-amber-400 mb-2">
                    <Star className="w-7 h-7 fill-current" />
                    <Star className="w-7 h-7 fill-current" />
                    <Star className="w-7 h-7 fill-current" />
                    <Star className="w-7 h-7 fill-current" />
                    <Star className="w-7 h-7 fill-current" />
                </div>

                {/* Short Title */}
                <h2 className="text-[36px] font-bold text-blue-600 tracking-tight leading-[1.1] mb-2 max-w-[300px]">
                    {shortTitle.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </h2>
                <div className="flex flex-col items-center justify-center w-full max-w-[280px] mx-auto mb-3">
                    <div className="relative flex items-center justify-center w-full py-2">
                        <div className="absolute w-full h-[1px] bg-amber-400"></div>
                        <div className="bg-white px-2 relative z-10"><Star className="w-4 h-4 text-amber-400 fill-current" /></div>
                    </div>
                </div>

                {/* Subtext */}
                <p className="text-[14px] font-semibold text-slate-700 leading-tight mb-4">
                    Your review helps others<br />and motivates us to do better.
                </p>

                {/* Secure QR Container */}
                <div className="p-3 bg-white border border-amber-300 rounded-[10px] mx-auto shadow-sm mb-4">
                    <QRCodeSVG value={qrUrl} size={150} level="H" color="#000000" />
                </div>

                <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4285F4] text-white flex items-center justify-center border-2 border-white shadow-md">
                        <Smartphone className="w-5 h-5" />
                    </div>
                    <p className="text-[13px] font-semibold text-slate-800 text-left leading-tight">
                        Scan the QR code to<br />share your feedback on <GoogleText />
                    </p>
                </div>
            </div>

            {/* Horizontal 3 Step Visual Flow */}
            <div className="w-full flex-none px-6 pb-12 mt-auto relative z-10">
                <div className="w-full bg-slate-100 rounded-2xl flex justify-between items-center py-4 px-4 shadow-[inset_0px_2px_10px_rgba(0,0,0,0.02)]">

                    {/* Item 1 */}
                    <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center shrink-0">
                            <Star className="w-4 h-4 fill-white" />
                        </div>
                        <div className="text-[10px] font-semibold text-slate-700 leading-tight">
                            Your feedback<br />means a lot
                        </div>
                    </div>

                    <div className="w-[1px] h-8 bg-slate-300 mx-2"></div>

                    {/* Item 2 */}
                    <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 rounded-full bg-[#ef4444] text-white flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4" />
                        </div>
                        <div className="text-[10px] font-semibold text-slate-700 leading-tight">
                            Help others<br />make better<br />choices
                        </div>
                    </div>

                    <div className="w-[1px] h-8 bg-slate-300 mx-2"></div>

                    {/* Item 3 */}
                    <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 rounded-full bg-[#22c55e] text-white flex items-center justify-center shrink-0 border border-white">
                            <Heart className="w-4 h-4 bg-transparent stroke-[3px]" />
                        </div>
                        <div className="text-[10px] font-semibold text-slate-700 leading-tight">
                            Thank you for<br />supporting us!
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Navy Footer Curved Element */}
            <div className="absolute bottom-0 left-0 w-full h-[60px] overflow-hidden z-10">
                <div className="absolute bottom-0 left-[-10%] w-[120%] h-[120px] rounded-t-[50%] bg-[#3b82f6] shadow-[0px_-3px_0px_#eab308]"></div>
                <div className="absolute bottom-0 left-[-10%] w-[120%] h-[100px] rounded-t-[50%]" style={{ backgroundColor: brandColor }}></div>
                <div className="absolute bottom-3 left-0 w-full text-center flex items-center justify-center text-white text-[12px] font-medium tracking-wide">
                    <span className="w-5 h-5 rounded-full border border-white/50 flex items-center justify-center mr-2"><Star className="w-3 h-3 fill-white" /></span>
                    Powered by Smart Review Assistant
                </div>
            </div>

        </div>
    );
}
