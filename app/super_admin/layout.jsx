import Navbar from "../../components/Navbar";
import SuperAdminSidebar from "../../components/superadmin/Sidebar";

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <Navbar />
        <div className="flex min-h-screen bg-gray-50">
          <SuperAdminSidebar />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

