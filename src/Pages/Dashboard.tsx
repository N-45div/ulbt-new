import React, { useState, useMemo, useEffect } from "react";
import {
  FaFileAlt,
  FaTimes,
  FaChevronRight,
  FaRegLightbulb,
  FaPuzzlePiece,
  FaSignOutAlt,
  FaUser
} from "react-icons/fa";
import { GrDocumentConfig } from "react-icons/gr";
import { GiLevelThreeAdvanced } from "react-icons/gi";
import { LuBrain } from "react-icons/lu";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase"; // Import the auth object from your firebase file
import { signOut } from "firebase/auth";
import Header from "./Header";
import { useScore } from "../context/ScoreContext";

interface LevelProps {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  link: string;
  isLevel2?: boolean;
}

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPart: (part: string, isDemo?: boolean) => void; // Add isDemo param
  isDarkMode: boolean;
}

// Logout confirmation dialog component
interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div 
        className={`rounded-2xl w-full max-w-md mx-4 transform transition-all duration-300 ease-out animate-scale-in ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? "border-gray-800" : "border-gray-100"}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-2xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
              Confirm Logout
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
              aria-label="Close dialog"
            >
              <FaTimes className={`${isDarkMode ? "text-gray-300 hover:text-gray-100" : "text-gray-400 hover:text-gray-600"} text-xl`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} mb-6`}>
            Are you sure you want to log out of your account?
          </p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg transition-all duration-200 bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  onClose,
  onSelectPart,
  isDarkMode,
}) => {

  const { levelTwoScore } = useScore();
  if (!isOpen) return null;

  const handlePartSelect = (partNumber: number) => {
    localStorage.setItem("selectedPart", partNumber.toString());
    console.log("Saved part:", partNumber);
    if (partNumber === 4) {
      onSelectPart("two-demo");
    } else {
      onSelectPart("two");

    }
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div 
        className={`rounded-2xl w-full max-w-lg mx-4 transform transition-all duration-300 ease-out animate-scale-in ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? "border-gray-800" : "border-gray-100"}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-2xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
              Choose Your Path
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
              aria-label="Close dialog"
            >
              <FaTimes className={`${isDarkMode ? "text-gray-300 hover:text-gray-100" : "text-gray-400 hover:text-gray-600"} text-xl`} />
            </button>
          </div>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-2`}>
            Select which part you'd like to explore
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Part One Button */}
            <button
              onClick={() => onSelectPart("one")}
              className={`group relative flex items-center p-4 rounded-xl transition-all duration-300 ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-900/50 to-blue-800/50 hover:from-blue-800 hover:to-blue-700"
                  : "bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
              }`}
              aria-label="Select Part One"
            >
              <div className={`${isDarkMode ? "bg-blue-700" : "bg-blue-500"} p-3 rounded-lg shadow-md`}>
                <FaRegLightbulb className="text-white text-xl" />
              </div>
              <div className="ml-4 text-left">
                <h4 className={`text-lg font-semibold ${isDarkMode ? "text-blue-200" : "text-blue-900"}`}>
                  Part One
                </h4>
                <p className={`${isDarkMode ? "text-blue-400" : "text-blue-600"} text-sm`}>
                  Match The Following
                </p>
              </div>
              <FaChevronRight className={`absolute right-4 ${
                isDarkMode ? "text-blue-400 group-hover:text-blue-300" : "text-blue-400 group-hover:text-blue-600"
              } group-hover:transform group-hover:translate-x-1 transition-all`} />
            </button>

            {/* Part Two [Demo] Button */}
            <button
              // onClick={() => onSelectPart("two", true)}
              onClick={() => handlePartSelect(4)}
              className={`group relative flex items-center p-4 rounded-xl transition-all duration-300 ${
                isDarkMode
                  ? "bg-gradient-to-r from-green-900/50 to-lime-800/50 hover:from-green-800 hover:to-lime-700"
                  : "bg-gradient-to-r from-green-50 to-green-100 hover:from-lime-100 hover:to-lime-200"
              }`}
            >
              <div className={`${isDarkMode ? "bg-lime-700" : "bg-lime-500"} p-3 rounded-lg`}>
                <FaPuzzlePiece className="text-white text-xl" />
              </div>
              <div className="ml-4 text-left">
                <h4 className={`text-lg font-semibold ${isDarkMode ? "text-lime-200" : "text-lime-900"}`}>
                  Part Two [Demo]
                </h4>
                <p className={`${isDarkMode ? "text-lime-400" : "text-lime-600"} text-sm`}>
                  Automate Employment Agreement
                </p>
              </div>
              <FaChevronRight className={`absolute right-4 ${
                isDarkMode ? "text-lime-400 group-hover:text-lime-300" : "text-lime-400 group-hover:text-lime-600"
              } group-hover:transform group-hover:translate-x-1 transition-all`} />
            </button>
            
            {/* Part Two Button */}
            <div className="relative group">
              <button
                // onClick={() => onSelectPart("two")}
                className={`w-full group relative flex items-center p-4 rounded-xl transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-green-900/50 to-lime-800/50 hover:from-green-800 hover:to-lime-700"
                    : "bg-gradient-to-r from-green-50 to-green-100 hover:from-lime-100 hover:to-lime-200"
                }`}
                aria-label="Select Part Two"
              >
                <div className={`${isDarkMode ? "bg-lime-700" : "bg-lime-500"} p-3 rounded-lg shadow-md`}>
                  <FaPuzzlePiece className="text-white text-xl" />
                </div>
                <div className="ml-4 text-left">
                  <h4 className={`text-lg font-semibold ${isDarkMode ? "text-lime-200" : "text-lime-900"}`}>
                    Part Two
                  </h4>
                  <p className={`${isDarkMode ? "text-lime-400" : "text-lime-600"} text-sm`}>
                    Automate Employment Agreement
                  </p>
                </div>
                <FaChevronRight className={`absolute right-4 ${
                  isDarkMode ? "text-lime-400 group-hover:text-lime-300" : "text-lime-400 group-hover:text-lime-600"
                } group-hover:transform group-hover:translate-x-1 transition-all`} />
              </button>

              {/* Hover Section with Buttons */}
              <div className="absolute left-full top-0 ml-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-10">
                <div className={`p-4 rounded-xl shadow-lg w-64 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}>
                  <button className="w-full p-2 mb-2 rounded-lg bg-lime-600 text-white hover:bg-lime-700" onClick={() => handlePartSelect(1)}>
                    Part 1: Automating Placeholders
                  </button>
                  <button 
                  className={`w-full p-2 mb-2 rounded-lg ${
                    levelTwoScore < 0   // change this to actual level 2 score for passing
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-lime-600 text-white hover:bg-lime-700"
                  }`}
                  onClick={() => levelTwoScore >= 0 && handlePartSelect(2)}>
                    Part 2: Automating Small Conditions
                  </button>
                  <button 
                  className={`w-full p-2 mb-2 rounded-lg ${
                    levelTwoScore < 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-lime-600 text-white hover:bg-lime-700"
                  }`}
                  onClick={() => levelTwoScore >= 0 && handlePartSelect(3)}>
                    Part 3: Automating big Conditions
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 rounded-b-2xl ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
          <p className={`text-sm text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            You can always switch between parts later
          </p>
        </div>
      </div>
    </div>
  );
};

