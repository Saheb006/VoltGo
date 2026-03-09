import { Wifi, DollarSign, Plug, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { motion } from "motion/react";

const features = [
  {
    icon: Wifi,
    title: "Real-Time Availability",
    description: "See which chargers are available right now with live status updates and estimated wait times.",
  },
  {
    icon: DollarSign,
    title: "Earn From Your Charger",
    description: "Turn your home or business charger into a passive income source. Set your own rates and schedule.",
  },
  {
    icon: Plug,
    title: "All Connector Types",
    description: "From Type 1 to CCS2, find the right connector for your vehicle. Filter by speed and type.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments & Reviews",
    description: "Pay safely through the platform. Rate your experience and help the community find the best chargers.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Why Choose VoltGo
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Built for EV drivers and charger owners alike.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-gray-200 dark:border-gray-700 hover:border-emerald-500/30 transition-colors group hover:shadow-lg hover:shadow-emerald-500/5">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-5 group-hover:bg-emerald-200 transition-colors">
                    <feature.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
