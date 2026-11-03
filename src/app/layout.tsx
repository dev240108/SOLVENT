import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Solvent — Privacy-First Liquidity & Forensic Spending Analysis",
  description:
    "Understand where your money goes without handing over bank logins. Local-first statement parsing for Indian bank & UPI statements with instant spending diagnostics.",
  keywords: [
    "UPI spend analysis",
    "Indian bank statement parser",
    "local-first finance",
    "spending leak detector",
    "micro-drain analysis",
    "Solvent money",
  ],
  authors: [{ name: "Solvent Team" }],
  openGraph: {
    title: "Solvent — Know Where Your Money Goes",
    description: "Privacy-first personal liquidity analysis platform for Indian bank and UPI statements.",
    siteName: "Solvent",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-canvas text-text-primary antialiased min-h-screen flex flex-col selection:bg-liquidity/20 selection:text-liquidity`}
      >
        {children}
      </body>
    </html>
  );
}
