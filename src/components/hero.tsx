import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import FloatingElements from "./floating-elements";

export default function Hero() {
  return (
    <div className="relative bg-background">
      <div className="pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Streamline Your <span className="text-primary">Maintenance</span>{" "}
              Operations
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              The all-in-one maintenance scheduler for Airbnb hosts and small
              manufacturers. Schedule, track, and manage tasks efficiently.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors text-base font-medium"
              >
                Get Started Free
                <ArrowUpRight className="ml-2 w-4 h-4" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3 text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors text-base font-medium"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Offline PDF checklists</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Role-based access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Real-time tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