const LevelCard: React.FC<LevelProps & { isDarkMode: boolean }> = ({
  title,
  description,
  Icon,
  active,
  onClick,
  link,
  isLevel2,
  isDarkMode,
}) => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  const handleStartLevel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering parent onClick
    if (isLevel2) {
      setShowDialog(true);
    } else {
      navigate(link);
    }
  };

 const handleSelectPart = (part: string, isDemo?: boolean) => {
  setShowDialog(false);
  if (part === "one") {
    navigate("/Level-Two-Part-One");
  } else if (part === "two") {
    navigate("/Level-Two-Part-Two", { 
      state: { 
        startTour: isDemo || false 
      } 
    });
  } else {
    navigate("/Level-Two-Part-Two-Demo", { 
      state: { 
        startTour: isDemo || false 
      } 
    });
  }
};

  return (
    <>
      <div
        className={`p-6 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl relative 
          ${
            isDarkMode
              ? `bg-gradient-to-r ${
                  active
                    ? "from-teal-900/50 to-lime-900/50 border-2 border-teal-700/50"
                    : "from-teal-900/30 to-lime-900/30 border border-teal-800/50"
                } hover:from-teal-800/70 hover:to-lime-800/70`
              : `bg-gradient-to-r ${
                  active
                    ? "from-teal-200/50 to-lime-200/50 border-2 border-teal-300/50"
                    : "from-teal-100/50 to-lime-100/50 border border-teal-200/50"
                } hover:from-teal-100/70 hover:to-lime-100/70`
          }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-pressed={active}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick();
          }
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-2 rounded-lg shadow-md ${
              isDarkMode
                ? active
                  ? "bg-gradient-to-br from-teal-700 to-lime-800 text-white"
                  : "bg-gradient-to-br from-teal-800 to-lime-700"
                : active
                ? "bg-gradient-to-br from-teal-500 to-lime-600 text-white"
                : "bg-gradient-to-br from-teal-300 to-lime-400"
            }`}
          >
            <Icon className="text-xl" />
          </div>
          <h3
            className={`font-semibold text-lg ${
              isDarkMode
                ? active
                  ? "text-teal-300"
                  : "text-gray-200"
                : active
                ? "text-teal-900"
                : "text-gray-800"
            }`}
          >
            {title}
          </h3>
        </div>
        <p
          className={`text-sm leading-relaxed ${
            isDarkMode
              ? active
                ? "text-gray-300"
                : "text-gray-400"
              : active
              ? "text-gray-700"
              : "text-gray-600"
          }`}
        >
          {description}
        </p>
        {active && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleStartLevel}
              className={`px-6 py-2.5 max-w-[200px] cursor-pointer w-full text-white rounded-xl font-medium shadow-lg transition-all duration-300 text-center ${
                isDarkMode
                  ? "bg-gradient-to-r from-teal-700 to-lime-700 hover:from-teal-600 hover:to-lime-600"
                  : "bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-400 hover:to-lime-400"
              } transform hover:translate-y-px hover:shadow-xl`}
              aria-label={`Start ${title} level`}
            >
              Start Level
            </button>
          </div>
        )}
      </div>

      <CustomDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSelectPart={handleSelectPart}
        isDarkMode={isDarkMode}
      />
    </>
  );
};

