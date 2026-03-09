import { Button } from "./ui/button";
import { ArrowRight, Zap, TrendingUp, Clock } from "lucide-react";
import { motion } from "motion/react";

interface OwnerCTAProps {
  setCurrentPage: (page: "landing" | "login" | "home" | "account" | "edit-profile" | "subscription" | "about" | "privacy-policy" | "terms") => void;
}

const OwnerCTA = ({ setCurrentPage }: OwnerCTAProps) => {
  return (
    <section id="owners" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-slate-900 overflow-hidden p-8 sm:p-12 lg:p-16">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/20 rounded-full blur-3xl" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
                Own a Charger?{" "}
                <span className="text-emerald-400">Start Earning.</span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                List your home or business charger on VoltGo and earn passive income
                while helping EV community grow. You set price, availability,
                and rules.
              </p>
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 text-base"
                onClick={() => setCurrentPage("login")}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {[
                { icon: TrendingUp, title: "Average $300/mo", desc: "earned by active hosts" },
                { icon: Clock, title: "5-minute setup", desc: "list your charger in no time" },
                { icon: Zap, title: "Full control", desc: "set your own rates & hours" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-slate-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerCTA;
