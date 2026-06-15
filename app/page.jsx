import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const roleHomeRedirectMap = {
  admin: "/admin/attendance",
  teacher: "/teacher/attendance",
  student: "/student",
  super_admin: "/super_admin",
};

export default function HomePage() {
  const cookieStore = cookies();
  const token = cookieStore.get("accessToken")?.value;
  const role = cookieStore.get("role")?.value;

  if (token) {
    redirect(roleHomeRedirectMap[role] || "/login");
  }

  redirect("/login");
}
