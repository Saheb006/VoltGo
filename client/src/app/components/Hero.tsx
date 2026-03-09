import { Button } from "./ui/button";
import { Search, Plus, Zap, MapPin, Battery } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  setCurrentPage: (page: "landing" | "login" | "home" | "account" | "edit-profile" | "subscription" | "about" | "privacy-policy" | "terms") => void;
}

const Hero = ({ setCurrentPage }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-100/20 blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              The EV Charging Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Find EV Chargers{" "}
              <span className="text-emerald-500">Near You</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mb-8 leading-relaxed">
              Connect with charger owners in your area. Book a slot, plug in, and go — 
              or earn money by sharing your own charger with the community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 text-base px-8"
                onClick={() => setCurrentPage("login")}
              >
                <Search className="w-5 h-5 mr-2" />
                Find a Charger
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-900 hover:bg-gray-100 text-base px-8"
                onClick={() => setCurrentPage("login")}
              >
                <Plus className="w-5 h-5 mr-2" />
                List Your Charger
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-10 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                2,400+ chargers live
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Free to join
              </div>
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main circle */}
              <div className="absolute inset-8 rounded-full bg-slate-900 flex items-center justify-center">
                <Zap className="w-24 h-24 text-emerald-500" strokeWidth={1.5} />
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Looking for EV station?</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">sign in as Car owner</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Battery className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Have a charger?</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sign as Charger owner</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
