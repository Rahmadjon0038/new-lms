"use client";
import React, { useState, useEffect } from "react";
import { 
  UserIcon, AcademicCapIcon, ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";

// Asosiy rang
const MAIN_COLOR = "#A60E07";

const ACADEMIC_DATA = {
  "Web Dasturlash": {
    teachers: ["Jasur Raximov", "Anvar Olimov"],
    groups: [
      { name: "Web Pro 201", price: 800000 },
      { name: "Web Pro 202", price: 850000 }
    ]
  },
  "Python AI": {
    teachers: ["Shahnoza Qodirova"],
    groups: [
      { name: "Python 301", price: 1000000 },
      { name: "Python 302", price: 1200000 }
    ]
  }
};

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    name: "", surname: "", username: "", password: "",
    phone: "", phone2: "", subject: "", teacher: "", group: "",
    status: "active", course_price: 0, paid_amount: 0 
  });

  useEffect(() => {
    if (formData.subject && formData.group) {
      const selectedGroup = ACADEMIC_DATA[formData.subject]?.groups.find(
        (g) => g.name === formData.group
      );
      if (selectedGroup) {
        setFormData((prev) => ({ ...prev, course_price: selectedGroup.price }));
      }
    }
  }, [formData.group, formData.subject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "course_price" ? Number(value) : value,
      ...(name === "subject" ? { teacher: "", group: "", course_price: 0 } : {}),
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const payload = { ...formData, role: "student" };
    console.log("Backendga yuboriladigan ma'lumot:", payload);
    alert("Ma'lumotlar saqlandi (Konsolni ko'ring)");
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Talaba qabul qilish</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleRegister}>
          
          {/* 1. Shaxsiy ma'lumotlar */}
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-8" style={{ color: MAIN_COLOR }}>
              <UserIcon className="h-5 w-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Shaxsiy ma'lumotlar</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <input name="name" placeholder="Ism *" onChange={handleChange} required className="full-input" />
              <input name="surname" placeholder="Familiya *" onChange={handleChange} required className="full-input" />
              <input name="phone" placeholder="Telefon *" onChange={handleChange} required className="full-input" />
              <input name="phone2" placeholder="Qo'shimcha tel (Ixtiyoriy)" onChange={handleChange} className="full-input border-dashed" />
            </div>
          </div>

          {/* 2. Akademik taqsimot */}
          <div className="p-8 lg:p-10 border-b border-slate-100 bg-slate-50/20">
            <div className="flex items-center gap-2 mb-8" style={{ color: MAIN_COLOR }}>
              <AcademicCapIcon className="h-5 w-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">O'quv ma'lumotlari</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Fan *</label>
                <select name="subject" value={formData.subject} onChange={handleChange} required className="full-input">
                  <option value="">Fanni tanlang</option>
                  {Object.keys(ACADEMIC_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase italic">O'qituvchi (Ixtiyoriy)</label>
                <select name="teacher" value={formData.teacher} onChange={handleChange} disabled={!formData.subject} className="full-input bg-white disabled:bg-slate-100 border-dashed">
                  <option value="">Tanlash ixtiyoriy</option>
                  {formData.subject && ACADEMIC_DATA[formData.subject].teachers.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase italic">Guruh (Ixtiyoriy)</label>
                <select name="group" value={formData.group} onChange={handleChange} disabled={!formData.subject} className="full-input bg-white disabled:bg-slate-100 border-dashed">
                  <option value="">Tanlash ixtiyoriy</option>
                  {formData.subject && ACADEMIC_DATA[formData.subject].groups.map(g => (
                    <option key={g.name} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Kurs summasi</label>
                <input type="number" name="course_price" value={formData.course_price} onChange={handleChange} className="full-input font-bold" style={{ color: MAIN_COLOR }} />
              </div>
            </div>
          </div>

          {/* 3. Tizim ma'lumotlari */}
          <div className="p-8 lg:p-10 bg-slate-50/50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                <p className="text-xs font-bold text-amber-900">Ushbu loginlarni talabaga bering</p>
              </div>
              <input name="username" placeholder="Username *" onChange={handleChange} required className="full-input bg-white" />
              <input name="password" type="password" placeholder="Parol *" onChange={handleChange} required className="full-input bg-white" />
            </div>
          </div>

          <div className="p-8 lg:p-10 flex justify-end gap-4 bg-white">
            <button 
              type="submit" 
              className="px-16 py-4 text-white font-bold rounded-xl shadow-lg transition-all uppercase text-sm tracking-widest hover:opacity-90 active:scale-95"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              Talabani saqlash
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .full-input {
          width: 100%; padding: 12px 16px; border: 1.5px solid #E2E8F0; border-radius: 12px;
          outline: none; font-size: 14px; color: #1e293b; transition: all 0.2s;
        }
        .full-input:focus { 
          border-color: ${MAIN_COLOR}; 
          box-shadow: 0 0 0 3px rgba(166, 14, 7, 0.05); 
        }
        .border-dashed { border-style: dashed; }
      `}</style>
    </div>
  );
};

export default StudentRegistration;