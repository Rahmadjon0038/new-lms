// app/layout.js

import Navbar from "../../components/Navbar";
import TeacherSidebar from "../../components/teacher/Sidebar";

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <Navbar userName="Rahmadjon Abdullayev" role="Teacher" />
        <div className="flex min-h-screen bg-gray-50">
          {/* 1. Sidebar */}
          {/* Bu yerda sizning sidebar komponentingiz turadi. */}
          <TeacherSidebar />

          {/* 2. Asosiy Kontent (Sahifalar) */}
          {/* Next.js sahifalari (page.js) shu joyga yuklanadi. */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
