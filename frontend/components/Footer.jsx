import { MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="StayPoint Logo" className="w-40" />
            </div>
            <p className="text-white">Find Your Stay, The Smart Way</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="text-[#87E64B]">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-[#87E64B]">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="text-[#87E64B]">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-[#87E64B]">
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="text-[#87E64B]">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-[#87E64B]">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#87E64B] mt-8 pt-8 text-center text-white text-sm">
          <p>&copy; 2025 StayPoint. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
