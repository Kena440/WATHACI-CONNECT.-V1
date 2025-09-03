-- Enable row level security on listings table
alter table public.listings enable row level security;

-- Allow admins to view pending listings
create policy "Admins can view pending listings" on public.listings
for select using (
  status = 'pending' and
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.account_type = 'admin'
  )
);

-- Only admins can approve or reject listings
create policy "Admins can moderate listings" on public.listings
for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.account_type = 'admin'
  )
) with check (
  status in ('approved','rejected') and
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.account_type = 'admin'
  )
);
