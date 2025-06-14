import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import FloatingElements from "./floating-elements";

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative pt-20 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
                Handle Property Maintenance{" "}
                <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Without the Chaos
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                A simple tool for landlords, Airbnb hosts, and shop owners to
                track, assign, and automate repairs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12 justify-center lg:justify-start">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  Try It Free • No Credit Card Needed
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-blue-100 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    Instant notifications
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    One-click assignments
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    Complete audit trail
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    Mobile-first design
                  </span>
                </div>
              </div>
            </div>

            {/* Right Content - Request Form Mockup */}
            <div className="relative mt-8 lg:mt-0 order-first lg:order-last">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl transform rotate-1 lg:rotate-2 hover:rotate-0 transition-transform duration-300 max-w-sm mx-auto lg:max-w-none">
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                    Submit Request
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        placeholder="Tile"
                        className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        placeholder="Add more empty"
                        className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg h-16 sm:h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        readOnly
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm text-gray-600">
                        Experiences
                      </span>
                    </div>

                    <button className="w-full bg-blue-600 text-white font-semibold py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                      SUBMIT
                    </button>
                  </div>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="absolute -right-2 sm:-right-4 -top-2 sm:-top-4 bg-slate-800 rounded-xl p-3 sm:p-4 shadow-xl transform -rotate-2 lg:-rotate-3 hover:rotate-0 transition-transform duration-300 w-48 sm:w-64 hidden sm:block">
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <h4 className="text-white font-medium text-xs sm:text-sm">
                    Maintenance Requests
                  </h4>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2 text-xs">
                  {[
                    { name: "Leaking Toilet", status: "Open", urgent: true },
                    {
                      name: "Broken Outlet",
                      status: "In Progress",
                      urgent: false,
                    },
                    { name: "Door Handle", status: "Completed", urgent: false },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1"
                    >
                      <span className="text-gray-300 text-xs truncate">
                        {item.name}
                      </span>
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs ${
                          item.status === "Open"
                            ? "bg-red-100 text-red-800"
                            : item.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
