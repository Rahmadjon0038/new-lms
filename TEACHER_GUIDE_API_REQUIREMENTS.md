# Teacher Guide API Talabnomasi (Backend uchun)

## 1. Maqsad
`/teacher/guide` sahifalarini mock ma'lumotlarsiz, real API bilan ishlatish uchun backend contract.

Frontend sahifalar:
1. `app/teacher/guide/page.jsx` (kurs -> level lar ro'yxati)
2. `app/teacher/guide/[courseId]/[levelId]/page.jsx` (level -> lessonlar ro'yxati)
3. `app/teacher/guide/[courseId]/[levelId]/lesson/[lessonId]/page.jsx` (lesson detail: Umumiy ma'lumot, PDF, Topshiriqlar, Lug'at)

## 2. Rollar va ko'rinish qoidalari

### Rollar
1. `admin`
2. `teacher`

### Visibility qoidasi (eng muhim)
1. **Umumiy ma'lumot (Overview)**:
- faqat `admin` create/update qiladi
- `teacher` faqat o'qiydi
- rang (`color`) ni `admin` ham, `teacher` ham o'zgartira oladi (user-level preference)
2. **PDF**:
- `admin` yuklagan PDF: hamma teacherlarga ko'rinadi (`scope = global`)
- `teacher` yuklagan PDF: faqat o'ziga ko'rinadi (`scope = private`)
3. **Topshiriqlar**:
- `admin` yuklagani: barcha teacherlarga ko'rinadi (`scope = global`)
- `teacher` yuklagani: faqat o'ziga ko'rinadi (`scope = private`)
4. **Lug'at**:
- teacher o'zi qo'shadi
- teacher qo'shgan lug'at faqat o'ziga ko'rinadi (`scope = private`)

## 3. Auth va umumiy format

1. Har request auth bilan (`Bearer token`).
2. Backend user kontekstini token orqali aniqlaydi (`user_id`, `role`).
3. Standard response:

```json
{
  "success": true,
  "data": {}
}
```

4. Xatolik format:

```json
{
  "success": false,
  "message": "Xatolik sababi",
  "errors": {}
}
```

## 4. Asosiy entity maydonlari

### Course
- `id`
- `name`

### Level
- `id`
- `course_id`
- `name`
- `lesson_count`

### Lesson
- `id`
- `course_id`
- `level_id`
- `title`
- `order_number`

### Lesson Overview (admin boshqaradi)
- `id`
- `lesson_id`
- `title` (masalan: `Dars haqida`)
- `content_markdown`
- `updated_by` (admin id)
- `updated_at`

### Lesson Color Preference (har user uchun)
- `id`
- `lesson_id`
- `user_id`
- `color` (`blue|green|orange|red|purple|pink`)

### PDF Item
- `id`
- `lesson_id`
- `title`
- `description`
- `file_url`
- `file_name`
- `file_size_bytes`
- `page_count` (ixtiyoriy)
- `mime_type`
- `scope` (`global|private`)
- `created_by`
- `created_by_role`
- `created_at`

### Assignment
- `id`
- `lesson_id`
- `title`
- `description`
- `type` (ixtiyoriy)
- `scope` (`global|private`)
- `created_by`
- `created_by_role`
- `created_at`

### Vocabulary
- `id`
- `lesson_id`
- `word`
- `translation`
- `pronunciation` (ixtiyoriy)
- `scope` (`private`)
- `created_by` (teacher id)
- `created_at`

## 5. Endpointlar

## 5.1 Guide index (kurs/level)

### GET `/api/teacher/guides/courses`
Teacherga mavjud kurslarni qaytaradi.

### GET `/api/teacher/guides/courses/:courseId/levels`
Kursga tegishli level lar.

Response `data` misoli:
```json
{
  "course": { "id": 1, "name": "English Language" },
  "levels": [
    { "id": 1, "name": "Beginner (A1)", "lesson_count": 32 },
    { "id": 2, "name": "Elementary (A2)", "lesson_count": 28 }
  ]
}
```

### GET `/api/teacher/guides/courses/:courseId/levels/:levelId/lessons`
Level ichidagi lesson ro'yxati.

Response `data` misoli:
```json
{
  "level": { "id": 1, "name": "Beginner (A1)" },
  "lessons": [
    { "id": 1, "title": "Alphabet and Pronunciation", "order_number": 1 },
    { "id": 2, "title": "Basic Greetings", "order_number": 2 }
  ]
}
```

## 5.2 Lesson detail (tablar uchun asosiy endpoint)

### GET `/api/teacher/guides/lessons/:lessonId`
Bitta endpointda detail ma'lumotni qaytarish tavsiya qilinadi (frontendga qulay).

`pdfs`, `assignments` filter qoidasi:
1. `scope = global` bo'lsa hammasi ko'radi
2. `scope = private` bo'lsa faqat `created_by == current_user_id`

`vocabulary` filter qoidasi:
1. faqat `created_by == current_user_id` qaytsin

Response `data` misoli:
```json
{
  "lesson": {
    "id": 1,
    "title": "Alphabet and Pronunciation",
    "level_name": "Beginner (A1)"
  },
  "overview": {
    "id": 11,
    "title": "Dars haqida",
    "content_markdown": "# Ingliz tili alfaviti\n..."
  },
  "color_preference": {
    "color": "blue"
  },
  "pdfs": [],
  "assignments": [],
  "vocabulary": []
}
```

## 5.3 Umumiy ma'lumot (admin only)

### POST `/api/admin/guides/lessons/:lessonId/overview`
Overview create.

### PATCH `/api/admin/guides/lessons/:lessonId/overview`
Overview update.

Request body:
```json
{
  "title": "Dars haqida",
  "content_markdown": "# Sarlavha\nMatn..."
}
```

## 5.4 Rang o'zgartirish (admin + teacher)

### PATCH `/api/teacher/guides/lessons/:lessonId/color-preference`
### PATCH `/api/admin/guides/lessons/:lessonId/color-preference`

Request body:
```json
{
  "color": "green"
}
```

Natija: faqat current user uchun saqlansin (personal preference).

## 5.5 PDF API

### POST `/api/teacher/guides/lessons/:lessonId/pdfs`
Teacher PDF yuklaydi (`scope` avtomatik `private`).

### POST `/api/admin/guides/lessons/:lessonId/pdfs`
Admin PDF yuklaydi (`scope` avtomatik `global`).

Content-Type: `multipart/form-data`
Maydonlar:
1. `title` (string, required)
2. `description` (string, required)
3. `file` (pdf file, required)

### GET `/api/teacher/guides/lessons/:lessonId/pdfs`
Teacher uchun filterlangan list (`global + o'ziniki(private)`).

### DELETE `/api/teacher/guides/lessons/:lessonId/pdfs/:pdfId`
Teacher faqat o'zi qo'shgan private PDFni o'chira oladi.

### DELETE `/api/admin/guides/lessons/:lessonId/pdfs/:pdfId`
Admin global PDFlarni boshqaradi.

## 5.6 Topshiriq API

### POST `/api/teacher/guides/lessons/:lessonId/assignments`
Teacher qo'shadi (`scope=private`).

### POST `/api/admin/guides/lessons/:lessonId/assignments`
Admin qo'shadi (`scope=global`).

Request body:
```json
{
  "title": "Topshiriq nomi",
  "description": "Qisqa izoh",
  "type": "Yozma ish"
}
```

### GET `/api/teacher/guides/lessons/:lessonId/assignments`
Teacher uchun filterlangan list (`global + o'ziniki(private)`).

### DELETE `/api/teacher/guides/lessons/:lessonId/assignments/:assignmentId`
Teacher faqat private va o'zinikini o'chira oladi.

## 5.7 Lug'at API (teacher only/private)

### GET `/api/teacher/guides/lessons/:lessonId/vocabulary`
Faqat current teacher yozgan lug'atlar.

### POST `/api/teacher/guides/lessons/:lessonId/vocabulary`
Request:
```json
{
  "word": "Hello",
  "translation": "Salom",
  "pronunciation": "/həˈloʊ/"
}
```

### PATCH `/api/teacher/guides/lessons/:lessonId/vocabulary/:vocabId`
### DELETE `/api/teacher/guides/lessons/:lessonId/vocabulary/:vocabId`

## 6. Validatsiya talablari

1. `title`, `description` bo'sh bo'lmasin.
2. PDF upload faqat `application/pdf`.
3. PDF size limit (masalan 20MB) backendda tekshirilsin.
4. `scope` teacher requestdan olinmasin, role bo'yicha backend o'zi qo'ysin.
5. Teacher boshqa teacher private kontentini hech qachon ko'rmasin.

## 7. Tavsiya etiladigan DB yondashuv

1. Har kontent jadvalida `scope`, `created_by`, `created_by_role` bo'lsin.
2. Querylarda quyidagi filter ishlatilsin:
- `scope = 'global' OR created_by = :current_user_id`
3. Vocabulary uchun:
- `created_by = :current_user_id` (global yo'q)

## 8. Frontend uchun minimal tayyor holat

Backend quyidagilarni bersa frontend real ishlaydi:
1. Kurs/level/lesson list endpointlari
2. Lesson detail composite endpoint
3. Overview admin CRUD + color preference endpoint
4. PDF upload/list/delete (role-based visibility bilan)
5. Assignment create/list/delete (role-based visibility bilan)
6. Vocabulary CRUD (teacher private)

