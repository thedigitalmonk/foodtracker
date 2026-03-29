"use client";

import { useState, useEffect, useRef } from "react";
import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddItemDialogProps {
  onAdd: (item: Omit<Item, "id" | "created_at">) => Promise<boolean>;
  suggestExpiry: (
    name: string
  ) => { date: string; days: number; keyword: string } | null;
}

export function AddItemDialog({ onAdd, suggestExpiry }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (manualExpiry || !name.trim()) return;

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
  }, [name, manualExpiry, suggestExpiry]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setName("");
    setQuantity("1");
    setZone("Fridge");
    setExpiryDate("");
    setSuggestion(null);
    setManualExpiry(false);
    setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const success = await onAdd({
      name: name.trim(),
      quantity: quantity.trim() || "1",
      zone,
      expiry_date: expiryDate || null,
    });

    if (success) {
      reset();
      setOpen(false);
    }
    setSubmitting(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full text-2xl shadow-lg z-50"
        >
          +
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              ref={nameRef}
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Milk"
              required
              className="text-base mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="text-base mt-1"
              />
            </div>
            <div>
              <Label htmlFor="zone">Zone</Label>
              <Select
                value={zone}
                onValueChange={(v) =>
                  setZone(v as "Fridge" | "Freezer" | "Pantry")
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fridge">🧊 Fridge</SelectItem>
                  <SelectItem value="Freezer">❄️ Freezer</SelectItem>
                  <SelectItem value="Pantry">🗄️ Pantry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => {
                setExpiryDate(e.target.value);
                setManualExpiry(true);
              }}
              className="text-base mt-1"
            />
            {suggestion && !manualExpiry && (
              <p className="text-xs text-muted-foreground mt-1">
                Suggested: {suggestion.days} days ({suggestion.keyword})
              </p>
            )}
          </div>
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Adding..." : "Add Item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
