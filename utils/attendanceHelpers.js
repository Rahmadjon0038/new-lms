// Davomat uchun yordamchi funksiyalar

// Yangi API (lesson_id bilan) uchun handler - kelajakda ishlatish uchun
export const handleSaveWithLessonId = (
  attendanceChanges, 
  groupId, 
  saveLessonMutation, 
  setAttendanceChanges, 
  refetch, 
  toast
) => {
  if (Object.keys(attendanceChanges).length === 0) {
    toast.error('Hech qanday o\'zgarish yo\'q');
    return;
  }

  // Avval har bir sana uchun lesson yaratish yoki topish kerak
  // Keyin davomat saqlash
  
  // Sanalar bo'yicha guruhlash
  const dateGroups = {};
  Object.entries(attendanceChanges).forEach(([key, status]) => {
    if (status !== null) {
      const [studentId, date] = key.split('-');
      
      if (!dateGroups[date]) {
        dateGroups[date] = [];
      }
      
      dateGroups[date].push({
        student_id: parseInt(studentId),
        status: status === 1 ? 'present' : 'absent'
      });
    }
  });

  // Har bir sana uchun saqlash
  // Bu yerda real lesson_id kerak
  const savePromises = Object.entries(dateGroups).map(([date, attendance_data]) => {
    // 1. Avval bu sana uchun lesson ID topish yoki yaratish kerak
    // 2. Keyin davomat saqlash
    
    return saveLessonMutation.mutateAsync({
      lesson_id: getLessonIdForDate(date, groupId), // Bu funksiya real lesson_id qaytarishi kerak
      attendance_data
    });
  });

  Promise.all(savePromises)
    .then(() => {
      toast.success('Davomat muvaffaqiyatli saqlandi');
      setAttendanceChanges({});
      refetch();
    })
    .catch((error) => {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    });
};

// Sana va guruh ID orqali lesson ID topish (backend dan olish kerak)
const getLessonIdForDate = (date, groupId) => {
  // Bu funksiya backend ga so'rov yuborishi va 
  // shu sana va guruh uchun lesson_id ni qaytarishi kerak
  // Hozircha placeholder
  return 0;
};