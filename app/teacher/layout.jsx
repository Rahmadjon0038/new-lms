import Navbar from "../../components/Navbar";
import TeacherSidebar from "../../components/teacher/Sidebar";
import TeacherBottomNav from "../../components/teacher/BottomNav";

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body className="teacher-mobile-4">
        <Navbar userName="Rahmadjon Abdullayev" role="Teacher" />
        <div className="min-h-screen bg-gray-50 lg:flex">
          <TeacherSidebar />
          <main className="min-h-screen overflow-y-auto px-1 pb-24 pt-2 sm:px-4 sm:pt-4 md:px-4 lg:flex-1 lg:px-6 lg:pb-6 xl:px-8">
            {children}
          </main>
          <div className="lg:hidden">
            <TeacherBottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
