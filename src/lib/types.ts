export interface Item {
  id: string;
  name: string;
  quantity: string;
  zone: "Fridge" | "Freezer" | "Pantry";
  expiry_date: string | null;
  is_container: boolean;
  created_at: string;
}

export interface ShelfLife {
  id: string;
  keyword: string;
  days: number;
  category: string | null;
}

export type ExpiryStatus = "expired" | "expiring-soon" | "ok" | "no-date";

export interface Category {
  id: string;
  name: string;
  source_name: string;
}

export interface Assignment {
  item_id: string;
  category_id: string;
  is_manual: boolean;
}
