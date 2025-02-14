import React, { useEffect, useState } from "react";
import { Mic, BookmarkIcon, HomeIcon, NotebookIcon, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "../components/logo";

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-18">
            <div className="flex items-center px-2 md:px-4">
              <div className="flex items-center">
                <Logo />
                <span className="ml-2 text-xl md:text-3xl font-semibold">
                  AI Notes
                </span>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn && user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 text-lg">
                    Welcome, {user.name}
                  </span>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="bg-purple-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
                      {user.username[0]}
                    </div>
                    <span className="pr-4 py-2 text-lg rounded-xl text-red-500 hover:text-red-600 transition-colors">
                      {user.username}
                    </span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 rounded-md text-red-500 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isLoggedIn && user ? (
                <div className="space-y-2">
                  <p className="text-gray-700 px-3">Welcome, {user.name}</p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full flex items-center px-3 py-2 rounded-md text-red-500 hover:bg-red-50"
                  >
                    <div className="bg-purple-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold mr-2">
                      {user.username[0]}
                    </div>
                    {user.username}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-red-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="w-full text-left px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="text-center">
          <h1 className="text-3xl  font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Transform Your Voice</span>
            <span className="block text-purple-600">Into Organized Notes</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-sm  text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create, organize, and manage your notes effortlessly with voice
            input. Perfect for students, professionals, and anyone who prefers
            speaking over typing.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center justify-center px-6  py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 md:py-4 md:text-lg md:px-10"
              >
                <NotebookIcon className="mr-2 h-5 w-5" />
                Start Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-3">
            <div className="text-center p-4">
              <div className="flex justify-center">
                <Mic className="h-10 w-10 md:h-12 md:w-12 text-red-600" />
              </div>
              <h3 className="mt-3 md:mt-4 text-lg md:text-xl font-medium text-gray-900">
                Voice to Text
              </h3>
              <p className="mt-2 text-sm md:text-base text-gray-500">
                Record your thoughts and automatically convert them into text
                notes
              </p>
            </div>
            <div className="text-center p-4">
              <div className="flex justify-center">
                <BookmarkIcon className="h-10 w-10 md:h-12 md:w-12 text-red-600" />
              </div>
              <h3 className="mt-3 md:mt-4 text-lg md:text-xl font-medium text-gray-900">
                Organize
              </h3>
              <p className="mt-2 text-sm md:text-base text-gray-500">
                Keep your notes organized with categories and tags
              </p>
            </div>
            <div className="text-center p-4">
              <div className="flex justify-center">
                <HomeIcon className="h-10 w-10 md:h-12 md:w-12 text-red-600" />
              </div>
              <h3 className="mt-3 md:mt-4 text-lg md:text-xl font-medium text-gray-900">
                Access Anywhere
              </h3>
              <p className="mt-2 text-sm md:text-base text-gray-500">
                Access your notes from any device, anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
