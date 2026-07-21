/**
 * Partner mode
 *
 * Couples link accounts with a one-time invite code. Once linked, plan
 * generation merges both taste profiles client-side (loves and dislikes
 * from both people), so the edge function needs no changes. RLS lets
 * linked partners read each other's user_preferences row and profile
 * name — nothing else.
 */

import { supabase } from '@/lib/supabase';
import { TasteProfile, emptyTasteProfile } from '@/types/planner';

export type PartnerState =
  | { status: 'none' }
  | { status: 'pending'; code: string }
  | { status: 'linked'; partnerName: string; partnerId: string };

// No ambiguous characters (0/O, 1/I) — codes get read aloud across a couch.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user.id;
}

export async function getPartnerState(): Promise<PartnerState> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('partner_links')
    .select('inviter, invitee, code, status')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Could not load partner state: ${error.message}`);
  if (!data) return { status: 'none' };

  if (data.status === 'pending') {
    // Only the inviter can see a pending row (invitee is null), so this is ours.
    return { status: 'pending', code: data.code };
  }

  const partnerId = data.inviter === userId ? data.invitee : data.inviter;
  if (!partnerId) return { status: 'none' };
  const { data: partner } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', partnerId)
    .maybeSingle();
  return {
    status: 'linked',
    partnerId,
    partnerName: partner?.full_name || partner?.email || 'Your partner',
  };
}

export async function createInvite(): Promise<string> {
  const userId = await requireUserId();
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = randomCode();
    const { error } = await supabase
      .from('partner_links')
      .insert({ inviter: userId, code, status: 'pending' });
    if (!error) return code;
    if (!error.message.includes('duplicate')) {
      throw new Error(`Could not create invite: ${error.message}`);
    }
  }
  throw new Error('Could not create invite. Please try again.');
}

export async function redeemCode(code: string): Promise<void> {
  const { data, error } = await supabase.rpc('redeem_partner_code', {
    p_code: code,
  });
  if (error) throw new Error(`Could not link: ${error.message}`);
  const result = data as { ok: boolean; error?: string };
  if (!result?.ok) throw new Error(result?.error ?? 'Could not link. Check the code.');
}

/** Removes the link (and any pending invite) for both people. */
export async function unlink(): Promise<void> {
  const { error } = await supabase.from('partner_links').delete().gte('created_at', '1970-01-01');
  if (error) throw new Error(`Could not unlink: ${error.message}`);
}

/** The linked partner's taste profile, or null when not linked. */
export async function getPartnerTasteProfile(): Promise<TasteProfile | null> {
  const state = await getPartnerState();
  if (state.status !== 'linked') return null;
  const { data, error } = await supabase
    .from('user_preferences')
    .select(
      'travel_style, food_loves, food_dislikes, activity_loves, activity_dislikes, music_genres, drinks, venue_style, date_budget, home_city'
    )
    .eq('user_id', state.partnerId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    ...emptyTasteProfile,
    planFor: data.travel_style,
    foodLoves: data.food_loves ?? [],
    foodDislikes: data.food_dislikes ?? [],
    activityLoves: data.activity_loves ?? [],
    activityDislikes: data.activity_dislikes ?? [],
    musicGenres: data.music_genres ?? [],
    drinks: data.drinks ?? [],
    venueStyle:
      data.venue_style === 'indoor' || data.venue_style === 'outdoor' || data.venue_style === 'both'
        ? data.venue_style
        : emptyTasteProfile.venueStyle,
    dateBudget: data.date_budget ?? emptyTasteProfile.dateBudget,
    homeCity: data.home_city ?? '',
  };
}

const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];

/**
 * Plans must delight both people: loves from either, and — crucially —
 * avoid anything EITHER person dislikes. City and budget stay the
 * planning user's (they're per-request inputs, not shared taste).
 */
export function mergeTasteProfiles(mine: TasteProfile, partner: TasteProfile): TasteProfile {
  return {
    ...mine,
    foodLoves: union(mine.foodLoves, partner.foodLoves),
    foodDislikes: union(mine.foodDislikes, partner.foodDislikes),
    activityLoves: union(mine.activityLoves, partner.activityLoves),
    activityDislikes: union(mine.activityDislikes, partner.activityDislikes),
    musicGenres: union(mine.musicGenres, partner.musicGenres),
    drinks: union(mine.drinks, partner.drinks),
  };
}
