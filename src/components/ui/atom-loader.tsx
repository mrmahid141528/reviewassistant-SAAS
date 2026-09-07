import React from 'react';

export function AtomLoader({ className = "w-32 h-32" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes orbit-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes orbit-spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
            `}} />

            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-xl" strokeLinejoin="round" strokeLinecap="round">
                <defs>
                    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="1" />
                        <stop offset="40%" stopColor="#6366f1" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="electronGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Center Nucleus */}
                <g className="origin-center animate-pulse">
                    <circle cx="50" cy="50" r="10" fill="url(#coreGlow)" filter="url(#glow)" />
                    <circle cx="50" cy="50" r="3" fill="#ffffff" />
                </g>

                {/* Orbit 1 */}
                <g className="origin-center" style={{ transformOrigin: '50px 50px', animation: 'orbit-spin 4s linear infinite' }}>
                    <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.4" />
                    <circle cx="8" cy="50" r="2.5" fill="#ffffff" filter="url(#electronGlow)" />
                </g>

                {/* Orbit 2 */}
                <g className="origin-center" style={{ transform: 'rotate(60deg)', transformOrigin: '50px 50px' }}>
                    <g className="origin-center" style={{ transformOrigin: '50px 50px', animation: 'orbit-spin-reverse 3.5s linear infinite' }}>
                        <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#818cf8" strokeWidth="1" strokeOpacity="0.5" />
                        <circle cx="92" cy="50" r="2" fill="#ffffff" filter="url(#electronGlow)" />
                    </g>
                </g>

                {/* Orbit 3 */}
                <g className="origin-center" style={{ transform: 'rotate(120deg)', transformOrigin: '50px 50px' }}>
                    <g className="origin-center" style={{ transformOrigin: '50px 50px', animation: 'orbit-spin 5s linear infinite' }}>
                        <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.6" />
                        <circle cx="8" cy="50" r="2" fill="#ffffff" filter="url(#electronGlow)" />
                        <circle cx="92" cy="50" r="1.5" fill="#c7d2fe" />
                    </g>
                </g>
            </svg>
        </div>
    );
}
