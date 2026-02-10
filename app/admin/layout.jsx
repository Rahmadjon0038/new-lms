// app/layout.js
'use client';

import { useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import AdministratorSidebar from "../../components/admistrator/Sidebar";
import Navbar from "../../components/Navbar";

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="uz">
      <body>
        <Navbar userName="Dildora Alimjanova" role="Admistrator" />
        <div className="flex min-h-screen bg-gray-50">
          {isSidebarOpen ? (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              aria-label="Close menu overlay"
            />
          ) : null}

          <AdministratorSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-3 py-2 md:hidden">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"
              >
                <Bars3Icon className="h-5 w-5" />
                Menu
              </button>
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
