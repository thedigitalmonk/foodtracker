"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { Item } from "@/lib/types";

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("items")
      .select("*")
      .order("zone")
      .order("expiry_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching items:", error);
      return;
    }
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (
    item: Omit<Item, "id" | "created_at">
  ): Promise<boolean> => {
    const { error } = await getSupabase().from("items").insert(item);
    if (error) {
      console.error("Error adding item:", error);
      return false;
    }
    await fetchItems();
    return true;
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const { error } = await getSupabase().from("items").delete().eq("id", id);
    if (error) {
      console.error("Error deleting item:", error);
      await fetchItems();
    }
  };

  return { items, loading, addItem, deleteItem };
}
