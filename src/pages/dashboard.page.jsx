import { useContractorProfile } from "@/hooks/useContractorProfile";
import { useLogout } from "@/hooks/useLogout";
import { Button } from "@/components/ui/button";

const ContractorDashboard = () => {
  const { data } = useContractorProfile();
  const logoutMutation = useLogout();

  if (!data) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-6">
      <div className="bg-neutral-100 rounded-2xl shadow-lg p-8 max-w-lg w-full text-center animate-fadeIn">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Welcome,{" "}
          <span className="text-primary font-semibold">
            {data.cr97b_contractorname}
          </span>
        </h1>

        <p className="text-lg text-text-primary">
          Mr/Ms:{" "}
          <span className="font-medium text-yellow-800">
            {data.cr97b_representativename}
          </span>
        </p>

        {/* Logout Button */}
        <div className="mt-6">
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            variant="destructive"
            size="lg"
            className="w-full bg-primary"
          >
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContractorDashboard;
