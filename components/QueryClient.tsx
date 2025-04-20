"use client";

import { getQueryClient } from "@/lib/utils/getQueryClient";
import { QueryClientProvider } from "@tanstack/react-query";

interface QueryClientComponentProps {
  children: React.ReactNode;
}
export default function QueryClientComponent({
  children,
}: QueryClientComponentProps) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
