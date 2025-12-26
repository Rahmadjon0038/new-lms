"use client"; // Next.js ishlatsangiz albatta qo'shing
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const QueriProvider = ({ children }) => {
  // QueryClient ni useState ichida yaratish tavsiya etiladi (Next.js uchun muhim)
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueriProvider;