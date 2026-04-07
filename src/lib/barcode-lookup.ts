interface OFFProduct {
  product_name?: string;
  generic_name?: string;
  brands?: string;
}

interface OFFResponse {
  status: number; // 1 = found, 0 = not found
  product?: OFFProduct;
}

export function formatProductName(product: OFFProduct): string {
  // Prefer generic_name (cleaner, no brand), fall back to product_name
  let name = (product.generic_name?.trim() || product.product_name?.trim() || "").trim();

  if (!name) return "";

  // Strip brand prefix if it appears at the start of the name
  if (product.brands) {
    const brands = product.brands.split(",").map((b) => b.trim());
    for (const brand of brands) {
      if (brand && name.toLowerCase().startsWith(brand.toLowerCase() + " ")) {
        name = name.slice(brand.length + 1).trim();
        break;
      }
    }
  }

  // Title-case
  name = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // Format as "Food (Variant)" if multiple words
  const words = name.split(" ").filter(Boolean);
  if (words.length >= 2) {
    const food = words[words.length - 1];
    const variant = words.slice(0, -1).join(" ");
    return `${food} (${variant})`;
  }

  return name;
}

export async function lookupBarcode(barcode: string): Promise<string | null> {
  const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
  const res = await fetch(url, {
    headers: { "User-Agent": "FoodTracker/1.0" },
  });

  if (!res.ok) return null;

  const data: OFFResponse = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const formatted = formatProductName(data.product);
  return formatted || null;
}
