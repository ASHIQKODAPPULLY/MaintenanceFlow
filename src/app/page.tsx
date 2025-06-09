import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import AnimatedCounter from "@/components/animated-counter";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  TrendingUp,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-foreground">
              Built for Maintenance Professionals
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to manage maintenance operations efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Smart Scheduling",
                description:
                  "Automated work order scheduling with priority management",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Role-Based Access",
                description: "Different views for admins and technicians",
              },
              {
                icon: <Users className="w-5 h-5" />,
                title: "Team Coordination",
                description: "Assign tasks and track progress in real-time",
              },
              {
                icon: <CheckCircle2 className="w-5 h-5" />,
                title: "Offline Ready",
                description: "PDF checklists for no-phone zones",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-5 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="inline-flex p-2 rounded-md bg-primary/10 mb-3">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-1 text-foreground">
                <AnimatedCounter end={1000} suffix="+" />
              </div>
              <div className="text-muted-foreground text-sm">
                Properties Managed
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1 text-foreground">
                <AnimatedCounter end={50} suffix="K+" />
              </div>
              <div className="text-muted-foreground text-sm">
                Tasks Completed
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1 text-foreground">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <div className="text-muted-foreground text-sm">
                On-Time Completion
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-background" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-foreground">
              Simple Pricing
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free and upgrade as you grow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans?.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            Start Managing Maintenance Today
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join property managers and manufacturers who've streamlined their
            maintenance operations.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Start Free Trial
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
