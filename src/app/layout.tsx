import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/framework/providers/TRPCProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SaaS AI",
  description: "SaaS AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="shortcut icon" href="/favicon.png" />
      <body className={inter.className}>
        <TRPCProvider>
          {children}
          <Toaster
            className="custom-toaster"
            richColors
            position="top-center"
            duration={5000}
            closeButton
            gap={8}
          />
        </TRPCProvider>
      </body>
    </html>
  );
}