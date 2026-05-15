import { CameraIcon, BrainCircuitIcon, BellRingIcon } from "lucide-react";

export const DEFAULT_AVATAR_URL =
  "https://api.dicebear.com/8.x/initials/svg?backgroundType=gradientLinear&backgroundRotation=0,360&seed=";

export const PAGINATION_LIMIT = 10;

export const COMPANIES = [
  {
    name: "Asana",
    logo: "/assets/company-01.svg",
  },
  {
    name: "Tidal",
    logo: "/assets/company-02.svg",
  },
  {
    name: "Innovaccer",
    logo: "/assets/company-03.svg",
  },
  {
    name: "Linear",
    logo: "/assets/company-04.svg",
  },
  {
    name: "Raycast",
    logo: "/assets/company-05.svg",
  },
  {
    name: "Labelbox",
    logo: "/assets/company-06.svg",
  },
] as const;

export const PROCESS = [
  {
    title: "Upload a Photo",
    description:
      "Citizens capture and upload photos of potholes, garbage, broken streetlights, or any civic issue directly from their phone.",
    icon: CameraIcon,
  },
  {
    title: "AI Detects the Problem",
    description:
      "Our computer vision model instantly classifies the issue type, estimates severity, and geo-tags the location with precision.",
    icon: BrainCircuitIcon,
  },
  {
    title: "Authorities Get Notified",
    description:
      "The relevant municipal department receives an instant alert with a priority score, location map, and suggested resolution timeline.",
    icon: BellRingIcon,
  },
] as const;

export const FEATURES = [
  {
    title: "AI Issue Detection",
    description: "Computer vision instantly classifies civic issues from photos.",
  },
  {
    title: "Geo-tagged Reporting",
    description: "Precise GPS tagging for every reported civic problem.",
  },
  {
    title: "Duplicate Detection",
    description: "AI clusters similar nearby reports to avoid redundancy.",
  },
  {
    title: "Smart Priority Engine",
    description: "Automatic severity scoring to route urgent issues first.",
  },
  {
    title: "Live Civic Heatmaps",
    description: "Real-time density maps showing issue hotspots across wards.",
  },
  {
    title: "Authority Dashboard",
    description: "Municipal officers get a live command center for all issues.",
  },
] as const;

export const REVIEWS = [
  {
    name: "Priya Nair",
    username: "@priyanair_bbmp",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    rating: 5,
    review:
      "NammaMarg transformed how our ward handles complaints. Before, we relied on paper forms. Now issues are prioritised automatically and our resolution time dropped by 60%.",
  },
  {
    name: "Arjun Mehta",
    username: "@arjun_citizen",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    rating: 5,
    review:
      "I reported a pothole outside my building. Within 2 days it was fixed! The AI detection is incredible — it even estimated the road damage severity correctly.",
  },
  {
    name: "Dr. Sunita Rao",
    username: "@smartcity_hyd",
    avatar: "https://randomuser.me/api/portraits/women/13.jpg",
    rating: 5,
    review:
      "As a smart city program director, NammaMarg is the most impressive civic-tech deployment I've seen. The heatmaps alone have saved us months of manual surveying.",
  },
  {
    name: "Ravi Kumar",
    username: "@ravikumar_volunteer",
    avatar: "https://randomuser.me/api/portraits/men/14.jpg",
    rating: 4,
    review:
      "The gamification system is brilliant! I've already earned the 'Road Guardian' badge. It feels rewarding to contribute and see tangible results in my neighbourhood.",
  },
  {
    name: "Ananya Sharma",
    username: "@ananya_ngo",
    avatar: "https://randomuser.me/api/portraits/women/15.jpg",
    rating: 5,
    review:
      "Our NGO uses NammaMarg for community-driven sanitation drives. The analytics dashboard shows us exactly which areas need attention. Game changer for civic engagement.",
  },
  {
    name: "Commissioner R. Iyer",
    username: "@commissioner_bmc",
    avatar: "https://randomuser.me/api/portraits/men/16.jpg",
    rating: 5,
    review:
      "The authority dashboard gives us unprecedented visibility. We can now allocate field teams based on AI priority scoring instead of guesswork. Results speak for themselves.",
  },
  {
    name: "Meera Pillai",
    username: "@meera_rwa",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    rating: 4,
    review:
      "As an RWA president, I use NammaMarg to track pending issues in our colony. The live status updates keep residents informed and reduce frustrated calls to my office.",
  },
  {
    name: "Karthik Balaji",
    username: "@karthik_techie",
    avatar: "https://randomuser.me/api/portraits/men/18.jpg",
    rating: 5,
    review:
      "Reported a broken streetlight through the app. Got a ticket reference, live updates, and a resolution in 48 hours. This is what modern civic infrastructure looks like.",
  },
  {
    name: "Nalini Devi",
    username: "@nalini_councillor",
    avatar: "https://randomuser.me/api/portraits/women/19.jpg",
    rating: 5,
    review:
      "NammaMarg has made my ward one of the fastest responders in the city. The AI analytics tell me before citizens do where problems are clustering. Absolutely indispensable.",
  },
] as const;
