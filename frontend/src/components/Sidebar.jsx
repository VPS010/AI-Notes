import React, { useState, useRef, useEffect } from "react";
import { Home, Star, ChevronDown, LogOut, Settings, User } from "lucide-react";

const Sidebar = () => {
  const [showLogout, setShowLogout] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-64 h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <span className="ml-2 text-lg font-semibold">AI Notes</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-purple-50 text-purple-600"
          >
            <Home size={20} />
            <span>Home</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Star size={20} />
            <span>Favourites</span>
          </a>
        </div>
      </nav>

      {/* Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">EV</span>
            </div>
            <span className="flex-1 text-left text-gray-600">
              Emmanual Vincent
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
                  onClick={() => {
                    /* handle logout */
                  }}
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
