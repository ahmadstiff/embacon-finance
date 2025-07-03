import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import ClientProviders from "@/components/providers/client-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Embacon Finance",
  description: "Cross-chain borrowing platform",
  icons: {
    icon: [
      { url: "./embaconlogo.png", type: "image/png" },
      { url: "/embaconlogo.png", type: "image/png" },
    ],
    apple: [{ url: "/embaconlogo.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
