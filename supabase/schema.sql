-- Items table
create table if not exists items (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  quantity     text not null,
  zone         text not null check (zone in ('Fridge', 'Freezer', 'Pantry')),
  expiry_date  date,
  is_container boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists idx_items_zone_expiry on items (zone, expiry_date asc nulls last);

-- Shelf life lookup table (editable by users)
create table if not exists shelf_life (
  id       uuid primary key default gen_random_uuid(),
  keyword  text not null unique,
  days     integer not null,
  category text
);

-- RLS: allow all access (no auth needed)
alter table items enable row level security;
create policy "Allow all access" on items for all using (true) with check (true);

alter table shelf_life enable row level security;
create policy "Allow all access" on shelf_life for all using (true) with check (true);

-- Seed default shelf life data
insert into shelf_life (keyword, days, category) values
  ('spinach', 5, 'Leafy greens'),
  ('lettuce', 5, 'Leafy greens'),
  ('kale', 5, 'Leafy greens'),
  ('arugula', 5, 'Leafy greens'),
  ('strawberries', 5, 'Berries'),
  ('blueberries', 5, 'Berries'),
  ('raspberries', 5, 'Berries'),
  ('bananas', 5, 'Fruit'),
  ('apples', 21, 'Fruit'),
  ('oranges', 14, 'Fruit'),
  ('grapes', 7, 'Fruit'),
  ('avocado', 5, 'Fruit'),
  ('tomatoes', 7, 'Vegetables'),
  ('cucumber', 7, 'Vegetables'),
  ('bell pepper', 7, 'Vegetables'),
  ('broccoli', 7, 'Vegetables'),
  ('carrots', 14, 'Vegetables'),
  ('celery', 14, 'Vegetables'),
  ('potatoes', 21, 'Vegetables'),
  ('onions', 30, 'Vegetables'),
  ('mushrooms', 5, 'Vegetables'),
  ('cilantro', 5, 'Herbs'),
  ('parsley', 5, 'Herbs'),
  ('basil', 5, 'Herbs'),
  ('milk', 10, 'Dairy'),
  ('yogurt', 14, 'Dairy'),
  ('cream cheese', 14, 'Dairy'),
  ('cheese', 21, 'Dairy'),
  ('butter', 30, 'Dairy'),
  ('eggs', 28, 'Dairy'),
  ('chicken', 2, 'Meat'),
  ('ground beef', 2, 'Meat'),
  ('steak', 3, 'Meat'),
  ('fish', 2, 'Seafood'),
  ('shrimp', 2, 'Seafood'),
  ('salmon', 2, 'Seafood'),
  ('bread', 5, 'Bakery'),
  ('tortillas', 14, 'Bakery'),
  ('hummus', 7, 'Deli'),
  ('tofu', 7, 'Protein')
on conflict (keyword) do nothing;
