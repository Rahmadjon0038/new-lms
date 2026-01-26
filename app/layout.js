import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import QueriProvider from "../components/QueriProvider";

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
