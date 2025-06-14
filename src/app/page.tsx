import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import AnimatedCounter from "@/components/animated-counter";
import FloatingElements from "@/components/floating-elements";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  Smartphone,
  FileText,
  Settings,
  Bell,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      <FloatingElements />
      <Navbar />
      <Hero />

      {/* Problem Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white text-center">
              Tired of maintenance requests slipping through the cracks?
            </h2>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6 order-2 md:order-1">
                {[
                  "Tenants don't have to text you anymore",
                  "Get notified instantly",
                  "Assign tradies in one click",
                  "Keep a full record for insurance, inspections, or peace of mind",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white text-base sm:text-lg">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl order-1 md:order-2">
                <div className="bg-slate-800 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h3 className="text-white font-semibold text-sm sm:text-base">
                      Maintenance Requests
                    </h3>
                    <div className="flex gap-1 sm:gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {[
                      { status: "Open", count: "3", color: "bg-blue-500" },
                      {
                        status: "In Progress",
                        count: "2",
                        color: "bg-yellow-500",
                      },
                      {
                        status: "Completed",
                        count: "12",
                        color: "bg-green-500",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${item.color}`}
                          ></div>
                          <span className="text-gray-300">{item.status}</span>
                        </div>
                        <span className="text-white font-medium">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="border border-gray-200 rounded-lg p-2 sm:p-3">
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        Leaking Toilet
                      </span>
                      <span className="text-xs bg-red-100 text-red-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                        Urgent
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Unit 2A - Reported 2 hours ago
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-2 sm:p-3">
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        Broken Outlet
                      </span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                        Medium
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Unit 1B - Assigned to Mike
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8 sm:mt-12">
              <p className="text-lg sm:text-xl text-blue-200 font-medium">
                Built in full focus, clarity, and no missed tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-white text-center">
            Who It's For
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Landlords",
                benefits: ["Track tenant repairs", "Schedule inspections"],
              },
              {
                icon: <Smartphone className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Airbnb Hosts",
                benefits: [
                  "Automate cleaning/repairs",
                  "Avoid bad WiFi/toilet reviews",
                ],
              },
              {
                icon: <Settings className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Shop Owners",
                benefits: ["Let staff report issues", "Keep logs for safety"],
              },
            ].map((category, index) => (
              <div
                key={index}
                className="text-center sm:col-span-1 lg:col-span-1"
              >
                <div className="inline-flex p-3 sm:p-4 rounded-full bg-blue-600/20 mb-3 sm:mb-4">
                  <div className="text-blue-400">{category.icon}</div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
                  {category.title}
                </h3>
                <div className="space-y-2">
                  {category.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm sm:text-base">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-12 sm:py-16 lg:py-20 bg-slate-900/50"
        id="features"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto text-base sm:text-lg">
              From request submission to completion tracking, we've got every
              step covered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Bell className="w-6 h-6" />,
                title: "Instant Notifications",
                description:
                  "Get alerted the moment a maintenance request comes in",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "One-Click Assignment",
                description:
                  "Assign tasks to your trusted contractors instantly",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Smart Scheduling",
                description:
                  "Automated work order scheduling with priority management",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Complete Records",
                description:
                  "Full history for insurance, inspections, and peace of mind",
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Progress Tracking",
                description: "Real-time updates on task completion and costs",
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: "Mobile Friendly",
                description:
                  "Access everything from your phone, tablet, or computer",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="inline-flex p-2 sm:p-3 rounded-lg bg-blue-600/20 mb-3 sm:mb-4">
                  <div className="text-blue-400">{feature.icon}</div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-slate-800/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:col-span-1 lg:col-span-1">
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-white">
                <AnimatedCounter end={1000} suffix="+" />
              </div>
              <div className="text-blue-200 text-sm sm:text-base">
                Properties Managed
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:col-span-1 lg:col-span-1">
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-white">
                <AnimatedCounter end={50} suffix="K+" />
              </div>
              <div className="text-blue-200 text-sm sm:text-base">
                Tasks Completed
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:col-span-2 lg:col-span-1">
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-white">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <div className="text-blue-200 text-sm sm:text-base">
                On-Time Completion
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-900/50" id="pricing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">
              Simple Pricing
            </h2>
            <p className="text-blue-200 max-w-xl mx-auto text-base sm:text-lg">
              Start free and upgrade as you grow. No hidden fees.
            </p>
          </div>

          <div className="max-w-sm sm:max-w-md mx-auto mb-8 sm:mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-slate-700/50 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Starter Plan
              </h3>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                $20
                <span className="text-base sm:text-lg text-gray-400">
                  /month
                </span>
              </div>
              <p className="text-blue-200 mb-4 sm:mb-6 text-sm sm:text-base">
                Or book a 10 minute setup call
              </p>

              <a
                href="/dashboard"
                className="inline-block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                Start Free Trial
              </a>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {plans?.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
