import {
  BrainCircuitIcon,
  BarChart3Icon,
  MapIcon,
  MapPinIcon,
  ShieldCheckIcon,
  LayoutDashboardIcon,
} from "lucide-react";

export const NAV_LINKS = [
  {
    title: "Features",
    href: "/#features",
    menu: [
      {
        title: "AI Detection",
        tagline: "Instantly classifies potholes, garbage & street lights from a photo.",
        href: "/#features",
        icon: BrainCircuitIcon,
      },
      {
        title: "Geo-tagged Reports",
        tagline: "Precise GPS pinning so crews know exactly where the issue is.",
        href: "/#features",
        icon: MapPinIcon,
      },
      {
        title: "Smart Priority Engine",
        tagline: "Ranks deep potholes, overflowing bins, and dark streets by impact.",
        href: "/#features",
        icon: ShieldCheckIcon,
      },
      {
        title: "Live Heatmaps",
        tagline: "Real-time density maps for potholes, garbage & street lights.",
        href: "/#live-map",
        icon: MapIcon,
      },
    ],
  },
  {
    title: "Live Map",
    href: "/#live-map",
  },
  {
    title: "Dashboard",
    href: "/#dashboard",
  },
  {
    title: "Analytics",
    href: "/#analytics",
  },
];
