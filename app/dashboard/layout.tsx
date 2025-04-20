import QueryClientComponent from "@/components/QueryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientComponent>
      {children}
      <ReactQueryDevtools />
    </QueryClientComponent>
  );
}
