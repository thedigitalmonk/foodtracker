"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { ShelfLife } from "@/lib/types";
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

interface ShelfLifeDialogProps {
  entries: ShelfLife[];
  onUpdateDays: (id: string, days: number) => void;
  onAdd: (
    keyword: string,
    days: number,
    category: string | null
  ) => Promise<boolean>;
  onDelete: (id: string) => void;
}

export function ShelfLifeDialog({
  entries,
  onUpdateDays,
  onAdd,
  onDelete,
}: ShelfLifeDialogProps) {
  const [open, setOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newDays, setNewDays] = useState("7");
  const [newCategory, setNewCategory] = useState("");

  const grouped = entries.reduce<Record<string, ShelfLife[]>>((acc, entry) => {
    const cat = entry.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entry);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;
    const success = await onAdd(
      newKeyword.trim(),
      parseInt(newDays) || 7,
      newCategory.trim() || null
    );
    if (success) {
      setNewKeyword("");
      setNewDays("7");
      setNewCategory("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Settings size={18} className="text-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shelf Life Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new entry */}
          <div className="border rounded-lg p-3 bg-muted/50">
            <p className="text-sm font-medium mb-2">Add New</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Keyword</Label>
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. tofu"
                  className="text-sm mt-0.5"
                />
              </div>
              <div>
                <Label className="text-xs">Days</Label>
                <Input
                  type="number"
                  value={newDays}
                  onChange={(e) => setNewDays(e.target.value)}
                  min="1"
                  className="text-sm mt-0.5"
                />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Dairy"
                  className="text-sm mt-0.5"
                />
              </div>
            </div>
            <Button
              size="sm"
              className="mt-2 w-full"
              onClick={handleAdd}
              disabled={!newKeyword.trim()}
            >
              Add
            </Button>
          </div>

          {/* Existing entries grouped by category */}
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {grouped[category].map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50"
                  >
                    <span className="text-sm flex-1">{entry.keyword}</span>
                    <Input
                      type="number"
                      value={entry.days}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 0) onUpdateDays(entry.id, val);
                      }}
                      min="1"
                      className="w-20 h-8 text-sm text-center"
                    />
                    <span className="text-xs text-muted-foreground w-8">
                      days
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(entry.id)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
