create table public.generations (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  prompt text not null,
  status text not null default 'pending'::text,
  image_url text null,
  sticker_url text null,
  created_at timestamp with time zone not null default now(),
  constraint generations_pkey primary key (id)
);

-- Enable Realtime for this table
alter publication supabase_realtime add table generations;
