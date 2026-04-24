-- supabase/migrations/20260424000000_categories.sql

-- Categories: display name (user-editable) + source_name (immutable, used for shelf_life matching)
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  source_name text not null unique
);

-- Seed from existing shelf_life categories + Other
insert into categories (name, source_name) values
  ('Bakery',       'Bakery'),
  ('Berries',      'Berries'),
  ('Dairy',        'Dairy'),
  ('Deli',         'Deli'),
  ('Fruit',        'Fruit'),
  ('Herbs',        'Herbs'),
  ('Leafy greens', 'Leafy greens'),
  ('Meat',         'Meat'),
  ('Other',        'Other'),
  ('Protein',      'Protein'),
  ('Seafood',      'Seafood'),
  ('Vegetables',   'Vegetables')
on conflict (source_name) do nothing;

-- Item-to-category mapping (one category per item)
create table if not exists item_categories (
  item_id     uuid primary key references items(id) on delete cascade,
  category_id uuid not null references categories(id) on delete restrict,
  is_manual   boolean not null default false
);

create index if not exists idx_item_categories_category_id on item_categories (category_id);

-- RLS
alter table categories enable row level security;
create policy "Allow all access" on categories for all using (true) with check (true);

alter table item_categories enable row level security;
create policy "Allow all access" on item_categories for all using (true) with check (true);
