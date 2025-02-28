import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { NavMenu } from "@/components/NavMenu";
import { TRPCProvider } from "@/framework/providers/TRPCProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Pricing",
  description: "Manage project pricing and rate cards",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavMenu />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}
