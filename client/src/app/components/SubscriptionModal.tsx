import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";
import { getSubscriptionPlans, startSubscription, getMySubscription, listMySubscriptions } from "../../services/api";

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
}

interface Plan {
    _id: string;
    name: string;
    description: string;
    price: number;
    max_chargers: number;
    max_ports_per_charger: number;
    features: string[];
}

interface Subscription {
    _id: string;
    plan_id: Plan;
    starts_at: string;
    ends_at: string;
    status: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, isDarkMode }) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
    const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [plansData, currentSub, historyData] = await Promise.all([
                getSubscriptionPlans(),
                getMySubscription().catch(() => null), // May not have active subscription
                listMySubscriptions(),
            ]);

            setPlans(plansData);
            setCurrentSubscription(currentSub);
            setSubscriptionHistory(historyData);
        } catch (err) {
            console.error("Failed to load subscription data:", err);
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSubscription = async (planId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await startSubscription(planId);

            if (result.success) {
                // Refresh data
                await loadData();
            }
        } catch (err) {
            console.error("Failed to start subscription:", err);
            setError(err instanceof Error ? err.message : "Failed to start subscription");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <DialogHeader>
                    <DialogTitle className={isDarkMode ? "text-white" : "text-gray-900"}>
                        Charger Subscription
                    </DialogTitle>
                    <DialogDescription className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                        Manage your charger subscription plan
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Current Subscription */}
                    {currentSubscription && (
                        <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    Current Subscription
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        {currentSubscription.plan_id.name}
                                    </p>
                                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                        {currentSubscription.plan_id.description}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                        Valid until: {new Date(currentSubscription.ends_at).toLocaleDateString()}
                                    </p>
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${currentSubscription.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                        {currentSubscription.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subscription Plans */}
                    <div>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Available Plans
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plans.map((plan) => (
                                <div key={plan._id} className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}>
                                    <h4 className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        {plan.name}
                                    </h4>
                                    <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                        {plan.description}
                                    </p>
                                    <p className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        ${plan.price}/month
                                    </p>
                                    <ul className="space-y-1 text-sm mb-4">
                                        <li className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                                            Max Chargers: {plan.max_chargers}
                                        </li>
                                        <li className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                                            Max Ports per Charger: {plan.max_ports_per_charger}
                                        </li>
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                                                • {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        onClick={() => handleStartSubscription(plan._id)}
                                        disabled={isLoading || !!currentSubscription}
                                        className="w-full"
                                    >
                                        {currentSubscription ? "Already Subscribed" : isLoading ? "Starting..." : "Start Subscription"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subscription History */}
                    {subscriptionHistory.length > 0 && (
                        <div>
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                Subscription History
                            </h3>
                            <div className="space-y-2">
                                {subscriptionHistory.map((sub) => (
                                    <div key={sub._id} className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                    {sub.plan_id.name}
                                                </p>
                                                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                    {new Date(sub.starts_at).toLocaleDateString()} - {new Date(sub.ends_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${sub.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                                {sub.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SubscriptionModal;