// Define levels data outside the component to avoid recreation on each render
const levelsData = [
  {
    title: "Simple Quiz",
    description:
      "Test your basic knowledge of contract management with a quick and engaging quiz.",
    Icon: FaFileAlt,
    link: "/Level-One-Design",
  },
  {
    title: "Document Automation Basics",
    description:
      "Learn the essentials of automating employment agreements with placeholders and conditional logic.",
    Icon: GrDocumentConfig,
    link: "/Level-Two",
    isLevel2: true,
  },
  {
    title: "Advanced Document Automation",
    description:
      "Dive deeper into automating complex documents with advanced techniques and logic.",
    Icon: GiLevelThreeAdvanced,
    link: "/Level-Three-Quiz",
  },
  {
    title: "CLM Workflows",
    description:
      "Explore contract lifecycle management by designing and optimizing real-world workflows.",
    Icon: LuBrain,
    link: "/Level-Four-Quiz",
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const levels = useMemo(() => levelsData, []);

  // Clear session storage when the user navigates to the Dashboard
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  // Load dark mode preference from localStorage
  useEffect(() => {
    // Check for user's preferred color scheme
    const prefersDarkMode = window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // First check localStorage, then fallback to system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    const initialDarkMode = savedDarkMode !== null 
      ? savedDarkMode === 'true' 
      : prefersDarkMode;
      
    setIsDarkMode(initialDarkMode);
    
    // Get user info from auth
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Use displayName if available, otherwise fallback to the first part of the email or 'User'
        setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      } else {
        // If no user is logged in, redirect to login
        navigate('/login');
      }
    });
    
    // Listen for system color scheme changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference in localStorage
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
      }
    };
    
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleColorSchemeChange);
    }
    
    // Close mobile menu when window is resized to desktop size
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
      if (darkModeMediaQuery.removeEventListener) {
        darkModeMediaQuery.removeEventListener('change', handleColorSchemeChange);
      }
    };
  }, [navigate, isMenuOpen]);

  const handleLevelClick = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      setShowLogoutDialog(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-blue-900/50 to-slate-800"
          : "bg-gradient-to-br from-yellow-100 via-blue-100 to-lime-100"
      }`}
    >
      {/* Improved Navbar */}
      <nav 
        className={`w-full transition-all duration-300 fixed top-0 left-0 z-40 ${
          isDarkMode ? "bg-gray-900/90" : "bg-white/90"
        } backdrop-blur-md border-b ${
          isDarkMode ? "border-gray-800" : "border-gray-200"
        } shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Header isDarkMode={isDarkMode} />
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center justify-end space-x-4 lg:space-x-6">
              {/* User Profile - Desktop */}
              {userName && (
                <div className="flex items-center space-x-2 px-2">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                    isDarkMode ? "bg-teal-800" : "bg-teal-100"
                  }`}>
                    <FaUser className={`${
                      isDarkMode ? "text-teal-300" : "text-teal-600"
                    } text-sm`} />
                  </div>
                  <span className={`font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    {userName}
                  </span>
                </div>
              )}
              
              {/* Theme Toggle - Desktop */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full shadow-md transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-800 text-yellow-300 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <BsSunFill className="text-lg" />
                ) : (
                  <BsMoonStarsFill className="text-lg" />
                )}
              </button>
              
              {/* Logout Button - Desktop */}
              <button
                onClick={() => setShowLogoutDialog(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all duration-300 bg-gradient-to-r from-rose-500 to-red-500 text-white hover:shadow-lg hover:from-rose-600 hover:to-red-600 transform hover:translate-y-px"
                aria-label="Log out"
                title="Log out"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme Toggle - Small Mobile */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full shadow-md transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-800 text-yellow-300 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <BsSunFill className="text-sm" />
                ) : (
                  <BsMoonStarsFill className="text-sm" />
                )}
              </button>

              {/* Logout Button - Small Mobile */}
              <button
                onClick={() => setShowLogoutDialog(true)}
                className={`p-2 rounded-full shadow-md transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-800 text-red-400 hover:bg-gray-700"
                    : "bg-gray-200 text-red-500 hover:bg-gray-300"
                }`}
                aria-label="Log out"
              >
                <FaSignOutAlt className="text-sm" />
              </button>

              <button
                onClick={toggleMenu}
                className={`p-2 rounded-md ${
                  isDarkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-200"
                } focus:outline-none`}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open menu</span>
                <svg 
                  className="h-6 w-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden md:hidden ${
            isMenuOpen ? "max-h-64 opacity-100 pb-4" : "max-h-0 opacity-0"
          } ${isDarkMode ? "bg-gray-900/95" : "bg-white/95"} backdrop-blur-sm`}
          aria-hidden={!isMenuOpen}
        >
          <div className="px-4 py-3 space-y-4">
            {/* User Profile - Mobile */}
            {userName && (
              <div className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${
                isDarkMode ? "bg-gray-800/70" : "bg-gray-100/70"
              }`}>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  isDarkMode ? "bg-teal-800" : "bg-teal-100"
                }`}>
                  <FaUser className={`${
                    isDarkMode ? "text-teal-300" : "text-teal-600"
                  } text-sm`} />
                </div>
                <span className={`font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  {userName}
                </span>
              </div>
            )}

            {/* Navigation Links - Mobile */}
            <div className="space-y-2">
              <a
                href="#"
                className={`block rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Dashboard
              </a>
              <a
                href="#"
                className={`block rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Progress
              </a>
              <a
                href="#"
                className={`block rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Certification
              </a>
              <a
                href="#"
                className={`block rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Resources
              </a>
            </div>

            {/* Logout Button - Mobile */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-lg shadow-md transition-all duration-300 bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="w-full max-w-7xl mx-auto py-24 pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6 lg:px-8 relative">
        <div
          className={`p-4 sm:p-6 md:p-8 rounded-3xl shadow-xl ${
            isDarkMode ? "bg-gray-800/90" : "bg-white/90"
          } backdrop-blur-sm transform transition-all duration-500`}
        >
          <div className="max-w-3xl mx-auto mb-6 md:mb-8 text-center">
            <h1
              className={`text-2xl sm:text-3xl font-bold mb-2 ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Welcome to CLM Training
            </h1>
            <p className={`text-sm sm:text-base ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Select a learning path to begin your contract management journey
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {levels.map((level, index) => (
              <LevelCard
                key={index}
                {...level}
                active={index === activeIndex}
                onClick={() => handleLevelClick(index)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Logout confirmation dialog */}
      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default Dashboard;