import Link from "next/link";
import { AnimationContainer } from "@/components";
import { MapPinIcon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="flex flex-col relative items-center justify-center border-t border-border/40 pt-16 pb-8 md:pb-0 px-6 lg:px-8 w-full max-w-6xl mx-auto lg:pt-32 bg-[radial-gradient(35%_128px_at_50%_0%,hsl(var(--primary)/0.08),transparent)]">
      <div className="absolute top-0 left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />

      <div className="grid gap-8 xl:grid-cols-3 xl:gap-8 w-full">
        {/* Brand */}
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-start justify-start md:max-w-[220px]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.4)]">
                <MapPinIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold font-heading bg-gradient-to-r from-violet-500 to-blue-400 bg-clip-text text-transparent">
                NammaMarg
              </span>
            </div>
            <p className="text-muted-foreground mt-4 text-sm text-start leading-relaxed">
              AI-powered civic issue detection and smart infrastructure management for modern cities.
            </p>
            <span className="mt-4 text-sm text-muted-foreground">
              &ldquo;See it. Report it. Fix it.&rdquo;
            </span>
          </div>
        </AnimationContainer>

        <div className="grid-cols-2 gap-8 grid mt-16 xl:col-span-2 xl:mt-0">
          <div className="md:grid md:grid-cols-2 md:gap-8">
            {/* Product */}
            <AnimationContainer delay={0.2}>
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Product
                </h3>
                <ul className="mt-4 text-sm text-muted-foreground space-y-2">
                  <li>
                    <Link href="/#features" className="hover:text-foreground transition-colors duration-200">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/#ai-detection" className="hover:text-foreground transition-colors duration-200">
                      AI Detection
                    </Link>
                  </li>
                  <li>
                    <Link href="/#dashboard" className="hover:text-foreground transition-colors duration-200">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/#heatmaps" className="hover:text-foreground transition-colors duration-200">
                      Heatmaps
                    </Link>
                  </li>
                </ul>
              </div>
            </AnimationContainer>

            {/* Resources */}
            <AnimationContainer delay={0.3}>
              <div className="mt-10 md:mt-0 flex flex-col">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Resources
                </h3>
                <ul className="mt-4 text-sm text-muted-foreground space-y-2">
                  <li>
                    <Link href="" className="hover:text-foreground transition-colors duration-200">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="" className="hover:text-foreground transition-colors duration-200">
                      API
                    </Link>
                  </li>
                  <li>
                    <Link href="" className="hover:text-foreground transition-colors duration-200">
                      Support
                    </Link>
                  </li>
                </ul>
              </div>
            </AnimationContainer>
          </div>

          <div className="md:grid md:grid-cols-2 md:gap-8">
            {/* Company */}
            <AnimationContainer delay={0.4}>
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Company
                </h3>
                <ul className="mt-4 text-sm text-muted-foreground space-y-2">
                  <li>
                    <Link href="" className="hover:text-foreground transition-colors duration-200">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="" className="hover:text-foreground transition-colors duration-200">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-foreground transition-colors duration-200">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </AnimationContainer>

            {/* Cities */}
            <AnimationContainer delay={0.5}>
              <div className="mt-10 md:mt-0 flex flex-col">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Cities
                </h3>
                <ul className="mt-4 text-sm text-muted-foreground space-y-2">
                  <li>
                    <Link href="" className="hover:text-foreground transition-colors duration-200">
                      Bangalore
                    </Link>
                  </li>
                  <li>
                    <Link href="" className="hover:text-foreground transition-colors duration-200">
                      Mumbai
                    </Link>
                  </li>
                  <li>
                    <Link href="" className="hover:text-foreground transition-colors duration-200">
                      Hyderabad
                    </Link>
                  </li>
                  <li>
                    <Link href="" className="hover:text-foreground transition-colors duration-200">
                      Delhi
                    </Link>
                  </li>
                </ul>
              </div>
            </AnimationContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border/40 pt-6 md:pt-8 md:flex md:items-center md:justify-between w-full">
        <AnimationContainer delay={0.6}>
          <p className="text-sm text-muted-foreground mt-4 md:mt-0">
            &copy; 2026 NammaMarg. Smart Civic Infrastructure Platform.
          </p>
        </AnimationContainer>
        <AnimationContainer delay={0.7}>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </AnimationContainer>
      </div>

      {/* Large footer text */}
      <div className="h-24 lg:h-32 flex items-center justify-center mt-4 w-full overflow-hidden">
        <span className="text-[4rem] lg:text-[6rem] font-black font-heading text-center bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-indigo-500/20 bg-clip-text text-transparent select-none tracking-tight">
          NAMMAMARG
        </span>
      </div>
    </footer>
  );
};

export default Footer;
