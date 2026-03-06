import React from "react";

interface TermsAndConditionsPageProps {
    isDarkMode: boolean;
    setCurrentPage: (page: "home" | "account" | "edit-profile" | "subscription" | "about" | "privacy-policy" | "terms") => void;
}

const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({ isDarkMode, setCurrentPage }) => {
    return (
        <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Terms and Conditions</h1>
                    <button
                        onClick={() => setCurrentPage("about")}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            isDarkMode
                                ? "bg-gray-800 text-white hover:bg-gray-700"
                                : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        Back to About Us
                    </button>
                </div>

                <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <div className="prose prose-sm max-w-none text-base space-y-6">
                        <h2 className="text-xl font-bold">Terms and Conditions for VoltGo</h2>
                        <p><strong>Effective Date:</strong> [Insert Date]</p>
                        <p>These Terms and Conditions ("Terms") govern your use of the VoltGo platform, including the mobile application, website, and related services for electric vehicle (EV) charging station discovery and management.</p>
                        <p>By accessing or using VoltGo, you agree to be bound by these Terms.</p>

                        <h3 className="font-semibold">1. Eligibility</h3>
                        <p>To use VoltGo, you must be at least <strong>18 years old</strong> and legally capable of entering into binding agreements. By using the platform, you confirm that you meet these requirements.</p>

                        <h3 className="font-semibold">2. User Accounts</h3>
                        <p>Users must create an account to access certain features of VoltGo. When creating an account, you agree to:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your login credentials</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>
                        <p>VoltGo reserves the right to suspend or terminate accounts that provide false information or violate these Terms.</p>

                        <h3 className="font-semibold">3. Platform Services</h3>
                        <p>VoltGo provides a platform that allows users to:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Locate nearby EV charging stations</li>
                            <li>Register electric vehicles and charging equipment</li>
                            <li>Manage charging sessions</li>
                            <li>Manage subscriptions and service access</li>
                        </ul>
                        <p>VoltGo acts as a <strong>technology platform</strong> and does not manufacture or control physical charging equipment unless explicitly stated.</p>

                        <h3 className="font-semibold">4. Charger Owner Responsibilities</h3>
                        <p>Users who register as <strong>charger owners</strong> agree to:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Provide accurate information about charging station locations and specifications</li>
                            <li>Ensure their charging equipment is safe and operational</li>
                            <li>Comply with applicable local regulations and electrical safety standards</li>
                        </ul>
                        <p>VoltGo is not responsible for equipment malfunction, misuse, or damages resulting from third-party hardware.</p>

                        <h3 className="font-semibold">5. Vehicle Owner Responsibilities</h3>
                        <p>Users who register as <strong>vehicle owners</strong> agree to:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Use charging stations responsibly</li>
                            <li>Ensure their vehicles and connectors are compatible with the charging equipment</li>
                            <li>Follow safety instructions provided at charging locations</li>
                        </ul>
                        <p>Users are responsible for proper use of charging infrastructure.</p>

                        <h3 className="font-semibold">6. Payments and Subscriptions</h3>
                        <p>VoltGo may offer subscription plans or charging-related payments.</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Payments are processed through secure third-party payment providers.</li>
                            <li>VoltGo does <strong>not store full card or payment details</strong>.</li>
                            <li>Users agree to pay applicable charges associated with subscriptions or services.</li>
                        </ul>
                        <p>Additional details regarding cancellations or refunds may be outlined in the <strong>Refund and Cancellation Policy</strong>.</p>

                        <h3 className="font-semibold">7. Location Services</h3>
                        <p>VoltGo may use location data to provide core features such as finding nearby charging stations and navigation support. By using the platform, you consent to the use of location data for these purposes.</p>

                        <h3 className="font-semibold">8. Service Availability</h3>
                        <p>VoltGo strives to provide reliable services; however:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Charging station availability may vary</li>
                            <li>Network connectivity may affect functionality</li>
                            <li>Platform services may experience maintenance or interruptions</li>
                        </ul>
                        <p>VoltGo does not guarantee uninterrupted service availability.</p>

                        <h3 className="font-semibold">9. Limitation of Liability</h3>
                        <p>VoltGo is not liable for:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Damage to vehicles or charging equipment</li>
                            <li>Service interruptions or system failures</li>
                            <li>Issues caused by third-party services or hardware</li>
                            <li>Losses arising from misuse of the platform</li>
                        </ul>
                        <p>Users assume responsibility for their use of the service and charging equipment.</p>

                        <h3 className="font-semibold">10. Prohibited Activities</h3>
                        <p>Users agree not to:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Misuse the platform or attempt unauthorized access</li>
                            <li>Provide false charger or vehicle information</li>
                            <li>Use the service for illegal activities</li>
                            <li>Interfere with the platform's functionality or security</li>
                        </ul>
                        <p>Violations may result in account suspension or termination.</p>

                        <h3 className="font-semibold">11. Account Termination</h3>
                        <p>VoltGo reserves the right to suspend or terminate accounts that violate these Terms or engage in harmful activity. Users may also request account deletion at any time.</p>

                        <h3 className="font-semibold">12. Indemnification</h3>
                        <p>You agree to indemnify and hold VoltGo harmless from any claims, damages, or liabilities arising from your misuse of the platform or violation of these Terms.</p>

                        <h3 className="font-semibold">13. Changes to These Terms</h3>
                        <p>VoltGo may update these Terms periodically. Updated versions will be posted on the platform with the revised effective date. Continued use of the platform constitutes acceptance of the updated Terms.</p>

                        <h3 className="font-semibold">14. Governing Law</h3>
                        <p>These Terms shall be governed by and interpreted in accordance with the applicable laws of the jurisdiction in which VoltGo operates.</p>

                        <h3 className="font-semibold">15. Contact Information</h3>
                        <p>For questions regarding these Terms and Conditions, please contact:</p>
                        <p>Email: <a href="mailto:support@voltgo.com" className="text-blue-500 hover:underline">support@voltgo.com</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditionsPage;
