import { SignInForm } from "@/components";
import { MapPinIcon } from "lucide-react";
import Link from "next/link";

const SignInPage = () => {
  return (
    <div className="flex flex-col items-start max-w-sm mx-auto h-dvh overflow-hidden pt-4 md:pt-20">
      <div className="flex items-center w-full py-8 border-b border-border/80">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]">
            <MapPinIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-500 to-blue-400 bg-clip-text text-transparent">
            NammaMarg
          </span>
        </Link>
      </div>

      <SignInForm />

      <div className="flex flex-col items-start w-full">
        <p className="text-sm text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-primary">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary">Privacy Policy</Link>
        </p>
      </div>
      <div className="flex items-start mt-auto border-t border-border/80 py-6 w-full">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="text-primary">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
