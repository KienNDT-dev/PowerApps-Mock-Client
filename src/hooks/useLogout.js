import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      return logout();
    },
    onSuccess: () => {
      queryClient.clear();

      // Check cookies after logout attempt
      setTimeout(() => {
        const hasRtCookie = document.cookie.includes("rt=");
        if (hasRtCookie) {
          console.warn("⚠️ rt cookie still present - backend may not have cleared it");
        } else {
        }
      }, 100);

      navigate("/login", { replace: true });
    },
    onError: (error) => {
      console.error("❌ Logout error:", error);
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
}
