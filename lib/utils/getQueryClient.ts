import { QueryClient, isServer } from "@tanstack/react-query";

function createQueryClientOptions() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
}

let queryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (isServer) {
    console.log("isServer");
    return createQueryClientOptions();
  }
  if (!queryClient) {
    queryClient = createQueryClientOptions();
  }
  return queryClient;
};
