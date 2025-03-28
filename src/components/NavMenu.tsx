"use client";

import Link from "next/link";

import { useSidebarStore } from '@/framework/hooks/useSidebarStore';

export function NavMenu() {
  const toggle = useSidebarStore((state) => state.toggle);
  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="max-w-7xl px-4 py-2 sm:py-2 lg:py-2">
        <div className="flex justify-between">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center mr-2">
              <Link
                href="/"
                className="text-2xl font-bold text-primary font-[times]"
              >
                SaaS AI
              </Link>
            </div>
            <button
              onClick={toggle}
              type="button"
              className="inline-flex items-center p-2 text-sm text-primary rounded-lg sm:hidden hover:bg-primary-foreground dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
