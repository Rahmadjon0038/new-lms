import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import QueriProvider from "../components/QueriProvider";

// Favicon endi fayl-konvensiyasi orqali beriladi: app/icon.png va
// app/apple-icon.png (Next.js avtomatik <link rel="icon"> yaratadi).
// Shu sabab metadata.icons olib tashlandi — default favicon.ico bilan
// ziddiyat bo'lmasligi uchun.
export const metadata = {
  title: "Taraqqiyot Teaching Center",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueriProvider>
          {children}
        </QueriProvider>
        <Toaster />
      </body>
    </html>
  );
}
