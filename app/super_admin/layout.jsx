"use client";

import { useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import SuperAdminSidebar from "../../components/superadmin/Sidebar";

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="uz">
      <body>
        <Navbar />
        <div className="flex min-h-screen bg-gray-50">
          {isSidebarOpen ? (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              aria-label="Close menu overlay"
            />
          ) : null}
          <SuperAdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-3 py-2 lg:hidden">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"
              >
                <Bars3Icon className="h-5 w-5" />
                Menu
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
