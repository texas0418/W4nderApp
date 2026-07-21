-- Partner mode v2: per-plan opt-in sharing with the linked partner.
-- Default off so surprise dates stay secret; the linked partner gets
-- read-only access (select policy only — never update/delete).

alter table public.date_plans
  add column if not exists shared_with_partner boolean not null default false;

drop policy if exists "Linked partner can view shared plans" on public.date_plans;
create policy "Linked partner can view shared plans"
  on public.date_plans for select
  using (
    shared_with_partner
    and exists (
      select 1 from public.partner_links pl
      where pl.status = 'linked'
        and ((pl.inviter = date_plans.user_id and pl.invitee = auth.uid())
          or (pl.invitee = date_plans.user_id and pl.inviter = auth.uid()))
    )
  );
