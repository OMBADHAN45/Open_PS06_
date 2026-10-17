import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DRISHTI — Evidence-Backed Campus Placements",
  description:
    "DRISHTI: Proof Over Claims, Zero Inflation. Connecting verified student talent with trusted hiring partners through evidence-backed resumes, proctored assessments, and a shared placement pipeline.",
  keywords: [
    "DRISHTI",
    "campus placements",
    "evidence-backed recruitment",
    "proctored assessments",
    "ATS resume",
    "GitHub verification",
  ],
  authors: [{ name: "DRISHTI" }],
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "DRISHTI — Evidence-Backed Campus Placements",
    description: "Proof Over Claims, Zero Inflation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
