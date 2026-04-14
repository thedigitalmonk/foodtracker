"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Item } from "@/lib/types";
import { ItemCard } from "./item-card";

interface SortableItemCardProps {
  item: Item;
  onDelete: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (item: Item) => void;
}

export function SortableItemCard({ item, onDelete, onDecrement, onEdit }: SortableItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={isDragging ? "opacity-0" : undefined}
      {...attributes}
      {...listeners}
    >
      <ItemCard item={item} onDelete={onDelete} onDecrement={onDecrement} onEdit={onEdit} />
    </div>
  );
}
