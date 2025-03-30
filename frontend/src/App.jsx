import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingPage";
import HomePage from "./pages/HomePage";
import VideoCallPage from "./pages/VideoCallPage";
import Meet from "./pages/Meet";
import ErrorBoundary from "./components/ErrorBoundary";
import SpotifySidebar from "./components/SpotifySidebar";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useCallStore } from "./store/useCallStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import CallScreen from "./components/CallScreen";

import { useNavigate } from "react-router-dom";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const { setNavigateCallback, setupCallListeners } = useCallStore();
  const location = useLocation();
  
  // Check if current route should hide navbar
  const hideNavbar = ['/video', '/call-screen'].includes(location.pathname);
  
  setupCallListeners();

  useEffect(() => {
    setNavigateCallback(navigate); // Pass navigate to the store
  }, [navigate, setNavigateCallback]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      {!hideNavbar && <Navbar />}
      <ErrorBoundary>
        <SpotifySidebar />
      </ErrorBoundary>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/meet" element={authUser ? <Meet /> : <Navigate to="/login" />} />
        <Route path="/video" element={authUser ? <VideoCallPage /> : <Navigate to="/login" />} />
        <Route path="/call-screen" element={authUser ? <CallScreen /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;