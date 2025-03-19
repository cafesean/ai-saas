"use client";

import Link from "next/link";
import { Route } from "next";
import { usePathname } from "next/navigation";

import { AdminRoutes } from "@/constants/routes";

export function NavMenu() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                AI SasS
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href={AdminRoutes.models as Route}
                className={`${
                  pathname === AdminRoutes.models
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Models
              </Link>
              <Link
                href={AdminRoutes.rules as Route}
                className={`${
                  pathname === AdminRoutes.rules
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Rules
              </Link>
              <Link
                href={AdminRoutes.workflows as Route}
                className={`${
                  pathname === AdminRoutes.workflows
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Workflows
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
