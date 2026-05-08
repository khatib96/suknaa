import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "سُكنى — منصة حجز السكن في سوريا",
    short_name: "سُكنى",
    description:
      "اكتشف واحجز بيوت عطلات وفنادق ومنتجعات في سوريا بكل سهولة.",
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FBF7F2",
    theme_color: "#C85A3D",
    icons: [
      {
        src: "/logo/suknaa-logo-color.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
