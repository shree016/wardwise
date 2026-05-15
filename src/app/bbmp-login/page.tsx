"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LoaderIcon, MapPinIcon, ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";

export default function BBMPLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("bbmp@wardwise.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required!");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user?.email !== "bbmp@wardwise.com") {
        toast.error("This portal is for BBMP officials only.");
        await supabase.auth.signOut();
        return;
      }
      router.push("/dashboard");
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              <MapPinIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-500 to-blue-400 bg-clip-text text-transparent">
              NammaMarg
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheckIcon className="w-5 h-5 text-violet-400" />
            <h1 className="text-2xl font-bold text-foreground">BBMP Officials Portal</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Restricted access — Bruhat Bengaluru Mahanagara Palike
          </p>
        </div>

        {/* Demo credentials card */}
        <div className="mb-6 bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
            Demo Credentials
          </p>
          <div className="space-y-1 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground select-all">bbmp@wardwise.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Password</span>
              <span className="text-foreground select-all">BBMP@2024</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Create this account in your Supabase Auth dashboard first.
          </p>
        </div>

        {/* Login form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Official Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled={isLoading}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-visible:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10 focus-visible:border-violet-500"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 right-1 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              {isLoading ? (
                <LoaderIcon className="w-5 h-5 animate-spin" />
              ) : (
                "Sign in to BBMP Dashboard"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Not a BBMP official?{" "}
            <Link href="/auth/sign-in" className="text-violet-400 hover:text-violet-300 transition-colors">
              Citizen login →
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            <Link href="/report" className="text-muted-foreground hover:text-foreground transition-colors">
              Report an issue without login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
