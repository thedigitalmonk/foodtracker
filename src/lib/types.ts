export interface Item {
  id: string;
  name: string;
  quantity: string;
  zone: "Fridge" | "Freezer" | "Pantry";
  expiry_date: string | null;
  created_at: string;
}

export interface ShelfLife {
  id: string;
  keyword: string;
  days: number;
  category: string | null;
}

export type ExpiryStatus = "expired" | "expiring-soon" | "ok" | "no-date";
