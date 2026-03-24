import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import OwnerCTA from "./components/OwnerCTA";
import Footer from "./components/Footer";

interface LandingPageProps {
    isDarkMode: boolean;
    setCurrentPage: (page: "landing" | "login" | "home" | "account" | "edit-profile" | "subscription" | "about" | "privacy-policy" | "terms" | "refund-policy" | "contact") => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isDarkMode, setCurrentPage }) => {
    return (
        <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <Navbar setCurrentPage={setCurrentPage} />
            <Hero setCurrentPage={setCurrentPage} />
            <HowItWorks />
            <Features />
            <OwnerCTA setCurrentPage={setCurrentPage} />
            <Footer setCurrentPage={setCurrentPage} />
        </div>
    );
};

export default LandingPage;
