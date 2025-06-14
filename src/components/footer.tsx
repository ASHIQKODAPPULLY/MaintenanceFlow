import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
              Product
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-blue-200 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  API (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
              Company
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50 text-xs sm:text-sm">
                  About (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Blog (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Careers (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Press (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
              Resources
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Documentation (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Help Center (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Community (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Status (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
              Legal
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Privacy (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Terms (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Security (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed opacity-50">
                  Cookies (Coming Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-slate-700/50">
          <div className="text-gray-400 mb-4 md:mb-0 text-xs sm:text-sm text-center md:text-left">
            © {currentYear} MaintenanceHub. All rights reserved.
          </div>

          <div className="flex space-x-4 sm:space-x-6">
            <a
              href="https://twitter.com/maintenancehub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
            <a
              href="https://linkedin.com/company/maintenancehub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
            <a
              href="https://github.com/maintenancehub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
