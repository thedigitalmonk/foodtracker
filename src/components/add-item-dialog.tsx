"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Check } from "lucide-react";
import { Item } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ZONES = ["Fridge", "Freezer", "Pantry"] as const;

interface AddItemDialogProps {
  onAdd: (item: Omit<Item, "id" | "created_at">) => Promise<boolean>;
  onEdit: (id: string, item: Omit<Item, "id" | "created_at">) => Promise<boolean>;
  suggestExpiry: (
    name: string
  ) => { date: string; days: number; keyword: string } | null;
  editItem?: Item | null;
  onEditClose?: () => void;
}

export function AddItemDialog({
  onAdd,
  onEdit,
  suggestExpiry,
  editItem,
  onEditClose,
}: AddItemDialogProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [zone, setZone] = useState<"Fridge" | "Freezer" | "Pantry">("Fridge");
  const [expiryDate, setExpiryDate] = useState("");
  const [suggestion, setSuggestion] = useState<{
    days: number;
    keyword: string;
  } | null>(null);
  const [manualExpiry, setManualExpiry] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editItem;
  const open = isEditing || addOpen;

  // Populate form when editItem is set
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setQuantity(editItem.quantity);
      setZone(editItem.zone);
      setExpiryDate(editItem.expiry_date ?? "");
      setSuggestion(null);
      setManualExpiry(true);
      setTimeout(() => nameRef.current?.focus(), 150);
    }
  }, [editItem]);

  // Auto-focus on add open
  useEffect(() => {
    if (addOpen && !isEditing) {
      setTimeout(() => nameRef.current?.focus(), 150);
    }
  }, [addOpen, isEditing]);

  // Suggest expiry when typing name (add mode only)
  useEffect(() => {
    if (manualExpiry || !name.trim() || isEditing) return;

    const result = suggestExpiry(name);
    if (result) {
      setExpiryDate(result.date);
      setSuggestion({ days: result.days, keyword: result.keyword });
    } else {
      if (suggestion) {
        setExpiryDate("");
        setSuggestion(null);
      }
    }
  }, [name, manualExpiry, suggestExpiry, isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setName("");
    setQuantity("1");
    setZone("Fridge");
    setExpiryDate("");
    setSuggestion(null);
    setManualExpiry(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    if (isEditing) {
      onEditClose?.();
    } else {
      setAddOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      quantity: quantity.trim() || "1",
      zone,
      expiry_date: expiryDate || null,
    };

    const success = isEditing
      ? await onEdit(editItem!.id, payload)
      : await onAdd(payload);

    if (success) {
      reset();
      if (isEditing) {
        onEditClose?.();
      } else {
        setAddOpen(false);
      }
    }
    setSubmitting(false);
  };

  return (
    <>
      {/* FAB — only for adding new items */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#18181B] text-white flex items-center justify-center shadow-lg z-50"
      >
        <Plus size={24} />
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="fixed inset-x-0 bottom-0 top-auto left-0 right-0 translate-x-0 translate-y-0 rounded-t-[20px] rounded-b-none max-w-none w-full border-0 p-0 gap-0 sm:max-w-none">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 pt-6 pb-10">
            {/* Drag handle */}
            <div className="w-9 h-1 bg-[#d1d5db] rounded-full mx-auto -mt-1 mb-1" />

            <DialogTitle className="text-[18px] font-semibold text-[#0a0a0a] tracking-normal">
              {isEditing ? "Edit Item" : "Add Item"}
            </DialogTitle>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[14px] font-medium text-[#0a0a0a]">Name</Label>
              <Input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Milk"
                required
                className="text-[16px] rounded-lg border-[#e5e5e5] bg-white h-11 px-3"
              />
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[14px] font-medium text-[#0a0a0a]">Quantity</Label>
              <Input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="text-[16px] rounded-lg border-[#e5e5e5] bg-white h-11 px-3"
              />
            </div>

            {/* Zone — segmented control */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[14px] font-medium text-[#0a0a0a]">Zone</Label>
              <div className="flex bg-[#f5f5f5] rounded-xl p-1 gap-1">
                {ZONES.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZone(z)}
                    className={cn(
                      "flex-1 h-9 rounded-lg text-[13px] font-medium transition-all",
                      zone === z
                        ? "bg-white text-[#18181B] shadow-sm"
                        : "text-[#737373]"
                    )}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry date */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[14px] font-medium text-[#0a0a0a]">
                Expiry Date <span className="text-[#a3a3a3] font-normal">(optional)</span>
              </Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => {
                  setExpiryDate(e.target.value);
                  setManualExpiry(true);
                }}
                className="text-[16px] rounded-lg border-[#e5e5e5] bg-white h-11 px-3"
              />
              {suggestion && !manualExpiry && (
                <p className="text-[12px] text-[#737373]">
                  Suggested: {suggestion.days} days ({suggestion.keyword})
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex items-center justify-center gap-2 w-full h-[50px] bg-[#171717] text-white rounded-lg text-[14px] font-medium disabled:opacity-50 mt-1"
            >
              {isEditing ? <Check size={18} /> : <Plus size={18} />}
              {submitting
                ? isEditing ? "Saving..." : "Adding..."
                : isEditing ? "Save Changes" : "Add Item"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
