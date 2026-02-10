// app/layout.js

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/students/Sidebar";

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <Navbar userName="Abdurohmonov Dilshod" role="Student" />
        <div className="flex min-h-screen bg-gray-50">
          {/* 1. Sidebar */}
          {/* Bu yerda sizning sidebar komponentingiz turadi. */}
          <Sidebar />

          {/* 2. Asosiy Kontent (Sahifalar) */}
          {/* Next.js sahifalari (page.js) shu joyga yuklanadi. */}
          <main className="flex-1 p-3 sm:p-4 md:p-4 lg:p-6 xl:p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
