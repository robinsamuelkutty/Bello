const LoginPage = () => {
  return (
      <div className="min-h-screen flex items-center justify-center bg-[#2D2424]">
      <div className="flex bg-[#3E3232] text-white rounded-2xl shadow-lg w-[850px] h-[450px] overflow-hidden">
        {/* Left Side: Login Form */}
        <div className="w-1/2 px-10 py-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ fontFamily: 'Product Sans, sans-serif' }}>
            Welcome Back
          </h2>
          <p className="text-[#BFA181] text-center mb-5" style={{ fontFamily: 'Product Sans, sans-serif' }}>
            Sign in to continue chatting
          </p>

          <form>
            <div className="mb-5">
              <label className="block text-[#D7BFA6] font-semibold">Email</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                className="w-full p-3 rounded-lg border border-[#BFA181] bg-[#2D2424] text-white focus:outline-none focus:ring-2 focus:ring-[#BFA181]"
                style={{ fontFamily: 'Product Sans, sans-serif' }}
              />
            </div>

            <div className="mb-5">
              <label className="block text-[#D7BFA6] font-semibold">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full p-3 rounded-lg border border-[#BFA181] bg-[#2D2424] text-white focus:outline-none focus:ring-2 focus:ring-[#BFA181]"
                style={{ fontFamily: 'Product Sans, sans-serif' }}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#BFA181] text-[#2D2424] py-3 rounded-lg font-semibold hover:bg-[#A38C6B] transition"
              style={{ fontFamily: 'Product Sans, sans-serif' }}
            >
              Login
            </button>
          </form>

          <p className="text-sm text-[#BFA181] text-center mt-5" style={{ fontFamily: 'Product Sans, sans-serif' }}>
            New here? <a href="#" className="text-white font-semibold hover:underline">Create an account</a>
          </p>
        </div>

        {/* Right Side: Image */}
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

export default LoginPage