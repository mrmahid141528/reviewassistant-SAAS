import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReviewAssistant - Smart Google Review Engine",
  description: "Automate 5-star Google reputation for local businesses.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader showSpinner={false} color="#10b981" />
        {children}
      </body>
    </html>
  );
}
