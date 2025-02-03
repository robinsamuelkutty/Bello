import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Eye icons
import axios from 'axios'; // For API requests
import { useNavigate } from 'react-router-dom'; // For navigation

const SignUp = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Toggle state for password visibility

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#FFC0CB' }} // Light pink background
      >
        <div className="bg-[#3E3232] text-white p-8 rounded-2xl shadow-lg w-96">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Product Sans, sans-serif' }}>
            Create Account
          </h2>
          <p className="text-[#BFA181] text-center mb-6" style={{ fontFamily: 'Product Sans, sans-serif' }}>
            Sign up to get started
          </p>

          <form>
            {/* Full Name Input */}
            <div className="mb-4">
              <label className="block text-[#D7BFA6] font-semibold">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#BFA181] bg-[#2D2424] text-white focus:outline-none focus:ring-2 focus:ring-[#BFA181]"
                style={{ fontFamily: 'Product Sans, sans-serif' }}
              />
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-[#D7BFA6] font-semibold">Email</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#BFA181] bg-[#2D2424] text-white focus:outline-none focus:ring-2 focus:ring-[#BFA181]"
                style={{ fontFamily: 'Product Sans, sans-serif' }}
              />
            </div>

            {/* Password Input */}
            <div className="mb-4 relative">
              <label className="block text-[#D7BFA6] font-semibold">Password</label>
              <input 
                type={showPassword ? "text" : "password"} // Toggle input type
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#BFA181] bg-[#2D2424] text-white focus:outline-none focus:ring-2 focus:ring-[#BFA181] pr-10"
                style={{ fontFamily: 'Product Sans, sans-serif' }}
              />
              {/* Eye Icon for Toggle */}
              <button 
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-10 right-3 text-[#BFA181] hover:text-[#D7BFA6] transition"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-[#BFA181] text-[#2D2424] py-3 rounded-lg font-semibold hover:bg-[#A38C6B] transition"
              style={{ fontFamily: 'Product Sans, sans-serif' }}
            >
              Sign Up
            </button>
          </form>

          {/* Login Link */}
          <p className="text-sm text-[#BFA181] text-center mt-4" style={{ fontFamily: 'Product Sans, sans-serif' }}>
            Already have an account? <a href="#" className="text-white font-semibold hover:underline">Login</a>
          </p>
        </div>
      </div>
    );
};

export default SignUp;

