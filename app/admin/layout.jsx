// app/layout.js

import AdministratorSidebar from "../../components/admistrator/Sidebar";
import Navbar from "../../components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <Navbar userName="Dildora Alimjanova" role="Admistrator" />
        <div className="flex min-h-screen bg-gray-50">
          {/* 1. Sidebar */}
          {/* Bu yerda sizning sidebar komponentingiz turadi. */}
          <AdministratorSidebar />
          {/* 2. Asosiy Kontent (Sahifalar) */}
          {/* Next.js sahifalari (page.js) shu joyga yuklanadi. */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
