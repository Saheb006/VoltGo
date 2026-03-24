import React from "react";

interface RefundPolicyPageProps {
    isDarkMode: boolean;
}

const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({ isDarkMode }) => {
    return (
        <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-4xl mx-auto p-6 py-12">
                <div className={`p-8 rounded-lg shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <h1 className="text-3xl font-bold mb-6">Refund Policy for VoltGo</h1>
                    
                    <p className="mb-4"><strong>Effective Date:</strong> 15 March 2026</p>
                    
                    <p className="mb-6">
                        At VoltGo, we aim to provide a reliable and seamless experience for EV charging services. 
                        This Refund Policy outlines the terms and conditions under which refunds may be issued for our services and subscription plans.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">1. Subscription Plan Refunds</h2>
                    <p className="mb-4">Refunds for subscription plans are handled as follows:</p>
                    <ul className="list-disc list-inside ml-6 mb-6 space-y-2">
                        <li><strong>7-Day Cooling Period:</strong> New subscribers may request a full refund within 7 days of the initial subscription purchase.</li>
                        <li><strong>Monthly Plans:</strong> No refunds will be issued after the 7-day cooling period. Users may cancel their subscription at any time, and cancellation will apply to future billing cycles.</li>
                        <li><strong>Annual Plans:</strong> Pro-rated refunds may be provided if requested within 30 days of the annual subscription purchase.</li>
                        <li><strong>Service Interruptions:</strong> Refunds may be considered in cases of continuous service interruptions exceeding 48 hours.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">2. Charging Session Refunds</h2>
                    <p className="mb-4">Refunds for charging sessions may be issued under the following circumstances:</p>
                    <ul className="list-disc list-inside ml-6 mb-6 space-y-2">
                        <li><strong>Equipment Malfunction:</strong> If the charging station fails during an active session</li>
                        <li><strong>Power Outages:</strong> If the session is interrupted due to power failure</li>
                        <li><strong>Incorrect Billing:</strong> In case of overcharges or billing errors</li>
                        <li><strong>Service Not Delivered:</strong> If charging cannot be initiated after successful payment</li>
                    </ul>
                    <p className="mb-6">
                        Refunds will not be issued for user-related issues such as incorrect charger selection, early termination of a session, or misuse of the service.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">3. How to Request a Refund</h2>
                    <p className="mb-4">To request a refund:</p>
                    <ul className="list-disc list-inside ml-6 mb-6 space-y-2">
                        <li>Contact our support team within the eligible refund period</li>
                        <li>Provide your account details and transaction information</li>
                        <li>Clearly state the reason for your refund request</li>
                        <li>Attach any relevant proof (screenshots, receipts, etc.)</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">4. Refund Processing</h2>
                    <ul className="list-disc list-inside ml-6 mb-6 space-y-2">
                        <li>Refund requests are typically reviewed within 5–7 business days</li>
                        <li>Once approved, refunds will be processed to the original payment method used during the transaction (UPI, card, net banking, etc.)</li>
                        <li>It may take an additional 3–5 business days for the amount to reflect in your account, depending on your bank or payment provider</li>
                    </ul>
                    <p className="mb-6">
                        VoltGo reserves the right to review, approve, or reject any refund request after verification.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">5. Non-Refundable Cases</h2>
                    <p className="mb-4">The following are generally not eligible for refunds:</p>
                    <ul className="list-disc list-inside ml-6 mb-6 space-y-2">
                        <li>Subscription fees after the cooling period has expired</li>
                        <li>Partially used subscription periods</li>
                        <li>Completed charging sessions with no service issues</li>
                        <li>Account suspension or termination due to policy violations</li>
                        <li>Third-party service or payment processing fees</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">6. Force Majeure</h2>
                    <p className="mb-6">
                        VoltGo shall not be held responsible for service interruptions or refund claims arising from events beyond our control, including but not limited to natural disasters, government actions, or widespread utility failures.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">7. Policy Updates</h2>
                    <p className="mb-6">
                        We may update this Refund Policy from time to time. Any changes will be effective immediately upon posting on this page. Continued use of our services constitutes acceptance of the updated policy.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4 mt-8">8. Contact Us</h2>
                    <p className="mb-4">For refund requests or any questions regarding this policy, please contact:</p>
                    <div className="ml-6">
                        <p className="mb-2"><strong>Email:</strong> voltevgo@gmail.com</p>
                        <p><strong>Website:</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
