import { AnimationContainer, MaxWidthWrapper } from "@/components";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LampContainer } from "@/components/ui/lamp";
import MagicBadge from "@/components/ui/magic-badge";
import MagicCard from "@/components/ui/magic-card";
import { PROCESS } from "@/utils";
import { REVIEWS } from "@/utils/constants/misc";
import {
  ArrowRightIcon,
  BrainCircuitIcon,
  MapPinIcon,
  LayersIcon,
  ZapIcon,
  MapIcon,
  LayoutDashboardIcon,
  StarIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ActivityIcon,
  UsersIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  BarChart3Icon,
  TrendingUpIcon,
  RadioIcon,
} from "lucide-react";
import Link from "next/link";

/* ─── Inline visual components ─────────────────────────────── */

const DashboardMockup = () => (
  <div className="relative w-full rounded-2xl overflow-hidden border border-violet-500/20 dark:border-violet-500/30 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0a14] dark:to-[#0d0d20] shadow-2xl dark:shadow-[0_0_80px_rgba(139,92,246,0.15)]">
    {/* Top bar */}
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-white/50 dark:bg-white/5">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
      </div>
      <div className="flex-1 h-6 rounded-md bg-slate-100 dark:bg-white/10 text-xs flex items-center px-3 text-slate-400 dark:text-white/30 font-mono">
        nammamarg.app/dashboard
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-green-500 font-medium">LIVE</span>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-4 gap-2 p-4">
      {[
        { label: "Potholes", value: "412", delta: "+18%", color: "text-violet-500" },
        { label: "Garbage", value: "289", delta: "+11%", color: "text-orange-500" },
        { label: "Street Lights", value: "146", delta: "+7%", color: "text-blue-500" },
        { label: "Resolved Today", value: "234", delta: "+28%", color: "text-green-500" },
      ].map((stat, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/30 dark:border-white/10 bg-white/80 dark:bg-white/5 p-3 flex flex-col gap-1"
        >
          <span className="text-xs text-muted-foreground">{stat.label}</span>
          <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
          <span className="text-xs text-green-500 font-medium">{stat.delta}</span>
        </div>
      ))}
    </div>

    {/* Chart + Map row */}
    <div className="grid grid-cols-5 gap-3 px-4 pb-4">
      {/* Bar chart */}
      <div className="col-span-3 rounded-xl border border-border/30 dark:border-white/10 bg-white/80 dark:bg-white/5 p-3">
        <div className="text-xs font-medium text-foreground mb-3 flex items-center gap-1">
          <BarChart3Icon className="w-3 h-3 text-violet-500" />
          Issues by Category (7 days)
        </div>
        <div className="flex items-end gap-2 h-20">
          {[65, 40, 80, 55, 90, 45, 70].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm bg-gradient-to-t from-violet-600 to-blue-400 dark:from-violet-500 dark:to-blue-400 opacity-80"
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground">
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Issue types */}
      <div className="col-span-2 rounded-xl border border-border/30 dark:border-white/10 bg-white/80 dark:bg-white/5 p-3">
        <div className="text-xs font-medium text-foreground mb-3 flex items-center gap-1">
          <AlertTriangleIcon className="w-3 h-3 text-orange-400" />
          Critical Issues
        </div>
        {[
          { label: "Potholes", count: 412, pct: 80 },
          { label: "Garbage Dumps", count: 289, pct: 56 },
          { label: "Street Lights", count: 146, pct: 32 },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
              <span>{item.label}</span>
              <span className="font-medium text-foreground">{item.count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-border/50 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
        <div className="mt-3 flex items-center gap-1 text-[10px] text-green-500 font-medium">
          <CheckCircle2Icon className="w-3 h-3" />
          12 resolved in last hour
        </div>
      </div>
    </div>
  </div>
);

const MapMockup = () => (
  <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-violet-500/20 dark:border-violet-500/30 bg-gradient-to-br from-slate-100 to-blue-50 dark:from-[#070712] dark:to-[#0a0a18]">
    {/* Grid overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.07)_1px,transparent_1px)] bg-[size:40px_40px]" />

    {/* Heatmap blobs */}
    <div className="absolute top-1/4 left-1/3 w-32 h-24 rounded-full bg-red-500/20 dark:bg-red-500/25 blur-2xl" />
    <div className="absolute top-1/2 right-1/4 w-24 h-20 rounded-full bg-orange-400/20 dark:bg-orange-400/20 blur-2xl" />
    <div className="absolute bottom-1/4 left-1/4 w-20 h-16 rounded-full bg-yellow-400/15 dark:bg-yellow-400/15 blur-xl" />
    <div className="absolute top-1/3 right-1/3 w-16 h-14 rounded-full bg-violet-500/20 dark:bg-violet-500/25 blur-xl" />

    {/* Issue pins */}
    {[
      { top: "28%", left: "35%", color: "bg-red-500", size: "w-4 h-4", label: "Pothole" },
      { top: "50%", left: "60%", color: "bg-orange-400", size: "w-3 h-3", label: "Garbage" },
      { top: "40%", left: "50%", color: "bg-yellow-400", size: "w-3 h-3", label: "Street Light" },
      { top: "65%", left: "30%", color: "bg-red-400", size: "w-3 h-3", label: "Pothole" },
      { top: "22%", left: "65%", color: "bg-orange-500", size: "w-3.5 h-3.5", label: "Garbage" },
      { top: "55%", left: "20%", color: "bg-green-400", size: "w-2.5 h-2.5", label: "Fixed" },
      { top: "70%", left: "55%", color: "bg-yellow-300", size: "w-2.5 h-2.5", label: "Street Light" },
    ].map((pin, i) => (
      <div
        key={i}
        className="absolute flex flex-col items-center group"
        style={{ top: pin.top, left: pin.left }}
      >
        <div
          className={`${pin.size} ${pin.color} rounded-full shadow-lg animate-pulse ring-2 ring-white/30 dark:ring-black/30 cursor-pointer`}
        />
        <div className="hidden group-hover:flex absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-md">
          {pin.label}
        </div>
        {/* Ripple */}
        <div
          className={`absolute ${pin.color} opacity-25 rounded-full animate-ping`}
          style={{ width: pin.size.split(" ")[0].replace("w-", "") + "px", height: pin.size.split(" ")[1].replace("h-", "") + "px" }}
        />
      </div>
    ))}

    {/* Ward boundaries (simplified) */}
    <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-30" viewBox="0 0 400 300">
      <polygon points="60,60 180,40 200,140 80,150" fill="none" stroke="rgba(139,92,246,0.6)" strokeWidth="1" strokeDasharray="4,3" />
      <polygon points="200,40 320,60 310,160 200,140" fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="1" strokeDasharray="4,3" />
      <polygon points="80,150 200,140 210,240 90,230" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1" strokeDasharray="4,3" />
      <polygon points="200,140 310,160 300,240 210,240" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="1" strokeDasharray="4,3" />
    </svg>

    {/* Legend */}
    <div className="absolute bottom-3 right-3 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-xl border border-border/40 dark:border-white/10 p-2 text-[10px] space-y-1">
      {[
        { color: "bg-red-500", label: "Pothole" },
        { color: "bg-orange-400", label: "Garbage" },
        { color: "bg-yellow-400", label: "Street Light" },
        { color: "bg-green-400", label: "Resolved" },
      ].map((l, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${l.color}`} />
          <span className="text-foreground/70">{l.label}</span>
        </div>
      ))}
    </div>

    {/* Top label */}
    <div className="absolute top-3 left-3 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-xl border border-border/40 dark:border-violet-500/30 px-3 py-1.5 flex items-center gap-2">
      <RadioIcon className="w-3 h-3 text-violet-500 animate-pulse" />
      <span className="text-xs font-semibold text-foreground">Live City Map</span>
    </div>
  </div>
);

/* ─── Main page ─────────────────────────────────────────────── */

const HomePage = () => {
  const CIVIC_FEATURES = [
    {
      icon: BrainCircuitIcon,
      title: "AI Issue Detection",
      description:
        "One photo is all it takes — our computer vision model identifies potholes, overflowing garbage, and faulty street lights instantly and accurately.",
      gradient: "from-violet-500 to-purple-600",
      glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
    },
    {
      icon: MapPinIcon,
      title: "Geo-tagged Reporting",
      description:
        "Every pothole, garbage pile, or broken light is pinned with precise GPS coordinates and ward boundaries so crews know exactly where to go.",
      gradient: "from-blue-500 to-cyan-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    },
    {
      icon: LayersIcon,
      title: "Duplicate Detection",
      description:
        "AI clusters multiple reports of the same pothole or garbage spot within a 50 m radius, so field teams never investigate the same issue twice.",
      gradient: "from-indigo-500 to-blue-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]",
    },
    {
      icon: ZapIcon,
      title: "Smart Priority Engine",
      description:
        "Deep potholes on arterial roads, overflowing bins near hospitals, or dark streets at night — the AI ranks every issue by real-world impact and urgency.",
      gradient: "from-amber-500 to-orange-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]",
    },
    {
      icon: MapIcon,
      title: "Live Civic Heatmaps",
      description:
        "See pothole clusters, garbage hotspots, and dark-street zones light up in real time across every ward — enabling proactive resource deployment.",
      gradient: "from-violet-500 to-indigo-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
    },
    {
      icon: LayoutDashboardIcon,
      title: "Authority Dashboard",
      description:
        "BBMP, BMC, and municipal officers get a unified command centre with live pothole, garbage, and street-light feeds, SLA timers, and one-click resolution.",
      gradient: "from-green-500 to-emerald-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]",
    },
  ];

  const BADGES = [
    { icon: "🕳️", title: "Pothole Buster", desc: "20+ potholes flagged", color: "from-violet-500 to-purple-600" },
    { icon: "🗑️", title: "Clean City Champ", desc: "30+ garbage spots cleared", color: "from-green-400 to-emerald-500" },
    { icon: "💡", title: "Light Keeper", desc: "15+ street lights fixed", color: "from-yellow-400 to-amber-500" },
    { icon: "🛡️", title: "Road Guardian", desc: "50+ road issues reported", color: "from-blue-400 to-indigo-500" },
    { icon: "🌟", title: "Ward Star", desc: "Top reporter this week", color: "from-violet-400 to-purple-500" },
    { icon: "🏆", title: "Civic Hero", desc: "100+ total reports", color: "from-amber-400 to-orange-500" },
  ];

  const ANALYTICS_STATS = [
    { icon: ActivityIcon, label: "Potholes Reported", value: "820K+", sub: "across 14 cities", color: "text-violet-500" },
    { icon: ActivityIcon, label: "Garbage Spots Cleared", value: "540K+", sub: "avg. turnaround 48hrs", color: "text-orange-500" },
    { icon: ActivityIcon, label: "Street Lights Fixed", value: "210K+", sub: "avg. turnaround 24hrs", color: "text-yellow-500" },
    { icon: CheckCircle2Icon, label: "Resolution Rate", value: "87%", sub: "avg. within 72hrs", color: "text-green-500" },
    { icon: UsersIcon, label: "Active Citizens", value: "340K+", sub: "and growing daily", color: "text-indigo-500" },
    { icon: ShieldCheckIcon, label: "SLA Compliance", value: "95%", sub: "+28% vs last quarter", color: "text-amber-500" },
  ];

  const LEADERBOARD = [
    { rank: 1, name: "Ananya R.", ward: "Ward 12", points: 4850, badge: "Civic Hero" },
    { rank: 2, name: "Karthik B.", ward: "Ward 7", points: 4200, badge: "Road Guardian" },
    { rank: 3, name: "Priya M.", ward: "Ward 31", points: 3990, badge: "Clean City Champion" },
    { rank: 4, name: "Ravi K.", ward: "Ward 19", points: 3450, badge: "Ward Star" },
    { rank: 5, name: "Divya S.", ward: "Ward 5", points: 3100, badge: "Light Keeper" },
  ];

  return (
    <div className="overflow-x-hidden scrollbar-hide size-full">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <MaxWidthWrapper>
        <div className="flex flex-col items-center justify-center w-full text-center bg-gradient-to-t from-background">
          <AnimationContainer className="flex flex-col items-center justify-center w-full text-center">
            {/* Badge */}
            <button className="group relative grid overflow-hidden rounded-full px-4 py-1 shadow-[0_1000px_0_0_hsl(263_83%_58%_/_15%)_inset] transition-colors duration-200 mb-2">
              <span>
                <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
              </span>
              <span className="backdrop absolute inset-[1px] rounded-full bg-background transition-colors duration-200 group-hover:bg-secondary/50" />
              <span className="h-full w-full blur-md absolute bottom-0 inset-x-0 bg-gradient-to-tr from-violet-500/20 to-blue-500/20" />
              <span className="z-10 py-0.5 text-sm text-foreground/80 flex items-center justify-center gap-1.5">
                <span className="text-violet-500">✦</span>
                Potholes · Garbage · Street Lights — Fixed with AI
                <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </span>
            </button>

            <h1 className="text-foreground text-center py-6 text-4xl font-medium tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl !leading-[1.1] w-full font-heading">
              <span className="text-transparent bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 bg-clip-text">
                AI-Powered
              </span>{" "}
              Civic{" "}
              <br className="hidden md:block" />
              Infrastructure Tracking
            </h1>

            <p className="mb-10 text-base md:text-lg tracking-tight text-muted-foreground text-balance max-w-2xl">
              NammaMarg lets citizens report <strong className="text-foreground font-semibold">potholes</strong>, <strong className="text-foreground font-semibold">garbage dumps</strong>, and <strong className="text-foreground font-semibold">broken street lights</strong> in seconds — AI classifies the issue, geo-tags the location, and notifies the right authority instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 z-50">
              <Button
                asChild
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300 px-6"
              >
                <Link href="/report" className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Report an Issue
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-border/60 hover:border-violet-500/50 hover:text-violet-500 transition-all duration-300 px-6">
                <Link href="/#dashboard" className="flex items-center gap-2">
                  View Live Dashboard
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Floating stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
              {[
                { icon: "🕳️", text: "Potholes" },
                { icon: "🗑️", text: "Garbage Dumps" },
                { icon: "💡", text: "Street Lights" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </AnimationContainer>

          {/* Dashboard preview */}
          <AnimationContainer delay={0.2} className="relative pt-16 pb-20 md:py-28 px-2 w-full">
            <div className="absolute md:top-[10%] left-1/2 gradient w-3/4 -translate-x-1/2 h-1/4 md:h-1/3 inset-0 blur-[5rem] animate-image-glow opacity-60" />
            <div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-border/30 lg:-m-4 lg:rounded-2xl bg-opacity-50 backdrop-blur-3xl">
              <BorderBeam size={250} duration={12} delay={9} />
              <DashboardMockup />
              <div className="absolute -bottom-4 inset-x-0 w-full h-1/2 bg-gradient-to-t from-background z-40" />
              <div className="absolute bottom-0 md:-bottom-8 inset-x-0 w-full h-1/4 bg-gradient-to-t from-background z-50" />
            </div>
          </AnimationContainer>
        </div>
      </MaxWidthWrapper>

      {/* ── Trusted cities ────────────────────────────────────── */}
      <MaxWidthWrapper>
        <AnimationContainer delay={0.3}>
          <div className="py-12">
            <div className="mx-auto px-4 md:px-8">
              <h2 className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Trusted by smart city programs &amp; municipal authorities
              </h2>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                {[
                  "BBMP Bangalore",
                  "BMC Mumbai",
                  "GHMC Hyderabad",
                  "NDMC Delhi",
                  "PMC Pune",
                  "Smart Cities Mission",
                ].map((city, i) => (
                  <span
                    key={i}
                    className="text-sm font-medium text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>

      {/* ── Features ─────────────────────────────────────────── */}
      <MaxWidthWrapper className="pt-10" id="features">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col w-full items-center justify-center py-8">
            <MagicBadge title="AI Features" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              AI Features Built for{" "}
              <span className="text-transparent bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text">
                Smarter Cities
              </span>
            </h2>
            <p className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-xl">
              Purpose-built to close the loop between citizens and authorities on potholes, garbage, and broken street lights — faster than ever.
            </p>
          </div>
        </AnimationContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-8">
          {CIVIC_FEATURES.map((feature, i) => (
            <AnimationContainer key={i} delay={0.1 * (i + 1)}>
              <MagicCard
                className={`group flex flex-col gap-4 p-6 h-full transition-all duration-300 ${feature.glow}`}
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                >
                  <feature.icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </MagicCard>
            </AnimationContainer>
          ))}
        </div>
      </MaxWidthWrapper>

      {/* ── How it works ─────────────────────────────────────── */}
      <MaxWidthWrapper className="py-10">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-center justify-center w-full py-8 max-w-xl mx-auto">
            <MagicBadge title="The Process" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              How NammaMarg Works
            </h2>
            <p className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-lg">
              Three simple steps turn a citizen&apos;s photo into a resolved civic issue — all powered by AI.
            </p>
          </div>
        </AnimationContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 w-full py-8 gap-4 md:gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-indigo-500/30" />

          {PROCESS.map((process, id) => (
            <AnimationContainer delay={0.2 * id} key={id}>
              <MagicCard className="group md:py-8 h-full">
                <div className="flex flex-col items-start justify-center w-full">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-shadow duration-300">
                      <process.icon strokeWidth={1.5} className="w-6 h-6 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {id + 1}
                    </span>
                  </div>
                  <h3 className="text-base mt-5 font-semibold text-foreground">
                    {process.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {process.description}
                  </p>
                </div>
              </MagicCard>
            </AnimationContainer>
          ))}
        </div>
      </MaxWidthWrapper>

      {/* ── Dashboard preview ─────────────────────────────────── */}
      <MaxWidthWrapper className="py-10" id="dashboard">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-center justify-center w-full py-8 max-w-2xl mx-auto">
            <MagicBadge title="Live Dashboard" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              Smart Civic Analytics{" "}
              <span className="text-transparent bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text">
                at a Glance
              </span>
            </h2>
            <p className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-xl">
              Municipal authorities get real-time visibility across every ward — from critical alerts to long-term trend analysis.
            </p>
          </div>
        </AnimationContainer>

        <AnimationContainer delay={0.2}>
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-indigo-500/10 rounded-3xl blur-3xl" />
            <div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-border/30 lg:-m-4 lg:rounded-2xl backdrop-blur-sm">
              <BorderBeam size={180} duration={16} delay={5} />
              <DashboardMockup />
            </div>
          </div>
        </AnimationContainer>

        {/* Dashboard feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {[
            { icon: ActivityIcon, label: "Live Issue Feed", desc: "Real-time updates" },
            { icon: BarChart3Icon, label: "Ward Statistics", desc: "Ward-level breakdown" },
            { icon: AlertTriangleIcon, label: "Critical Alerts", desc: "SLA breach warnings" },
            { icon: UsersIcon, label: "Citizen Engagement", desc: "Participation analytics" },
          ].map((item, i) => (
            <AnimationContainer key={i} delay={0.1 * (i + 1)}>
              <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-border/40 bg-secondary/30 hover:border-violet-500/30 hover:bg-secondary/50 transition-all duration-300">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </AnimationContainer>
          ))}
        </div>
      </MaxWidthWrapper>

      {/* ── Live Map ─────────────────────────────────────────── */}
      <MaxWidthWrapper className="py-10" id="live-map">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-center justify-center w-full py-8 max-w-xl mx-auto">
            <MagicBadge title="Live Map" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              Real-Time City Intelligence
            </h2>
            <p className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-lg">
              Watch civic issues appear across your city in real time — glowing pins, heatmaps, ward boundaries, and severity markers, all in one futuristic map.
            </p>
          </div>
        </AnimationContainer>

        <AnimationContainer delay={0.2}>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-blue-500/5 to-indigo-500/10 rounded-3xl blur-2xl" />
            <div className="ring-1 ring-inset ring-border/30 rounded-2xl overflow-hidden backdrop-blur-sm">
              <BorderBeam size={150} duration={18} delay={3} />
              <MapMockup />
            </div>
          </div>
        </AnimationContainer>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
          {[
            { label: "Glowing Issue Pins", icon: "📍" },
            { label: "Density Heatmaps", icon: "🔥" },
            { label: "Ward Boundaries", icon: "🗺️" },
            { label: "Severity Markers", icon: "⚠️" },
          ].map((item, i) => (
            <AnimationContainer key={i} delay={0.1 * (i + 1)}>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-border/40 bg-secondary/30">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </div>
            </AnimationContainer>
          ))}
        </div>
      </MaxWidthWrapper>

      {/* ── Gamification ─────────────────────────────────────── */}
      <MaxWidthWrapper className="py-10">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-center justify-center w-full py-8 max-w-xl mx-auto">
            <MagicBadge title="Civic Rewards" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              Gamifying Civic Participation
            </h2>
            <p className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-lg">
              Earn points, unlock badges, climb the leaderboard, and get rewarded for making your city better — one report at a time.
            </p>
          </div>
        </AnimationContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
          {/* Badges */}
          <AnimationContainer delay={0.2}>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Citizen Badges
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((badge, i) => (
                  <MagicCard key={i} className="p-4 flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-lg shadow-md flex-shrink-0`}
                    >
                      {badge.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{badge.title}</p>
                      <p className="text-xs text-muted-foreground">{badge.desc}</p>
                    </div>
                  </MagicCard>
                ))}
              </div>
            </div>
          </AnimationContainer>

          {/* Leaderboard */}
          <AnimationContainer delay={0.3}>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Top Citizens This Week
              </h3>
              <div className="space-y-2">
                {LEADERBOARD.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                      i === 0
                        ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
                        : "border-border/40 bg-secondary/20 hover:bg-secondary/40"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                          : i === 1
                          ? "bg-gradient-to-br from-slate-400 to-slate-500 text-white"
                          : i === 2
                          ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.ward}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-violet-500">{entry.points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{entry.badge}</p>
                    </div>
                    {i === 0 && <TrophyIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl border border-violet-500/20 bg-violet-500/5 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  You
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Your rank this week</p>
                  <p className="text-sm font-semibold text-foreground">#142 · Ward 8 · 890 pts</p>
                </div>
                <Button size="sm" variant="outline" className="border-violet-500/40 text-violet-500 hover:bg-violet-500/10 text-xs">
                  Improve Rank
                </Button>
              </div>
            </div>
          </AnimationContainer>
        </div>
      </MaxWidthWrapper>

      {/* ── AI Analytics ─────────────────────────────────────── */}
      <MaxWidthWrapper className="py-10" id="analytics">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-center justify-center w-full py-8 max-w-xl mx-auto">
            <MagicBadge title="AI Analytics" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              AI-Driven Urban Intelligence
            </h2>
            <p className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-lg">
              From issue density to predictive maintenance forecasts — real numbers that help cities make smarter infrastructure decisions.
            </p>
          </div>
        </AnimationContainer>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-8">
          {ANALYTICS_STATS.map((stat, i) => (
            <AnimationContainer key={i} delay={0.1 * (i + 1)}>
              <MagicCard className="p-6 flex flex-col gap-3 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-shadow duration-300">
                <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.8} />
                </div>
                <div>
                  <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                </div>
              </MagicCard>
            </AnimationContainer>
          ))}
        </div>

        {/* Predictive insight banner */}
        <AnimationContainer delay={0.4}>
          <div className="mt-4 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-indigo-500/5 dark:from-violet-500/10 dark:via-blue-500/10 dark:to-indigo-500/10 p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <BrainCircuitIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-semibold text-foreground">Predictive Maintenance Alert</p>
              <p className="text-xs text-muted-foreground mt-1">
                AI predicts 340 new potholes and 120 garbage overflow events in <span className="text-violet-500 font-medium">Ward 12, 17, and 24</span> before monsoon — act now to prevent escalation.
              </p>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-blue-600 text-white border-0 flex-shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-shadow">
              View Forecast
              <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <MaxWidthWrapper className="py-10">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-center justify-center w-full py-8 max-w-xl mx-auto">
            <MagicBadge title="Community" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              What Cities Are Saying
            </h2>
            <p className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-lg">
              Citizens, municipal officers, and smart city officials all agree — NammaMarg is transforming how cities fix potholes, clear garbage, and repair street lights.
            </p>
          </div>
        </AnimationContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-start gap-4 md:gap-6 py-10">
          {[
            REVIEWS.slice(0, 3),
            REVIEWS.slice(3, 6),
            REVIEWS.slice(6, 9),
          ].map((column, colIdx) => (
            <div key={colIdx} className="flex flex-col items-start h-min gap-4">
              {column.map((review, index) => (
                <AnimationContainer delay={0.15 * (index + colIdx)} key={index}>
                  <MagicCard className="md:p-0">
                    <Card className="flex flex-col w-full border-none h-min bg-transparent">
                      <CardHeader className="space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {review.name[0]}
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold text-foreground">
                              {review.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {review.username}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.review}
                        </p>
                      </CardContent>
                      <CardFooter className="w-full space-x-0.5 mt-auto pt-0">
                        {Array.from({ length: review.rating }, (_, i) => (
                          <StarIcon
                            key={i}
                            className="w-3.5 h-3.5 fill-amber-500 text-amber-500"
                          />
                        ))}
                      </CardFooter>
                    </Card>
                  </MagicCard>
                </AnimationContainer>
              ))}
            </div>
          ))}
        </div>
      </MaxWidthWrapper>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <MaxWidthWrapper className="mt-16 max-w-[100vw] overflow-x-hidden scrollbar-hide">
        <AnimationContainer delay={0.1}>
          <LampContainer>
            <div className="flex flex-col items-center justify-center relative w-full text-center">
              <h2 className="bg-gradient-to-b from-violet-300 via-blue-300 to-indigo-400 py-4 bg-clip-text text-center text-4xl md:text-6xl !leading-[1.15] font-medium font-heading tracking-tight text-transparent mt-8">
                Build Smarter Cities with AI
              </h2>
              <p className="text-muted-foreground mt-6 max-w-md mx-auto text-base">
                Empower citizens and authorities with real-time civic intelligence. Transform how your city responds to infrastructure challenges.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] transition-all duration-300 px-8"
                >
                  <Link href="/report" className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    Report an Issue
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-border/60 hover:border-violet-500/50 hover:text-violet-500 transition-all duration-300 px-8"
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    Explore Dashboard
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </LampContainer>
        </AnimationContainer>
      </MaxWidthWrapper>
    </div>
  );
};

export default HomePage;
