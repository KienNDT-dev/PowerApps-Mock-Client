import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      console.log("🍪 Cookies before logout:", document.cookie);
      return logout();
    },
    onSuccess: () => {
      queryClient.clear();

      // Check cookies after logout attempt
      setTimeout(() => {
        console.log("🍪 Cookies after logout:", document.cookie);
        const hasRtCookie = document.cookie.includes("rt=");
        if (hasRtCookie) {
          console.warn(
            "⚠️ rt cookie still present - backend may not have cleared it"
          );
        } else {
          console.log("✅ rt cookie appears to be cleared");
        }
      }, 100);

      navigate("/login", { replace: true });
      console.log("✅ Successfully logged out and redirected to login");
    },
    onError: (error) => {
      console.error("❌ Logout error:", error);
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
}
