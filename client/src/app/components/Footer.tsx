import { Zap } from "lucide-react";

const Footer = ({ setCurrentPage }: { setCurrentPage: (page: "landing" | "login" | "home" | "account" | "edit-profile" | "subscription" | "about" | "privacy-policy" | "terms" | "refund-policy" | "contact") => void }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-display font-bold text-white">
                VoltGo
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              The peer-to-peer EV charging marketplace connecting drivers with charger owners.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Find Chargers</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">List Your Charger</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Mobile App</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
              <li><button onClick={() => setCurrentPage("contact")} className="hover:text-emerald-400 transition-colors text-left cursor-pointer underline">Contact</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><button onClick={() => setCurrentPage("privacy-policy")} className="hover:text-emerald-400 transition-colors text-left cursor-pointer underline">Privacy Policy</button></li>
              <li><button onClick={() => setCurrentPage("terms")} className="hover:text-emerald-400 transition-colors text-left cursor-pointer underline">Terms of Service</button></li>
              <li><button onClick={() => setCurrentPage("refund-policy")} className="hover:text-emerald-400 transition-colors text-left cursor-pointer underline">Refund Policy</button></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-300">
          © {new Date().getFullYear()} VoltGo. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
