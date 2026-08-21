export default function PublicReviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md bg-white shadow-sm rounded-xl overflow-hidden min-h-[500px] flex flex-col">
                {children}
            </div>
        </div>
    );
}
