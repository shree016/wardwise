"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn, NAV_LINKS } from "@/utils";
import { useClerk } from "@clerk/nextjs";
import { LucideIcon, SunIcon, MoonIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import MaxWidthWrapper from "../global/max-width-wrapper";
import MobileNavbar from "./mobile-navbar";
import AnimationContainer from "../global/animation-container";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative w-9 h-9 rounded-full border border-border/60 bg-secondary/40" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "relative w-9 h-9 rounded-full border border-border/60 flex items-center justify-center",
        "bg-secondary/40 hover:bg-secondary/80 backdrop-blur-sm",
        "transition-all duration-300 ease-in-out",
        "hover:border-primary/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]",
        "group"
      )}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full transition-opacity duration-300",
          isDark
            ? "opacity-100 bg-gradient-to-br from-violet-500/10 to-blue-500/10"
            : "opacity-100 bg-gradient-to-br from-amber-100/60 to-orange-100/60"
        )}
      />
      <SunIcon
        className={cn(
          "absolute w-4 h-4 text-amber-500 transition-all duration-300",
          isDark
            ? "opacity-0 rotate-90 scale-50"
            : "opacity-100 rotate-0 scale-100"
        )}
      />
      <MoonIcon
        className={cn(
          "absolute w-4 h-4 text-violet-400 transition-all duration-300",
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-50"
        )}
      />
    </button>
  );
};

const Navbar = () => {
  const { user } = useClerk();
  const [scroll, setScroll] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 8) {
      setScroll(true);
    } else {
      setScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 inset-x-0 h-14 w-full border-b border-transparent z-[99999] select-none",
        scroll &&
          "border-border/40 bg-background/60 backdrop-blur-xl shadow-sm dark:shadow-[0_1px_30px_rgba(139,92,246,0.06)]"
      )}
    >
      <AnimationContainer reverse delay={0.1} className="size-full">
        <MaxWidthWrapper className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-10">
            <Link href="/#home" className="flex items-center gap-2 group">
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_18px_rgba(139,92,246,0.7)] transition-shadow duration-300">
                <MapPinIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold font-heading !leading-none bg-gradient-to-r from-violet-500 to-blue-400 bg-clip-text text-transparent">
                NammaMarg
              </span>
            </Link>

            {/* Desktop Nav */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                {NAV_LINKS.map((link) => (
                  <NavigationMenuItem key={link.title}>
                    {link.menu ? (
                      <>
                        <NavigationMenuTrigger className="text-sm">
                          {link.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul
                            className={cn(
                              "grid gap-1 p-4 md:w-[400px] lg:w-[500px] rounded-xl",
                              link.title === "Features"
                                ? "lg:grid-cols-[.75fr_1fr]"
                                : "lg:grid-cols-2"
                            )}
                          >
                            {link.title === "Features" && (
                              <li className="row-span-4 pr-2 relative rounded-lg overflow-hidden">
                                <div className="absolute inset-0 !z-10 h-full w-[calc(100%-10px)] bg-[linear-gradient(to_right,rgba(139,92,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.08)_1px,transparent_1px)] bg-[size:1rem_1rem]" />
                                <NavigationMenuLink asChild className="z-20 relative">
                                  <Link
                                    href="/#features"
                                    className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-b from-violet-500/10 to-blue-500/10 border border-border/40 p-4 no-underline outline-none focus:shadow-md"
                                  >
                                    <MapPinIcon className="w-6 h-6 text-violet-400 mb-2" />
                                    <h6 className="mb-2 text-base font-semibold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                                      All AI Features
                                    </h6>
                                    <p className="text-sm leading-tight text-muted-foreground">
                                      AI detection for potholes, garbage & street lights — with geo-mapping, heatmaps, and smart priority.
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            )}
                            {link.menu.map((menuItem) => (
                              <ListItem
                                key={menuItem.title}
                                title={menuItem.title}
                                href={menuItem.href}
                                icon={menuItem.icon}
                              >
                                {menuItem.tagline}
                              </ListItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link href={link.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(navigationMenuTriggerStyle(), "text-sm")}
                        >
                          {link.title}
                        </NavigationMenuLink>
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right section */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className={buttonVariants({
                  size: "sm",
                  className:
                    "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all duration-300",
                })}
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-x-3">
                <Link
                  href="/auth/sign-in"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  Sign In
                </Link>
                <Link
                  href="/#report"
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all duration-300",
                  })}
                >
                  Report an Issue
                </Link>
              </div>
            )}
          </div>

          <MobileNavbar />
        </MaxWidthWrapper>
      </AnimationContainer>
    </header>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; icon: LucideIcon }
>(({ className, title, href, icon: Icon, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href!}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center space-x-2 text-foreground/80">
            <Icon className="h-4 w-4 text-violet-500" />
            <h6 className="text-sm font-medium !leading-none">{title}</h6>
          </div>
          <p
            title={children! as string}
            className="line-clamp-1 text-sm leading-snug text-muted-foreground"
          >
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Navbar;
