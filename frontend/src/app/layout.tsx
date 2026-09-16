import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { CookieNotice } from "@/components/CookieNotice";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ONCHAINID Claim Issuer Kit",
  description: "Émettre, vérifier et révoquer des claims ONCHAINID depuis un wallet connecté.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
        <CookieNotice />
      </body>
    </html>
  );
}
