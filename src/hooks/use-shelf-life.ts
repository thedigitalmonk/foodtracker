"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { ShelfLife } from "@/lib/types";
import { addDaysToToday } from "@/lib/utils";

export function useShelfLife() {
  const [entries, setEntries] = useState<ShelfLife[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("shelf_life")
      .select("*")
      .order("category")
      .order("keyword");

    if (error) {
      console.error("Error fetching shelf life:", error);
      return;
    }
    setEntries(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const matchShelfLife = (
    name: string
  ): { days: number; keyword: string } | null => {
    const lower = name.toLowerCase();
    for (const entry of entries) {
      if (lower.includes(entry.keyword.toLowerCase())) {
        return { days: entry.days, keyword: entry.keyword };
      }
    }
    return null;
  };

  const suggestExpiryDate = (
    name: string
  ): { date: string; days: number; keyword: string } | null => {
    const match = matchShelfLife(name);
    if (!match) return null;
    return {
      date: addDaysToToday(match.days),
      days: match.days,
      keyword: match.keyword,
    };
  };

  const updateDays = async (id: string, days: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, days } : e))
    );
    const { error } = await getSupabase()
      .from("shelf_life")
      .update({ days })
      .eq("id", id);
    if (error) {
      console.error("Error updating shelf life:", error);
      await fetchEntries();
    }
  };

  const addEntry = async (
    keyword: string,
    days: number,
    category: string | null
  ): Promise<boolean> => {
    const { error } = await getSupabase()
      .from("shelf_life")
      .insert({ keyword: keyword.toLowerCase(), days, category });
    if (error) {
      console.error("Error adding shelf life entry:", error);
      return false;
    }
    await fetchEntries();
    return true;
  };

  const deleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    const { error } = await getSupabase()
      .from("shelf_life")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Error deleting shelf life entry:", error);
      await fetchEntries();
    }
  };

  return {
    entries,
    loading,
    suggestExpiryDate,
    updateDays,
    addEntry,
    deleteEntry,
  };
}
