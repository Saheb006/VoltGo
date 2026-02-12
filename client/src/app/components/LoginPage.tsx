import { useState } from "react";
import { User, Mail, Lock, Zap, Car, Battery, Camera, ChevronDown } from "lucide-react";
import { loginUser, registerUser } from "../../services/api";

interface LoginPageProps {
    onLoginSuccess: () => void;
    isDarkMode: boolean;
}

export default function LoginPage({ onLoginSuccess, isDarkMode }: LoginPageProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState<{
        username: string;
        email: string;
        password: string;
        confirmPassword: string;
        fullName: string;
        role: string;
        avatar: File | undefined;
    }>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        role: "vehicle_owner",
        avatar: undefined,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || undefined;
        setFormData({
            ...formData,
            avatar: file,
        });
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({
            ...formData,
            role: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (isLogin) {
                // Login (backend supports username OR email)
                const result = await loginUser({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                });
                if (result.success) {
                    onLoginSuccess();
                }
            } else {
                // Register
                if (!formData.avatar) {
                    throw new Error("Avatar is required");
                }

                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match");
                }

                const result = await registerUser({
                    fullName: formData.fullName,
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                    role: formData.role,
                    avatar: formData.avatar,
                });
                if (result.success) {
                    // Auto-login after registration
                    const loginResult = await loginUser({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                    });
                    if (loginResult.success) {
                        onLoginSuccess();
                    }
                }
            }
        } catch (err: any) {
            console.error("Authentication error:", err);

            let message = "An unexpected error occurred";

            // Prefer typical backend / fetch / axios error shapes
            if (err?.response?.data?.message && typeof err.response.data.message === "string") {
                message = err.response.data.message;
            } else if (err?.data?.message && typeof err.data.message === "string") {
                message = err.data.message;
            } else if (typeof err?.message === "string" && err.message.trim() !== "") {
                message = err.message;
            } else if (typeof err === "string" && err.trim() !== "") {
                message = err;
            }

            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,197,94,0.18),transparent_55%),radial-gradient(circle_at_90%_70%,rgba(34,197,94,0.12),transparent_60%),radial-gradient(circle_at_10%_80%,rgba(59,130,246,0.10),transparent_60%)]" />
                <div className="absolute -top-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute bottom-[-120px] left-1/2 h-72 w-[620px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Zap className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_14px_rgba(34,197,94,0.55)]" />
                            <h1 className="text-4xl font-semibold tracking-tight">
                                <span className="text-white">Volt</span>
                                <span className="text-emerald-400">Go</span>
                            </h1>
                        </div>
                        <p className="mt-2 text-sm text-white/60">Powering Your EV Journey</p>
                    </div>

                    <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                        {error && (
                            <div
                                className={`mb-4 p-3 rounded-lg text-sm ${
                                    isDarkMode
                                        ? "bg-red-900/50 text-red-300 border border-red-700"
                                        : "bg-red-50 text-red-600 border border-red-200"
                                }`}
                            >
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <div className="relative">
                                        <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                        <input
                                            type="file"
                                            name="avatar"
                                            onChange={handleAvatarChange}
                                            accept="image/*"
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-sm text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-400/20 file:text-emerald-300 hover:file:bg-emerald-400/30 outline-none transition focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
                                        />
                                    </div>
                                    {formData.avatar && (
                                        <p className="mt-2 text-xs text-white/60">
                                            Selected: {formData.avatar.name}
                                        </p>
                                    )}
                                </div>
                            )}

                            {!isLogin && (
                                <div>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required={!isLogin}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
                                            placeholder="Full name"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="username"
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
                                        placeholder="Username"
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div>
                                    <div className="relative">
                                        <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleRoleChange}
                                            required={!isLogin}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-sm text-white appearance-none outline-none transition focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
                                        >
                                            <option value="vehicle_owner" className="bg-gray-800">
                                                Vehicle Owner
                                            </option>
                                            <option value="charger_owner" className="bg-gray-800">
                                                Charger Owner
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required={!isLogin}
                                        autoComplete="email"
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
                                        placeholder="Email"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete={isLogin ? "current-password" : "new-password"}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
                                        placeholder="Password"
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required={!isLogin}
                                            autoComplete="new-password"
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
                                            placeholder="Confirm Password"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-full py-3.5 text-base font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-60 bg-gradient-to-b from-lime-400 to-emerald-500 shadow-[0_10px_30px_-12px_rgba(34,197,94,0.7)] hover:from-lime-300 hover:to-emerald-400"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-black/80 border-t-transparent rounded-full animate-spin"></div>
                                        {isLogin ? "Signing in..." : "Creating account..."}
                                    </span>
                                ) : isLogin ? (
                                    "Login"
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-white/60">
                            {isLogin ? "New to VoltGo?" : "Already have an account?"}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                }}
                                className="ml-2 font-semibold text-emerald-400 hover:text-emerald-300"
                            >
                                {isLogin ? "Create Account" : "Login"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
