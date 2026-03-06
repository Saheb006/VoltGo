import React from "react";

interface PrivacyPolicyPageProps {
    isDarkMode: boolean;
    setCurrentPage: (page: "home" | "account" | "edit-profile" | "subscription" | "about" | "privacy-policy") => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ isDarkMode, setCurrentPage }) => {
    return (
        <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Privacy Policy</h1>
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
                        <p><strong>Privacy Policy for VoltGo</strong></p>
                        <p><strong>Effective Date:</strong> [Insert Date]</p>
                        <p>VoltGo ("we", "our", or "us") is committed to protecting your privacy and safeguarding your personal information. This Privacy Policy explains how we collect, use, disclose, and protect information when you use the VoltGo application and related services for discovering, managing, and using electric vehicle (EV) charging stations.</p>
                        <p>By using VoltGo, you agree to the collection and use of information in accordance with this Privacy Policy.</p>

                        <h3 className="font-semibold">1. Information We Collect</h3>
                        <h4 className="font-medium">Personal Information</h4>
                        <p>When you create and use an account, we may collect:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Full name</li>
                            <li>Email address</li>
                            <li>Username and password</li>
                            <li>User role (vehicle owner or charger owner)</li>
                            <li>Profile avatar or uploaded images</li>
                        </ul>

                        <h4 className="font-medium">Contact Information</h4>
                        <p>We may use your email address to:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Create and manage your account</li>
                            <li>Send password reset requests</li>
                            <li>Provide service notifications or support responses</li>
                        </ul>

                        <h4 className="font-medium">Location Information</h4>
                        <p>VoltGo may collect location data to provide charging-related services.</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>GPS Coordinates: Used to help users locate nearby EV charging stations</li>
                            <li>Address Information: Physical addresses of charging stations created or accessed through the platform</li>
                        </ul>

                        <h4 className="font-medium">Usage Information</h4>
                        <p>We may collect data related to how the app is used, including:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Charging session details such as location, duration, and power usage</li>
                            <li>Features accessed within the application</li>
                            <li>Time spent using the platform</li>
                            <li>Device and browser information</li>
                        </ul>

                        <h4 className="font-medium">Device Information</h4>
                        <p>We may automatically collect technical information such as:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Device type</li>
                            <li>Operating system</li>
                            <li>App version</li>
                            <li>Unique device identifiers</li>
                        </ul>

                        <h4 className="font-medium">Vehicle Information</h4>
                        <p>Users may optionally provide details about their electric vehicles, including:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Vehicle make and model</li>
                            <li>Vehicle year and specifications</li>
                            <li>Charging connector preferences and power requirements</li>
                        </ul>

                        <h4 className="font-medium">Payment and Subscription Information</h4>
                        <p>If payments or subscriptions are enabled, we may collect:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Subscription plan information</li>
                            <li>Billing and payment transaction records</li>
                            <li>Charging payment history</li>
                        </ul>
                        <p>VoltGo does not store full payment card details. Payments are processed through secure third-party payment providers.</p>

                        <h3 className="font-semibold">2. How We Use Your Information</h3>
                        <p>We use collected information to operate and improve VoltGo services.</p>

                        <h4 className="font-medium">Service Operation</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Create and manage user accounts</li>
                            <li>Display nearby EV charging stations</li>
                            <li>Facilitate charging sessions</li>
                            <li>Manage charger listings and vehicle registrations</li>
                            <li>Process subscriptions and payments</li>
                        </ul>

                        <h4 className="font-medium">Communication</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Send important service notifications</li>
                            <li>Provide technical support</li>
                            <li>Send password reset and security alerts</li>
                        </ul>

                        <h4 className="font-medium">Platform Improvement</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Analyze usage patterns</li>
                            <li>Improve performance and reliability</li>
                            <li>Develop new features and services</li>
                        </ul>

                        <h4 className="font-medium">Security and Fraud Prevention</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Detect suspicious activity</li>
                            <li>Prevent misuse of the platform</li>
                            <li>Maintain platform security</li>
                        </ul>

                        <h4 className="font-medium">Legal Compliance</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Comply with applicable laws and regulations</li>
                            <li>Respond to lawful requests from authorities</li>
                        </ul>

                        <h3 className="font-semibold">3. Information Sharing and Disclosure</h3>
                        <p>VoltGo does not sell or rent personal information to third parties.</p>
                        <p>We may share limited information in the following situations:</p>

                        <h4 className="font-medium">Service Providers</h4>
                        <p>We may share information with trusted third-party services that help operate VoltGo, including:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Cloudinary – image storage for avatars and charger images</li>
                            <li>Email service providers – sending account or support emails</li>
                            <li>OpenStreetMap services – location and reverse geocoding functionality</li>
                        </ul>

                        <h4 className="font-medium">Legal Requirements</h4>
                        <p>Information may be disclosed if required by law, regulation, court order, or government request.</p>

                        <h4 className="font-medium">Business Transfers</h4>
                        <p>If VoltGo undergoes a merger, acquisition, or asset transfer, user information may be transferred to the new entity.</p>

                        <h4 className="font-medium">User Consent</h4>
                        <p>Information may be shared if you provide explicit consent.</p>

                        <h3 className="font-semibold">4. Data Security</h3>
                        <p>We take reasonable security measures to protect personal information.</p>
                        <p>Security practices include:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Password hashing using bcrypt</li>
                            <li>Secure authentication using JWT tokens</li>
                            <li>HTTPS encryption for all data transmission</li>
                            <li>Restricted access to sensitive information</li>
                            <li>Continuous monitoring and security improvements</li>
                        </ul>
                        <p>While we strive to protect your information, no system can guarantee absolute security.</p>

                        <h3 className="font-semibold">5. Data Retention</h3>
                        <p>We retain personal information only as long as necessary to provide services and meet legal obligations.</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Account Data: Retained while your account remains active</li>
                            <li>Usage Data: Retained for service improvement and analytics</li>
                            <li>Payment Records: Retained according to financial and regulatory requirements</li>
                            <li>Location Data: Used primarily in real time and not stored for tracking purposes</li>
                        </ul>

                        <h3 className="font-semibold">6. Your Rights</h3>
                        <p>Users have the following rights regarding their personal information:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Access – Request a copy of the information we hold about you</li>
                            <li>Correction – Update inaccurate or incomplete information</li>
                            <li>Deletion – Request deletion of your account and associated data</li>
                            <li>Data Portability – Request export of your data</li>
                            <li>Communication Preferences – Opt out of non-essential communications</li>
                        </ul>
                        <p>Requests can be made using the contact information provided below.</p>

                        <h3 className="font-semibold">7. Cookies and Tracking Technologies</h3>
                        <p>VoltGo may use cookies or similar technologies to support core platform functionality.</p>
                        <p>These technologies may be used for:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Authentication and session management</li>
                            <li>Security and fraud prevention</li>
                            <li>Remembering user preferences</li>
                            <li>Understanding usage patterns for improvement</li>
                        </ul>
                        <p>Disabling cookies may affect certain features of the platform.</p>

                        <h3 className="font-semibold">8. Third-Party Services</h3>
                        <p>VoltGo integrates with third-party services that operate under their own privacy policies. These services may include:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Cloudinary (image hosting)</li>
                            <li>OpenStreetMap (location services)</li>
                            <li>Payment processors such as Razorpay (when payment features are enabled)</li>
                        </ul>
                        <p>Users are encouraged to review the privacy policies of these services.</p>

                        <h3 className="font-semibold">9. Children's Privacy</h3>
                        <p>VoltGo is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If such data is discovered, it will be removed promptly.</p>

                        <h3 className="font-semibold">10. International Data Transfers</h3>
                        <p>Information may be processed or stored in different countries depending on infrastructure and service providers. Appropriate safeguards are used to protect user data during such transfers.</p>

                        <h3 className="font-semibold">11. Updates to This Privacy Policy</h3>
                        <p>We may update this Privacy Policy periodically to reflect changes in services, technology, or legal requirements. Updated versions will be posted within the application or website with a revised effective date.</p>

                        <h3 className="font-semibold">12. Contact Information</h3>
                        <p>If you have questions or concerns regarding this Privacy Policy or data practices, please contact us.</p>
                        <p><strong>Email:</strong> privacy@voltgo.com<br/>
                        <strong>Support:</strong> support@voltgo.com<br/>
                        <strong>Address:</strong> VoltGo, India</p>
                        <p>By using VoltGo, you acknowledge that you have read and understood this Privacy Policy.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
