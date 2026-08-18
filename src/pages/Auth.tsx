import { motion } from "framer-motion";
import { ArrowRight, Loader2, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.svg";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);

      setError("The verification code you entered is incorrect.");
      setIsLoading(false);

      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Failed to sign in as guest: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal nav */}
      <nav className="flex h-14 items-center justify-between px-6">
        <button
          onClick={() => navigate("/")}
          className="flex cursor-pointer items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <img src={logo} alt="" width={24} height={24} className="rounded-md" />
          <span className="text-sm font-semibold tracking-tight">hermes</span>
        </button>
      </nav>

      {/* Auth content */}
      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {step === "signIn" ? (
            <div className="space-y-8">
              <div>
                <span className="mb-6 flex size-10 items-center justify-center rounded-lg border border-border bg-card">
                  <img src={logo} alt="" width={24} height={24} className="rounded" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight">
                  Get started
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email to sign in or create an account
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  name="email"
                  placeholder="Email address"
                  type="email"
                  disabled={isLoading}
                  required
                  className="h-11"
                />

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground tracking-wider">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  <UserX className="size-4" />
                  Continue as guest
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <span className="mb-6 flex size-10 items-center justify-center rounded-lg border border-border bg-card">
                  <img src={logo} alt="" width={24} height={24} className="rounded" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight">
                  Check your email
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We sent a verification code to{" "}
                  <span className="font-medium text-foreground">
                    {step.email}
                  </span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <input type="hidden" name="email" value={step.email} />
                <input type="hidden" name="code" value={otp} />

                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                        const form = (e.target as HTMLElement).closest("form");
                        if (form) form.requestSubmit();
                      }
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="text-center text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Verify
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Didn&apos;t receive a code?{" "}
                    <button
                      type="button"
                      onClick={() => setStep("signIn")}
                      className="cursor-pointer text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors"
                    >
                      Try a different email
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}

          <div className="mt-16 border-t border-border/40 pt-6 text-center">
            <p className="text-[11px] text-muted-foreground/60">
              Secured by{" "}
              <a
                href="https://freebuff.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
              >
                freebuff.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}