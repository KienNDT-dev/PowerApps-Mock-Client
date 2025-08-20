import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import logoUrl from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const loginMutation = useLogin();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    loginMutation.mutate(
      { email: formData.email, password: formData.password },
      {
        onSuccess: (data) => {
          navigate("/");
        },
        onError: (error) => {
          let message =
            error?.data?.error?.message || error?.message || "Login failed. Please try again.";
          setErrors({
            submit: message,
          });
        },
      }
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-neutral-200 dark:bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex min-h-screen flex-col">
          {/* Mobile Header */}
          <div className="bg-primary px-6 py-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logoUrl || "/placeholder.svg"} alt="Company logo" className="h-8 w-auto" />
              <h1 className="text-xl font-semibold text-neutral-100">MyApp</h1>
            </div>
            <p className="text-neutral-100/90 text-sm">Welcome back! Please sign in to continue.</p>
          </div>

          {/* Mobile Form */}
          <div className="flex-1 px-6 py-8">
            <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 bg-card border-0 shadow-lg">
              <CardHeader className="space-y-1 pb-6">
                <h2 className="text-2xl font-semibold text-text-primary">Sign In</h2>
                <p className="text-muted-foreground text-sm">
                  Enter your credentials to access your account
                </p>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {errors.submit && (
                    <div className="p-3 text-sm text-error bg-error/10 rounded-md border border-error/20 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.submit}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-text-primary">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loginMutation.isLoading}
                      aria-invalid={!!errors.email}
                      className={errors.email ? "ring-2 ring-error border-error" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-error" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-text-primary">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loginMutation.isLoading}
                        aria-invalid={!!errors.password}
                        className={`pr-10 ${errors.password ? "ring-2 ring-error border-error" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        disabled={loginMutation.isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-error" role="alert">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className={`w-full bg-primary text-neutral-100 hover:bg-primary/90 transition-colors ${
                      loginMutation.isLoading
                        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                        : ""
                    }`}
                    disabled={loginMutation.isLoading}
                    aria-busy={loginMutation.isLoading}
                  >
                    {loginMutation.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <Separator />
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Brand Panel */}
        <div className="flex-1 bg-primary flex flex-col justify-center items-center px-12 text-center">
          <div className="max-w-md">
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
              <img src={logoUrl} alt="Lof logo" className="h-16 w-auto" />
              <h1 className="text-3xl font-bold text-neutral-100">Lof</h1>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-100 mb-4">Welcome, Contractor</h2>
            <p className="text-neutral-100/90 text-lg leading-relaxed">
              Sign in to access your bidding invitations, submit proposals, and track your progress
              with ease.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex items-center justify-center px-12">
          <div className="w-full max-w-md">
            <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 bg-card border-0 shadow-xl">
              <CardHeader className="space-y-1 pb-8">
                <h2 className="text-3xl font-semibold text-text-primary">Sign In</h2>
                <p className="text-muted-foreground">
                  Enter your credentials to access your account
                </p>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {errors.submit && (
                    <div className="p-4 text-sm text-error bg-error/10 rounded-md border border-error/20 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-error flex-shrink-0" />
                      {errors.submit}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="desktop-email" className="text-text-primary font-medium">
                      Email
                    </Label>
                    <Input
                      id="desktop-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loginMutation.isLoading}
                      aria-invalid={!!errors.email}
                      className={`h-11 ${errors.email ? "ring-2 ring-error border-error" : ""}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-error" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desktop-password" className="text-text-primary font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="desktop-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loginMutation.isLoading}
                        aria-invalid={!!errors.password}
                        className={`h-11 pr-11 ${errors.password ? "ring-2 ring-error border-error" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        disabled={loginMutation.isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-error" role="alert">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-6 pt-6">
                  <Button
                    type="submit"
                    className={`w-full bg-primary text-neutral-100 hover:bg-primary/90 transition-colors ${
                      loginMutation.isLoading
                        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                        : ""
                    }`}
                    disabled={loginMutation.isLoading}
                    aria-busy={loginMutation.isLoading}
                  >
                    {loginMutation.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <Separator />
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
