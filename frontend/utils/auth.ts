import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const isOfficialUser = (email: string | undefined) => {
  return email === 'bbmp@wardwise.com';
};

export const isCitizenUser = (email: string | undefined) => {
  return email !== 'bbmp@wardwise.com';
};

export const signOut = async () => {
  await supabase.auth.signOut();
};