import { Search, CalendarCheck, Zap } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    icon: Search,
    title: "Search",
    description: "Find available chargers near your location with real-time availability updates.",
  },
  {
    icon: CalendarCheck,
    title: "Book",
    description: "Reserve a charging slot that fits your schedule. No waiting, no guesswork.",
  },
  {
    icon: Zap,
    title: "Charge & Go",
    description: "Plug in, charge up, and get back on the road. Pay securely through the app.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Getting charged up is as easy as 1-2-3.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gray-300 dark:bg-gray-600" />
              )}

              <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6 relative">
                <step.icon className="w-9 h-9 text-emerald-500" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
