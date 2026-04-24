"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { Category } from "@/lib/types";

function sortCategories(list: Category[]) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

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
      setLoading(false);
      return;
    }
    setCategories(sortCategories(data ?? []));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const renameCategory = useCallback(async (id: string, name: string) => {
    // Optimistic update
    setCategories((prev) =>
      sortCategories(prev.map((c) => (c.id === id ? { ...c, name } : c)))
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

  const createCategory = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const { data, error } = await getSupabase()
      .from("categories")
      .insert({
        name: trimmed,
        source_name: `custom:${crypto.randomUUID()}`,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating category:", error);
      await fetchCategories();
      return null;
    }

    setCategories((prev) => sortCategories([...prev, data]));
    return data as Category;
  }, [fetchCategories]);

  return { categories, loading, renameCategory, createCategory };
}
