"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { Assignment, Category, Item, ShelfLife } from "@/lib/types";

export function useCategoryAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const fetchAssignments = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("item_categories")
      .select("item_id, category_id, is_manual");
    if (error) {
      console.error("Error fetching assignments:", error);
      return;
    }
    setAssignments(data ?? []);
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Assign an item to a category manually (is_manual = true, never auto-overwritten)
  const assignCategory = useCallback(async (itemId: string, categoryId: string) => {
    setAssignments((prev) => {
      const rest = prev.filter((a) => a.item_id !== itemId);
      return [...rest, { item_id: itemId, category_id: categoryId, is_manual: true }];
    });
    const { error } = await getSupabase()
      .from("item_categories")
      .upsert({ item_id: itemId, category_id: categoryId, is_manual: true });
    if (error) {
      console.error("Error assigning category:", error);
      await fetchAssignments();
    }
  }, [fetchAssignments]);

  // Auto-infer categories for items that have no assignment yet.
  // Skips items that already have any assignment (manual or not).
  const inferAndAssign = useCallback(async (
    items: Item[],
    shelfLifeEntries: ShelfLife[],
    categories: Category[]
  ) => {
    if (items.length === 0 || categories.length === 0) return;

    // Fetch current assignments fresh to avoid stale closure
    const { data: current } = await getSupabase()
      .from("item_categories")
      .select("item_id")
      .in("item_id", items.map((i) => i.id));

    const assignedIds = new Set((current ?? []).map((a) => a.item_id));
    const otherCategory = categories.find((c) => c.source_name === "Other");
    if (!otherCategory) return;

    const upserts = items
      .filter((item) => !assignedIds.has(item.id))
      .map((item) => {
        const lower = item.name.toLowerCase();
        const match = shelfLifeEntries.find((e) =>
          lower.includes(e.keyword.toLowerCase())
        );
        const sourceName = match?.category ?? "Other";
        const category =
          categories.find((c) => c.source_name === sourceName) ?? otherCategory;
        return { item_id: item.id, category_id: category.id, is_manual: false };
      });

    if (upserts.length === 0) return;

    const { error } = await getSupabase()
      .from("item_categories")
      .upsert(upserts);
    if (error) {
      console.error("Error inferring categories:", error);
    }
    await fetchAssignments();
  }, [fetchAssignments]);

  return { assignments, assignCategory, inferAndAssign };
}
