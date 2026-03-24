import React, { useState } from "react";

interface ContactPageProps {
    isDarkMode: boolean;
}

const ContactPage: React.FC<ContactPageProps> = ({ isDarkMode }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus("idle");
        setErrorMessage("");

        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
            const response = await fetch(`${API_BASE_URL}/api/v1/contact/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                setSubmitStatus("error");
                setErrorMessage(data.message || "Failed to send message");
            }
        } catch (error) {
            setSubmitStatus("error");
            setErrorMessage("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-4xl mx-auto p-6 py-12">
                <div className={`p-8 rounded-lg shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
                    
                    <p className="mb-8">
                        We're here to help! Whether you have questions about our EV charging services, 
                        need technical support, or want to learn more about VoltGo, we'd love to hear from you.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium mb-2">Email</h3>
                                    <p className="text-blue-500 hover:underline">voltevgo@gmail.com</p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">Response Time</h3>
                                    <p>We typically respond within 24-48 hours</p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">Business Hours</h3>
                                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                    <p>Saturday - Sunday: 10:00 AM - 4:00 PM</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">How We Can Help</h2>
                            <ul className="space-y-2">
                                <li>• Account and billing questions</li>
                                <li>• Technical support for charging stations</li>
                                <li>• Partnership inquiries</li>
                                <li>• Feedback and suggestions</li>
                                <li>• Report issues or concerns</li>
                            </ul>
                        </div>
                    </div>

                    <div className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
                        <p className="mb-4">
                            For the fastest response, please include your account details and a detailed description of your inquiry.
                        </p>
                        
                        {/* Status Messages */}
                        {submitStatus === "success" && (
                            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                                ✅ Message sent successfully! We'll get back to you soon.
                            </div>
                        )}
                        
                        {submitStatus === "error" && (
                            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                ❌ {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        isDarkMode 
                                            ? "bg-gray-600 border-gray-500 text-white" 
                                            : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        isDarkMode 
                                            ? "bg-gray-600 border-gray-500 text-white" 
                                            : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Subject</label>
                                <input 
                                    type="text" 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        isDarkMode 
                                            ? "bg-gray-600 border-gray-500 text-white" 
                                            : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                    placeholder="How can we help?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Message</label>
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        isDarkMode 
                                            ? "bg-gray-600 border-gray-500 text-white" 
                                            : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                    placeholder="Tell us more about your inquiry..."
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                    isSubmitting
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : isDarkMode 
                                            ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                            : "bg-emerald-500 hover:bg-emerald-600 text-white"
                                }`}
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm opacity-75">
                            Thank you for choosing VoltGo. We're committed to providing the best EV charging experience!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
