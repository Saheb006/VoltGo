import React from "react";

interface PrivacyPolicyPageProps {
    isDarkMode: boolean;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ isDarkMode }) => {
    return (
        <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-4xl mx-auto p-6 py-12">
                <div className={`p-8 rounded-lg shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <h1 className="text-3xl font-bold mb-6">Privacy Policy for VoltGo</h1>
                    
                    <p className="mb-4"><strong>Effective Date:</strong> 15 March 2026</p>
                    
                    <p className="mb-6">
                        VoltGo ("we", "our", or "us") is committed to protecting your privacy and safeguarding your personal information. 
                        This Privacy Policy explains how we collect, use, disclose, and protect information when you use the VoltGo 
                        application and related services for discovering, managing, and using electric vehicle (EV) charging stations.
                    </p>
                    
                    <p className="mb-8">
                        By using VoltGo, you agree to the collection and use of information in accordance with this Privacy Policy.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">1. Information We Collect</h2>
                    <h3 className="text-xl font-medium mb-3">Personal Information</h3>
                    <p className="mb-4">When you create and use an account, we may collect:</p>
                    <ul className="list-disc list-inside ml-6 mb-6 space-y-2">
                        <li>Full name</li>
                        <li>Email address</li>
                        <li>Username and password</li>
                        <li>User role (vehicle owner or charger owner)</li>
                        <li>Profile avatar or uploaded images</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">2. Contact Information Usage</h2>
                    <p className="mb-4">We may use your email address to:</p>
                    <ul className="list-disc list-inside ml-6 mb-6 space-y-2">
                        <li>Create and manage your account</li>
                        <li>Provide customer support</li>
                        <li>Send important updates related to your account or services</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">3. How We Use Your Information</h2>
                    <p className="mb-4">We use the collected information to:</p>
                    <ul className="list-disc list-inside ml-6 mb-6 space-y-2">
                        <li>Provide and improve our services</li>
                        <li>Manage user accounts</li>
                        <li>Enable booking and usage of EV charging stations</li>
                        <li>Communicate with users regarding services and updates</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">4. Data Security</h2>
                    <p className="mb-6">
                        We implement appropriate security measures to protect your personal information from unauthorized access, 
                        alteration, disclosure, or destruction.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">5. Third-Party Services</h2>
                    <p className="mb-6">
                        We may use third-party services, including payment gateways, to process transactions. These services may 
                        collect and process your information as per their own privacy policies.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">6. Data Sharing</h2>
                    <p className="mb-4">We do not sell or rent your personal information. We may share your data only:</p>
                    <ul className="list-disc list-inside ml-6 mb-6 space-y-2">
                        <li>With service providers necessary to operate our platform</li>
                        <li>If required by law or legal processes</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">7. Your Rights</h2>
                    <p className="mb-4">You may:</p>
                    <ul className="list-disc list-inside ml-6 mb-6 space-y-2">
                        <li>Access or update your personal information</li>
                        <li>Request deletion of your account</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">8. Changes to This Policy</h2>
                    <p className="mb-6">
                        We may update this Privacy Policy from time to time. Any changes will be posted on this page with an 
                        updated effective date.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">9. Contact Us</h2>
                    <p className="mb-4">If you have any questions about this Privacy Policy, you can contact us at:</p>
                    <div className="ml-6">
                        <p className="mb-2"><strong>Email:</strong> voltevgo@gmail.com</p>
                        <p><strong>Website:</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
