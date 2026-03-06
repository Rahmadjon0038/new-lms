"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

function TeacherAttendanceGroupRedirectPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const groupId = params?.id;
    const month = searchParams.get("month");
    const query = new URLSearchParams();
    if (groupId) query.set("group_id", String(groupId));
    if (month) query.set("month", month);
    router.replace(`/teacher/attendance?${query.toString()}`);
  }, [params, router, searchParams]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
      Yo&apos;naltirilmoqda...
    </div>
  );
}

export default function TeacherAttendanceGroupRedirectPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-gray-500">Yuklanmoqda...</div>}>
      <TeacherAttendanceGroupRedirectPageContent />
    </Suspense>
  );
}
