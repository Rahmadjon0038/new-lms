import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import QueriProvider from "../components/QueriProvider";

export const metadata = {
  icons: {
    icon: "/logo1.png",
    apple: "/logo1.png",
  },
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
