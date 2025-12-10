// components/admistrator/ViewStudentPay.jsx
// Minimalistik, borderlarsiz, zamonaviy UI, kattalashtirilgan modal.

"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";

// Mock Student Data (o'zgarishsiz)
const mockStudentsData = [
  // Teacher ID 6 (Farrux Olimov) uchun namunalar
  {
    id: 601,
    name: "Umid Shodiyev",
    teacherId: 6,
    paymentStatus: "Paid",
    amount: 150000,
  },
  {
    id: 602,
    name: "Aziza Vohidova",
    teacherId: 6,
    paymentStatus: "Paid",
    amount: 150000,
  },
  {
    id: 603,
    name: "Jahongir Tolipov",
    teacherId: 6,
    paymentStatus: "Unpaid",
    amount: 150000,
  },
  {
    id: 604,
    name: "G'ayrat Hamidov",
    teacherId: 6,
    paymentStatus: "Unpaid",
    amount: 150000,
  },
  // Teacher ID 1 (Jasur Raximov) uchun namunalar
  {
    id: 101,
    name: "Ali Valiyev",
    teacherId: 1,
    paymentStatus: "Paid",
    amount: 300000,
  },
  {
    id: 105,
    name: "Lola Sobirova",
    teacherId: 1,
    paymentStatus: "Unpaid",
    amount: 300000,
  },
  {
    id: 106,
    name: "Sardor Ibrohimov",
    teacherId: 1,
    paymentStatus: "Paid",
    amount: 300000,
  },
  {
    id: 107,
    name: "Doston Akramov",
    teacherId: 1,
    paymentStatus: "Unpaid",
    amount: 300000,
  },
];

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  maxWidth: 900,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24, // Asosiy modal soyasi
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

export default function ViewStudentPay({ children, teacher }) {
  if (!teacher || !teacher.id) {
    return <button onClick={() => {}}>{children}</button>;
  }

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const students = React.useMemo(() => {
    return mockStudentsData.filter((s) => s.teacherId === teacher.id);
  }, [teacher.id]);

  const paidStudents = students.filter((s) => s.paymentStatus === "Paid");
  const unpaidStudents = students.filter((s) => s.paymentStatus === "Unpaid");

  const renderStudentList = (studentList, isPaid) => (
    <div className="mt-6">
      <h3
        className={`text-xl font-bold px-4 py-3 rounded-lg shadow-md flex items-center ${
          isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isPaid ? (
          <CheckBadgeIcon className="h-6 w-6 mr-3" />
        ) : (
          <ReceiptPercentIcon className="h-6 w-6 mr-3" />
        )}
        {isPaid ? "To'lov Qilgan O'quvchilar" : "To'lov Qilmaganlar (Qarzdor)"}
        <span className="ml-4 text-sm font-semibold py-1 px-3 rounded-full bg-white/70 shadow-sm">
          {studentList.length} ta
        </span>
      </h3>

      {/* List container: Minimalistik soyali ro'yxat */}
      <div className="rounded-lg shadow-lg overflow-hidden mt-3">
        {studentList.length > 0 ? (
          studentList.map((student, index) => (
            <div
              key={student.id}
              // Har bir qator uchun hover effekti va orqa fon rangi farqi
              className={`flex justify-between items-center p-4 hover:bg-blue-50/50 transition duration-150 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              {/* O'quvchi ismi */}
              <div className="flex items-center space-x-3 w-1/2">
                <span
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    isPaid
                      ? "bg-green-200 text-green-700"
                      : "bg-red-200 text-red-700"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <Typography
                    variant="body1"
                    component="span"
                    className="font-semibold text-gray-800"
                  >
                    {student.name}
                  </Typography>
                </div>
              </div>

              {/* Summa va holat */}
              <div className="text-right flex items-center space-x-4">
                <div className="flex items-center space-x-1 py-1 px-3 rounded-full font-bold text-sm bg-gray-100 shadow-inner">
                  <span>{student.amount.toLocaleString("uz-UZ")} UZS</span>{" "}
                </div>

                <span
                  className={`text-xs font-semibold py-1 px-3 rounded-full shadow-md ${
                    isPaid ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {isPaid ? "TO'LANDI" : "QARZDOR"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-gray-500 bg-white">
            Bu ro'yxatda o'quvchi yo'q.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <button onClick={handleOpen}>{children}</button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="student-pay-modal-title"
        aria-describedby="student-pay-modal-description"
      >
        <Box sx={style}>
          {/* Sarlavha: Yuqori darajadagi minimalistik ko'rinish */}
          <div className="flex justify-between items-start mb-6 pb-4">
            <Typography
              id="student-pay-modal-title"
              variant="h5"
              component="h2"
              className="font-extrabold text-gray-900 flex items-center space-x-3"
            >
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              <span>O'qituvchi Hisoboti: {teacher.name}</span>
            </Typography>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-red-500 p-2 transition duration-150 rounded-full bg-gray-100 hover:bg-red-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* O'quvchilar Ro'yxati */}
          <div className="space-y-8">
            {renderStudentList(paidStudents, true)}
            {renderStudentList(unpaidStudents, false)}
          </div>
        </Box>
      </Modal>
    </div>
  );
}
