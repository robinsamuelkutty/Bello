// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, Music, Settings, User, Video } from "lucide-react";
// Import the Spotify sidebar store
import { useSpotifySidebarStore } from "../store/useSpotifySidebarStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { togglePersist } = useSpotifySidebarStore();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <img
                  src="/Bello AI white.svg"
                  alt="Bello AI Logo"
                  className="h-10 w-10"
                />
              </div>
              <h1 className="text-lg font-bold">BELLO</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className={`btn btn-sm gap-2 transition-colors`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <Link to={"/meet"} className={`btn btn-sm gap-2`}>
                  <Video className="size-5" />
                  <span className="hidden sm:inline">Video Call</span>
                </Link>

                {/* Spotify Toggle Button */}
                <button className="btn btn-sm gap-2" onClick={togglePersist}>
                  <Music className="size-5" />
                  <span className="hidden sm:inline">B-Music</span>
                </button>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;