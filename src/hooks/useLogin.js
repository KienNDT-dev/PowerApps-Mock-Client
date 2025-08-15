import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthProvider";

export function useLogin() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      return login(email, password);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["contractorProfile"],
      });
    },
  });
}
