import type { ReactNode } from "react";
import Link from "next/link";
import { AnimationContainer } from "@/components";
import MaxWidthWrapper from "@/components/global/max-width-wrapper";
import { MapPinIcon } from "lucide-react";

const PRODUCT_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Live Map", href: "/#live-map" },
  { label: "Dashboard", href: "/#dashboard" },
  { label: "Analytics", href: "/#analytics" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className="inline-block text-sm text-muted-foreground transition-colors duration-200 hover:text-violet-600 dark:hover:text-violet-400"
  >
    {children}
  </Link>
);

const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) => (
  <div>
    <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
      {title}
    </h3>
    <ul className="space-y-3">
      {links.map(({ label, href }) => (
        <li key={href}>
          <FooterLink href={href}>{label}</FooterLink>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="relative mt-16 w-full overflow-x-hidden border-t border-border/50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.06),transparent)]"
      />

      <MaxWidthWrapper className="relative z-10 pb-6 pt-12 lg:pb-8 lg:pt-14">
        <div className="absolute left-1/2 top-0 h-1 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />

        <AnimationContainer delay={0.1}>
          <div className="flex flex-col gap-10 border-b border-border/40 pb-10 lg:flex-row lg:items-start lg:justify-between lg:gap-20 lg:pb-12">
            <div className="max-w-md">
              <Link
                href="/#home"
                className="group inline-flex items-center gap-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 shadow-[0_0_12px_rgba(139,92,246,0.35)] transition-shadow duration-300 group-hover:shadow-[0_0_18px_rgba(139,92,246,0.55)]">
                  <MapPinIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="bg-gradient-to-r from-violet-500 to-blue-400 bg-clip-text font-heading text-xl font-bold text-transparent">
                  NammaMarg
                </span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                AI-powered civic issue detection and smart infrastructure for
                modern cities.
              </p>
              <p className="mt-3 text-sm font-medium text-violet-600/90 dark:text-violet-400/90">
                See it. Report it. Fix it.
              </p>
            </div>

            <div className="grid w-full max-w-xs grid-cols-2 gap-x-12 gap-y-8 sm:max-w-none sm:gap-x-20 lg:ml-auto lg:w-auto lg:gap-x-24">
              <FooterColumn title="Product" links={PRODUCT_LINKS} />
              <FooterColumn title="Legal" links={LEGAL_LINKS} />
            </div>
          </div>
        </AnimationContainer>

        <p className="pt-8 text-center text-xs text-muted-foreground sm:text-left">
          &copy; {new Date().getFullYear()} NammaMarg. All rights reserved.
        </p>

        <div
          aria-hidden
          className="pointer-events-none mt-6 hidden justify-center md:flex"
        >
          <span className="select-none whitespace-nowrap font-heading text-[6.5rem] font-black leading-none tracking-tighter text-foreground/[0.025] dark:text-foreground/[0.035] lg:text-[7.5rem]">
            NAMMAMARG
          </span>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
