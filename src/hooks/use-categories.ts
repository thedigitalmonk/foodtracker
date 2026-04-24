"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { Category } from "@/lib/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("categories")
      .select("*")
      .order("name");
    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }
    setCategories(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const renameCategory = useCallback(async (id: string, name: string) => {
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
    const { error } = await getSupabase()
      .from("categories")
      .update({ name })
      .eq("id", id);
    if (error) {
      console.error("Error renaming category:", error);
      await fetchCategories();
    }
  }, [fetchCategories]);

  return { categories, loading, renameCategory };
}
