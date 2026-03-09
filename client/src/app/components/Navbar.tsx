import { useState } from "react";
import { Button } from "./ui/button";
import { Zap, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  setCurrentPage: (page: "landing" | "login" | "home" | "account" | "edit-profile" | "subscription" | "about" | "privacy-policy" | "terms") => void;
}

const Navbar = ({ setCurrentPage }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-#333/80 backdrop-blur-lg border-b border-#ddd dark:border-#666">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 ml-12">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">
              VoltGo
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#owners" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              For Owners
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3 mr-16">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage("login")}>
              Log In
            </Button>
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setCurrentPage("login")}>
              Sign Up
            </Button>
          </div>

          <button
            className="md:hidden text-gray-900 dark:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#how-it-works" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                How It Works
              </a>
              <a href="#features" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Features
              </a>
              <a href="#owners" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                For Owners
              </a>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setCurrentPage("login")}>Log In</Button>
                <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setCurrentPage("login")}>Sign Up</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
