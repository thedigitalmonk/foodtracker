import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fridge Tracker",
    short_name: "Fridge",
    description: "Track what's in your fridge, freezer, and pantry",
    start_url: "/",
    display: "standalone",
    background_color: "#EFF6FF",
    theme_color: "#EFF6FF",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
