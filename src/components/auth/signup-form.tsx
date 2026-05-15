"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase-client";
import { Eye, EyeOff, LoaderIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";

const SignUpForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Name, email and password are required!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      // Session is available immediately when email confirmation is disabled
      if (signUpData.session) {
        window.location.href = '/citizen';
        return;
      }

      // No session yet — try signing in directly (handles already-registered accounts too)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        toast.error("Account created — please sign in.");
        window.location.href = '/auth/sign-in';
        return;
      }
      window.location.href = signInData.user?.email === 'bbmp@wardwise.com' ? '/dashboard' : '/citizen';
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-y-6 py-8 w-full px-0.5">
      <h2 className="text-2xl font-semibold">Create an account</h2>
      <form onSubmit={handleSignUp} className="w-full">
        <div className="space-y-2 w-full">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            disabled={isLoading}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full focus-visible:border-foreground"
          />
        </div>
        <div className="mt-4 space-y-2 w-full">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled={isLoading}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full focus-visible:border-foreground"
          />
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative w-full">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full focus-visible:border-foreground"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute top-1 right-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className="mt-4 w-full">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : "Create account"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
