import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex bg-[#3E3232] text-white rounded-2xl shadow-lg w-[850px] h-[450px] overflow-hidden">
        <div className="w-1/2 px-10 py-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ fontFamily: 'Product Sans, sans-serif' }}>
            Welcome Back
          </h2>
          <p className="text-[#BFA181] text-center mb-5" style={{ fontFamily: 'Product Sans, sans-serif' }}>
            Sign in to continue chatting
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-[#D7BFA6] font-semibold">Email</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                className="w-full p-3 rounded-lg border border-[#BFA181] bg-[#2D2424] text-white focus:outline-none focus:ring-2 focus:ring-[#BFA181]"
                style={{ fontFamily: 'Product Sans, sans-serif' }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="mb-5">
              <label className="block text-[#D7BFA6] font-semibold">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full p-3 rounded-lg border border-[#BFA181] bg-[#2D2424] text-white focus:outline-none focus:ring-2 focus:ring-[#BFA181]"
                  style={{ fontFamily: 'Product Sans, sans-serif' }}
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
              className="w-full bg-[#BFA181] text-[#2D2424] py-3 rounded-lg font-semibold hover:bg-[#A38C6B] transition"
              style={{ fontFamily: 'Product Sans, sans-serif' }}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                 
                  Loading...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="text-sm text-[#BFA181] text-center mt-5" style={{ fontFamily: 'Product Sans, sans-serif' }}>
            New here? <Link to="/signup" className="text-white font-semibold hover:underline">Create an account</Link>
          </p>
        </div>

        <div className="w-1/2">
          <img 
            src="https://i.pinimg.com/736x/89/6d/59/896d59d3c6fc8f1967959793da64e828.jpg" 
            alt="Chat Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 