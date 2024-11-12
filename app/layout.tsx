import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/app/providers";
import { ThemeProvider } from "@/app/theme-provider";

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

export const metadata: Metadata = {
  title: "How much ETH does the wallet hold?",
  description:
    "The simplest way to know how much ETH an address hold across chains. Using Dune Echo API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
