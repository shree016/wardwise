"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

const AuthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email || '';
      router.push(email === 'bbmp@wardwise.com' ? '/dashboard' : '/citizen');
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center flex-col h-screen relative">
      <div className="border-[3px] border-neutral-800 rounded-full border-b-neutral-200 animate-loading w-8 h-8" />
      <p className="text-lg font-medium text-center mt-3">Signing you in...</p>
    </div>
  );
};

export default AuthCallbackPage;
