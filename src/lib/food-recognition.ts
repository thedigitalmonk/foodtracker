export interface FoodRecognitionResult {
  name: string;
  category: "fruit" | "vegetable";
  quantity: number;
  unit: "pcs" | "g" | "kg" | "bunch";
  estimated_shelf_life_days: number;
  refrigerated_shelf_life_days: number;
  confidence: "high" | "medium" | "low";
}

export function formatRecognizedQuantity(qty: number, unit: string): string {
  if (unit === "pcs") return String(qty);
  if (unit === "bunch") return `${qty} bunch`;
  return `${qty}${unit}`; // e.g. "500g", "1.5kg"
}

export function expiryDateFromDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export class HeicUnsupportedError extends Error {
  constructor() {
    super("HEIC not supported");
    this.name = "HeicUnsupportedError";
  }
}

export async function compressImage(file: File, maxWidth = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      // Canvas decoded it successfully — proceed
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Check if this is a HEIC/HEIF file that the browser can't decode
      const isHeic =
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        /\.hei[cf]$/i.test(file.name);
      if (isHeic) {
        reject(new HeicUnsupportedError());
      } else {
        reject(new Error("Image load failed"));
      }
    };
    img.src = objectUrl;
  });
}
