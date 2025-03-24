import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, MessageSquareQuote } from "lucide-react";
import { Link } from "react-router-dom";
import Particles from "../components/Particles";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) signup(formData);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-base-200">
      {/* Particles Background */}
      <Particles
        primaryColor="var(--p)"
        secondaryColor="var(--s)"
        particleCount={600}
        particleSpread={10}
        speed={0.1}
        moveParticlesOnHover={true}
        particleHoverFactor={2}
        alphaParticles={false}
        particleBaseSize={100}
        sizeRandomness={2}
        cameraDistance={20}
        disableRotation={false}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Signup Container - Unified outer container with proper rounded corners */}
      <div className="relative flex flex-col md:flex-row w-full md:w-[900px] h-auto md:h-[500px] overflow-hidden z-10 rounded-2xl shadow-lg">
        {/* Left Side: Signup Form */}
        <div className="w-full md:w-1/2 bg-base-100 text-base-content py-8 px-10 flex flex-col justify-center rounded-l-2xl rounded-r-none">
          {/* Logo for Mobile */}
          <div className="flex items-center justify-center mt-4 mb-4 md:hidden">
            <MessageSquareQuote className="h-16 w-16 text-primary" />
          </div>
          
          <h2
            className="text-3xl font-bold text-center mb-3"
            style={{ fontFamily: "Product Sans, sans-serif" }}
          >
            Create Account
          </h2>
          <p
            className="text-primary text-center mb-5"
            style={{ fontFamily: "Product Sans, sans-serif" }}
          >
            Sign up to get started
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-secondary font-semibold">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full p-3 rounded-lg border border-primary bg-base-200 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ fontFamily: "Product Sans, sans-serif" }}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="mb-5">
              <label className="block text-secondary font-semibold">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full p-3 rounded-lg border border-primary bg-base-200 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ fontFamily: "Product Sans, sans-serif" }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="mb-5">
              <label className="block text-secondary font-semibold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-lg border border-primary bg-base-200 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontFamily: "Product Sans, sans-serif" }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-content py-3 rounded-lg font-semibold hover:bg-primary-focus transition"
              style={{ fontFamily: "Product Sans, sans-serif" }}
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <div className="flex justify-center items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p
            className="text-sm text-primary text-center mt-5"
            style={{ fontFamily: "Product Sans, sans-serif" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-secondary font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        {/* Right Side: Truly Translucent Panel with Logo */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center relative rounded-r-2xl">
          {/* Glass panel with perfect connection to left panel */}
          <div className="absolute top-0 right-0 bottom-0 w-full backdrop-blur-sm bg-primary/35 rounded-r-2xl z-20">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 mix-blend-overlay rounded-r-2xl"></div>
          </div>
          
          {/* Logo container with its own glass effect */}
          <div className="relative z-30 flex items-center justify-center">
            <div className="relative p-10 rounded-full">
              {/* Circular glow behind logo */}
              <div className="absolute inset-0 rounded-full bg-base-100/10 backdrop-blur-md"></div>
              {/* Logo */}
              <MessageSquareQuote className="h-32 w-32 text-primary relative z-40 drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;