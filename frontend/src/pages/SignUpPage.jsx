// src/pages/SignUpPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUp, isSigningUp, authUser } = useAuthStore(); // Changed `signup` to `signUp` as per your action name

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (authUser) navigate("/");
  }, [authUser, navigate]);

  // Validate form fields
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false; // Added return false
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false; // Added return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false; // Added return false
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false; // Added return false
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false; // Added return false
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Submitting signup form with data:", formData);
      // The actual `signUp` action has its own try/catch, so this outer one is mostly for console logging
      await signUp(formData); // No need for try/catch here, as store handles toast
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row pt-16">
      {" "}
      {/* Added top padding for navbar */}
      {/* Left side: Form */}
      <div className="lg:w-1/2 w-full flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10">
                  <User className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input input-bordered w-full pl-10 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-30"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10">
                  <Mail className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered w-full pl-10 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-30"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10">
                  <Lock className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-30"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-base-content/40" />
                  ) : (
                    <Eye className="w-5 h-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing Up...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Right side: Image */}
      <div className="lg:w-1/2 w-full hidden lg:flex items-center justify-center bg-base-200">
        <div className="w-full max-w-lg px-4">
          <AuthImagePattern subtitle="Connect with friends, share moments, and stay in touch with your loved ones." />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
