import React, { useEffect, useState } from "react";
import { Mic, BookmarkIcon, HomeIcon, NotebookIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/logo";

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for auth token
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm fixed w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18">
            <div className="px-4 py-2">
              <div className="flex items-center">
                {/* <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">AI</span>
                </div> */}
                <Logo />
                <span className="ml-2 text-3xl font-semibold">AI Notes</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <button className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors">
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 rounded-md text-red-500 hover:bg-red-600 transition-colors"
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
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4  sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Transform Your Voice</span>
            <span className="block text-purple-600">Into Organized Notes</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create, organize, and manage your notes effortlessly with voice
            input. Perfect for students, professionals, and anyone who prefers
            speaking over typing.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 md:py-4 md:text-lg md:px-10"
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
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <Mic className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Voice to Text
              </h3>
              <p className="mt-2 text-gray-500">
                Record your thoughts and automatically convert them into text
                notes
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <BookmarkIcon className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Organize
              </h3>
              <p className="mt-2 text-gray-500">
                Keep your notes organized with categories and tags
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <HomeIcon className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Access Anywhere
              </h3>
              <p className="mt-2 text-gray-500">
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
