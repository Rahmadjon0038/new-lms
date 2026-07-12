// Maxfiylik siyosati — ochiq sahifa (login talab qilinmaydi).
// App Store va Play Market talablari uchun: mobil ilova sahifasida
// shu sahifaning to'liq URL manzili ko'rsatiladi.

export const metadata = {
  title: "Maxfiylik siyosati — Taraqqiyot Teaching Center",
  description:
    "Taraqqiyot Teaching Center mobil ilovasi va veb-platformasining maxfiylik siyosati",
};

const SECTIONS = [
  {
    title: "1. Umumiy qoidalar",
    body: [
      `Ushbu Maxfiylik siyosati "Taraqqiyot Teaching Center" o'quv markazi (keyingi o'rinlarda — "Markaz", "biz") tomonidan taqdim etiladigan mobil ilova va veb-platforma (keyingi o'rinlarda — "Xizmat") foydalanuvchilarining shaxsiy ma'lumotlari qanday to'planishi, ishlatilishi va himoya qilinishini tushuntiradi.`,
      `Xizmatdan foydalanish orqali siz ushbu siyosat shartlariga rozilik bildirasiz. Xizmat faqat Markazda ro'yxatdan o'tgan o'quvchilar, ularning ota-onalari, o'qituvchilar va xodimlar uchun mo'ljallangan — ochiq ro'yxatdan o'tish mavjud emas.`,
    ],
  },
  {
    title: "2. To'planadigan ma'lumotlar",
    body: [
      `Xizmat doirasida quyidagi ma'lumotlar to'planadi va saqlanadi:`,
    ],
    list: [
      "Shaxsiy ma'lumotlar: ism, familiya, telefon raqami, ota-ona (vasiy) ismi va telefon raqami — Markazda ro'yxatdan o'tishda kiritiladi;",
      "Hisob ma'lumotlari: foydalanuvchi nomi (username) va shifrlangan parol;",
      "O'quv ma'lumotlari: guruhga a'zolik, dars davomati, o'quv ballari va reyting, to'lov holati;",
      "Profil rasmi: foydalanuvchi tanlagan avatar;",
      "Texnik ma'lumotlar: push-xabarnoma yuborish uchun qurilma identifikatori (FCM token).",
    ],
  },
  {
    title: "3. Ma'lumotlardan foydalanish maqsadlari",
    body: [`To'plangan ma'lumotlar faqat quyidagi maqsadlarda ishlatiladi:`],
    list: [
      "O'quv jarayonini tashkil etish: davomat yuritish, ball qo'yish, reytingni hisoblash;",
      "To'lovlar holatini yuritish va eslatmalar yuborish;",
      "Davomat, ball va yangiliklar haqida push-xabarnomalar yuborish;",
      "Xizmat sifatini yaxshilash va texnik nosozliklarni bartaraf etish.",
    ],
  },
  {
    title: "4. Ma'lumotlarni uchinchi shaxslarga berish",
    body: [
      `Biz foydalanuvchilarning shaxsiy ma'lumotlarini uchinchi shaxslarga sotmaymiz, ijaraga bermaymiz va oshkor qilmaymiz. Istisno holatlar:`,
    ],
    list: [
      "Push-xabarnomalar yuborish uchun Google Firebase Cloud Messaging xizmatidan foydalanamiz — bunda faqat qurilma identifikatori uzatiladi (Google maxfiylik siyosati: policies.google.com/privacy);",
      "Qonunchilikda belgilangan hollarda vakolatli davlat organlarining qonuniy talabiga binoan.",
    ],
  },
  {
    title: "5. Ma'lumotlarni saqlash va himoya qilish",
    body: [
      `Barcha ma'lumotlar himoyalangan serverlarda saqlanadi. Ma'lumotlar almashinuvi shifrlangan HTTPS protokoli orqali amalga oshiriladi. Parollar qaytarib bo'lmaydigan shifrlash (hash) ko'rinishida saqlanadi.`,
      `Ma'lumotlarga faqat vakolatli xodimlar (administratorlar) kirish huquqiga ega. Foydalanuvchi Markaz bilan aloqani to'xtatgach, uning ma'lumotlari hisobot yuritish uchun zarur bo'lgan muddat davomida saqlanadi, so'ng o'chiriladi.`,
    ],
  },
  {
    title: "6. Bolalarning maxfiyligi",
    body: [
      `Xizmatdan voyaga yetmagan o'quvchilar ham foydalanishi mumkin. O'quvchining ma'lumotlari Markazga ota-onasi yoki qonuniy vasiysining roziligi bilan, o'quv shartnomasi doirasida kiritiladi. Ota-onalar farzandining ma'lumotlari haqida to'liq axborot olish, ularni tuzatish yoki o'chirishni talab qilish huquqiga ega.`,
    ],
  },
  {
    title: "7. Foydalanuvchi huquqlari",
    body: [`Har bir foydalanuvchi quyidagi huquqlarga ega:`],
    list: [
      "O'zi haqida saqlanayotgan ma'lumotlar bilan tanishish;",
      "Noto'g'ri ma'lumotlarni tuzatishni so'rash;",
      "Hisobini va u bilan bog'liq shaxsiy ma'lumotlarni o'chirishni so'rash (Markaz administratsiyasiga murojaat orqali);",
      "Push-xabarnomalarni qurilma sozlamalari orqali o'chirib qo'yish.",
    ],
  },
  {
    title: "8. Siyosatga o'zgartirishlar",
    body: [
      `Biz ushbu Maxfiylik siyosatini vaqti-vaqti bilan yangilab turishimiz mumkin. O'zgarishlar shu sahifada e'lon qilinadi va e'lon qilingan paytdan boshlab kuchga kiradi. Muhim o'zgarishlar haqida foydalanuvchilar ilova orqali xabardor qilinadi.`,
    ],
  },
  {
    title: "9. Bog'lanish",
    body: [
      `Maxfiylik siyosati yuzasidan savollaringiz bo'lsa, biz bilan bog'laning:`,
    ],
    list: [
      "O'quv markazi: Taraqqiyot Teaching Center, Namangan shahri;",
      "Telegram: t.me/taraqqiyot_namangan_rasmiy;",
      "Instagram: @taraqqiyot_namangan;",
      "Veb-sayt: taraqqiyot-center.uz",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sarlavha */}
      <header className="bg-gradient-to-br from-[#7C0A05] via-[#A60E07] to-[#D32F2F] px-4 py-10 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">
          Taraqqiyot Teaching Center
        </p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">
          Maxfiylik siyosati
        </h1>
        <p className="mt-2 text-sm font-medium text-white/80">
          Privacy Policy · Oxirgi yangilanish: 2026-yil 12-iyul
        </p>
      </header>

      {/* Matn */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          {SECTIONS.map((section, index) => (
            <section
              key={section.title}
              className={index === 0 ? "" : "mt-8 border-t border-gray-100 pt-8"}
            >
              <h2 className="text-base font-black text-gray-900 sm:text-lg">
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-3 text-sm leading-relaxed text-gray-600"
                >
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-3 space-y-2">
                  {section.list.map((item) => (
                    <li key={item.slice(0, 40)} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A60E07]" />
                      <span className="text-sm leading-relaxed text-gray-600">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Taraqqiyot Teaching Center. Barcha
          huquqlar himoyalangan.
        </p>
      </main>
    </div>
  );
}
