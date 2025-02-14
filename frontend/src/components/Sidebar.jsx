import React, { useState, useRef, useEffect } from "react";
import { Home, Star, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "./logo";

const Sidebar = ({ showFavorites, onFavoritesClick }) => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();

  // Hide logout menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Returns the initials from the user's username
  const getUserInitials = () => {
    if (!user?.username) return "US";
    const names = user.username.split(" ");
    return names
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-64 bg-white border-t border-gray-100 flex flex-col">
      <div className="px-4 ">
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer"
        >
          <div className="py-2">
            <Logo />
          </div>
          <span className="ml-2 text-3xl font-semibold">AI Notes</span>
        </div>
      </div>

      <nav className="flex-1 border-t pt-4 px-2">
        <div className="space-y-1">
          <button
            className={`flex items-center w-full cursor-default gap-3 px-3 py-3 text-md font-medium rounded-lg ${
              !showFavorites
                ? "bg-purple-50 text-purple-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => {
              if (showFavorites) onFavoritesClick();
            }}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
          <button
            className={`flex items-center w-full gap-3 px-3 cursor-default py-3 text-md font-medium rounded-lg ${
              showFavorites
                ? "bg-purple-50 text-purple-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => {
              if (!showFavorites) onFavoritesClick();
            }}
          >
            <Star size={20} />
            <span>Favourites</span>
          </button>
        </div>
      </nav>

      <div className="p-2 border-t border-gray-100">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
              <span className="text-xl font-medium text-purple-600">
                {getUserInitials()}
              </span>
            </div>
            <span className="flex-1 text-left text-md text-gray-600">
              {user?.username}
            </span>
            <ChevronDown
              className={`text-gray-600 transition-transform duration-200 ${
                showLogout ? "rotate-180" : ""
              }`}
              size={18}
            />
          </button>

          {showLogout && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white border rounded-lg shadow-lg overflow-hidden">
              <div>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-md text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
