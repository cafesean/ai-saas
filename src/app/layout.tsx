import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { TRPCProvider } from "@/framework/providers/TRPCProvider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Model Dashboard",
  description:
    "A modern dashboard for AI model management and inference tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href="/favicon.png" />
      </head>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background antialiased",
        )}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
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
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

