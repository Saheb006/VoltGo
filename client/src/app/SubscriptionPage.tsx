import React, { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { CheckCircle } from "lucide-react";
import { getSubscriptionPlans, startSubscription, getMySubscription, listMySubscriptions } from "../services/api";

interface SubscriptionPageProps {
    isDarkMode: boolean;
    setCurrentPage: (page: "home" | "account" | "edit-profile" | "subscription") => void;
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

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ isDarkMode, setCurrentPage }) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
    const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

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
        <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Charger Subscription</h1>
                    <Button onClick={() => setCurrentPage("account")} variant="outline">
                        Back to Account
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {/* Current Subscription */}
                {currentSubscription && (
                    <div className={`mb-6 p-6 rounded-lg shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Current Subscription
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-xl font-semibold">{currentSubscription.plan_id?.name || 'Unknown'}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {currentSubscription.plan_id?.description || 'No description'}
                                </p>
                                <p className="text-2xl font-bold">${currentSubscription.plan_id?.price || 0}/month</p>
                            </div>
                            <div>
                                <p className="text-sm">
                                    Valid until: {currentSubscription.ends_at ? new Date(currentSubscription.ends_at).toLocaleDateString() : 'Unknown'}
                                </p>
                                <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                                    currentSubscription.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}>
                                    {currentSubscription.status || 'unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscription Plans */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div key={plan._id} className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-3xl font-bold">${plan.price}/month</p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Max Chargers: {plan.max_chargers}</li>
                                        <li>• Max Ports per Charger: {plan.max_ports_per_charger}</li>
                                        {plan.features?.map((feature, index) => (
                                            <li key={index}>• {feature}</li>
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
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subscription History */}
                {subscriptionHistory.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Subscription History</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subscriptionHistory.map((sub) => (
                                <div key={sub._id} className={`p-4 rounded-lg shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{sub.plan_id?.name || 'Unknown'}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {sub.starts_at && sub.ends_at ? `${new Date(sub.starts_at).toLocaleDateString()} - ${new Date(sub.ends_at).toLocaleDateString()}` : 'Date unknown'}
                                            </p>
                                            <p className="text-sm">${sub.plan_id?.price || 0}/month</p>
                                        </div>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                            sub.status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}>
                                            {sub.status || 'unknown'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionPage;
