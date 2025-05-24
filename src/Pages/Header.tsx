import React from "react";

interface HeaderProps {
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode }) => {
  return (
    <div className="flex items-center">
      {/* Logo/Brand */}
      <div className="flex items-center">
        <span className={`text-xl font-bold ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}>
          CLM Training
        </span>
        {/* <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
          isDarkMode 
            ? "bg-teal-800/70 text-teal-200" 
            : "bg-teal-100 text-teal-800"
        }`}>
          Beta
        </span> */}
      </div>
      
      {/* Desktop Navigation Links - only visible on desktop */}
      <div className="hidden md:flex ml-6 space-x-4">
        <a
          href="#"
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            isDarkMode
              ? "text-white hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Dashboard
        </a>
        <a
          href="#"
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-800 hover:text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          Progress
        </a>
        <a
          href="#"
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-800 hover:text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          Certification
        </a>
        <a
          href="#"
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-800 hover:text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          Resources
        </a>
      </div>
    </div>
  );
};

export default Header;