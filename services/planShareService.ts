/**
 * Plan Share Service
 *
 * Tokenized share links for "receive the date": the sharer gets a stable
 * token per plan, and recipients — with or without an account — resolve it
 * to spoiler-free details via the get_shared_plan RPC.
 */

import { supabase } from '@/lib/supabase';

export const SHARE_PAGE_BASE = 'https://texas0418.github.io/W4nderApp/date.html';

export interface SharedPlanCard {
  plannerName: string;
  planDate: string | null;
  startTime: string | null;
  stopCount: number;
}

/** Stable surprise-share token for a plan (created on first share, reused after). */
export async function getSurpriseShareToken(planId: string): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('plan_shares')
    .upsert({ plan_id: planId, user_id: user.id, kind: 'surprise' }, { onConflict: 'plan_id,kind' })
    .select('token')
    .single();

  if (error) throw new Error(`Could not create share link: ${error.message}`);
  return data.token;
}

export function buildShareUrl(token: string): string {
  return `${SHARE_PAGE_BASE}?t=${token}`;
}

/** Resolve a share token to its spoiler-free card (works signed in or out). */
export async function getSharedPlan(token: string): Promise<SharedPlanCard | null> {
  const { data, error } = await supabase.rpc('get_shared_plan', { share_token: token });
  if (error) throw new Error(`Could not load this date: ${error.message}`);
  return (data as unknown as SharedPlanCard | null) ?? null;
}
