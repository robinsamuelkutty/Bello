// src/pages/LoginPage.jsx
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore"; // Assumed theme store
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Particles from "../components/Particles";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();
  // Get the current theme from your chat/theme store
  const { theme } = useChatStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

  // Define an inline style for the logo based on the theme.
  const logoStyle = theme === "dark" ? { filter: "invert(1)" } : {};

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

      {/* Login Container */}
      <div className="relative flex flex-col md:flex-row w-full md:w-[900px] h-auto md:h-[500px] overflow-hidden z-10 rounded-2xl shadow-lg">
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 bg-base-100 text-base-content py-8 px-10 flex flex-col justify-center rounded-l-2xl rounded-r-none">
          {/* Logo for Mobile */}
          <div className="flex items-center justify-center mt-4 mb-4 md:hidden">
            <img
              src="/Bello AI white.svg"
              alt="Bello AI Logo"
              className="h-16 w-16"
              style={logoStyle}
            />
          </div>
          
          <h2
            className="text-3xl font-bold text-center mb-3"
            style={{ fontFamily: "Product Sans, sans-serif" }}
          >
            Welcome Back
          </h2>
          <p
            className="text-primary text-center mb-5"
            style={{ fontFamily: "Product Sans, sans-serif" }}
          >
            Sign in to continue chatting
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-secondary font-semibold">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full p-3 rounded-lg border border-primary bg-base-200 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ fontFamily: "Product Sans, sans-serif" }}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="mb-5">
              <label className="block text-secondary font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-lg border border-primary bg-base-200 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontFamily: "Product Sans, sans-serif" }}
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
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <div className="flex justify-center items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p
            className="text-sm text-primary text-center mt-5"
            style={{ fontFamily: "Product Sans, sans-serif" }}
          >
            New here?{" "}
            <Link
              to="/signup"
              className="text-secondary font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Right Side: Translucent Panel with Logo */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center relative rounded-r-2xl">
          {/* Glass panel */}
          <div className="absolute top-0 right-0 bottom-0 w-full backdrop-blur-sm bg-primary/35 rounded-r-2xl z-20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 mix-blend-overlay rounded-r-2xl"></div>
          </div>
          
          {/* Logo container */}
          <div className="relative z-30 flex items-center justify-center">
            <div className="relative p-10 rounded-full">
              <div className="absolute inset-0 rounded-full bg-base-100/10 backdrop-blur-md"></div>
              <img
                src="/Bello AI white.svg"
                alt="Bello AI Logo"
                className="h-32 w-32 relative z-40 drop-shadow-lg"
                style={logoStyle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;