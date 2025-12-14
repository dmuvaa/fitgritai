import Link from "next/link"
import { Heart, Twitter, Linkedin, Mail, Flame, Instagram, ArrowUpRight } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">FitGrit AI</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Stop making excuses. Start transforming your body with honest AI guidance and personalized fitness coaching.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 rounded-lg flex items-center justify-center transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 rounded-lg flex items-center justify-center transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 rounded-lg flex items-center justify-center transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@fitgrit.ai"
                className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 rounded-lg flex items-center justify-center transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  Dashboard
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard/coach" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  AI Coach
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/setup" className="text-gray-400 hover:text-white transition-colors">
                  Setup Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@fitgrit.ai" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy#cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy#gdpr" className="text-gray-400 hover:text-white transition-colors">
                  GDPR Rights
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} FitGrit AI. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            Made with
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            for your health journey
          </p>
        </div>
      </div>
    </footer>
  )
}
