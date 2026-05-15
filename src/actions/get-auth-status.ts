"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const getAuthStatus = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "User not found" };
  return { success: true };
};

export default getAuthStatus;
