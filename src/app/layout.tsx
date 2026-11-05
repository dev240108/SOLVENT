import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Solvent — Know Where Your Money Goes | Smart Spending Analysis",
  description:
    "Understand where your money goes without giving away bank logins. Private statement parsing for Indian bank & UPI statements with 100% free instant reports.",
  keywords: [
    "UPI spend analysis",
    "Indian bank statement parser",
    "spending habits",
    "spending leak detector",
    "small payments tracker",
    "Solvent money",
  ],
  authors: [{ name: "Solvent Team" }],
  openGraph: {
    title: "Solvent — Know Where Your Money Goes",
    description: "Private spending analysis platform for Indian bank and UPI statements.",
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
