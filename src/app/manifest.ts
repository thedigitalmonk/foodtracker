import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fridge Tracker",
    short_name: "Fridge",
    description: "Track what's in your fridge, freezer, and pantry",
    start_url: "/",
    display: "standalone",
    background_color: "#FF4545",
    theme_color: "#FF4545",
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/api/apple-icon-dark",
        sizes: "180x180",
        type: "image/png",
        // @ts-expect-error – media is valid per W3C Web App Manifest spec, not yet in TS types
        media: "(prefers-color-scheme: dark)",
      },
    ],
  };
}
