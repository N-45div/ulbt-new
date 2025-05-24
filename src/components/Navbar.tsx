import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { FaTools, FaSun, FaMoon } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";

// Define the props interface
interface NavbarProps {
  level?: string;
  questionnaire?: string;
  live_generation?: string;
  calculations?: string;
}

const Navbar = ({ level, questionnaire, live_generation, calculations }: NavbarProps) => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const navigation = useNavigate();
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    // Initialize level from sessionStorage if available
    const storedLevel = sessionStorage.getItem('currentLevel');
    return storedLevel ? parseInt(storedLevel) : 2; // Default to Level 2
  });

  // Determine current level from URL and set up proper routes
  useEffect(() => {
    // Check if current path indicates Level 3
    if (location.pathname.includes("Level-Three") || 
        location.pathname.includes("Questionnaire_Level3") ||
        location.pathname === "/Calculations") {
      
      // If we're in a Level 3 specific page, update and persist the level
      if (currentLevel !== 3) {
        setCurrentLevel(3);
        sessionStorage.setItem('currentLevel', '3');
        console.log("Level set to 3 and persisted");
      }
    } 
    // Check if current path indicates Level 2
    else if (location.pathname.includes("Level-Two") || 
             (location.pathname === "/Questionnaire" && !location.pathname.includes("Level3"))) {
      
      // If we're in a Level 2 specific page, update and persist the level
      if (currentLevel !== 2) {
        setCurrentLevel(2);
        sessionStorage.setItem('currentLevel', '2');
        console.log("Level set to 2 and persisted");
      }
    }
    // If on a shared path like Live_Generation, keep the existing level

    // Define routes based on the current location
    const routes: Record<string, string> = {
      // Common path
      "/Finish": "Generated Document",
      
      // Level 2 paths
      "/Level-Two-Part-Two": "Document",
      "/Questionnaire": "Questionnaire",
      
      // Level 3 paths
      "/Level-Three-Quiz": "Document",
      "/Questionnaire_Level3": "Questionnaire",
      "/Calculations": "Calculations",
      "/Live_Generation_2": "Live Document Generation",
      
      // Add custom routes from props if provided
      ...(level && { [level]: "Document" }),
      ...(questionnaire && { [questionnaire]: "Questionnaire" }),
      ...(live_generation && { [live_generation]: "Live Document Generation" }),
      ...(calculations && { [calculations]: "Calculations" }),
    };

    const activeLabel = routes[location.pathname] || null;
    console.log("Current pathname:", location.pathname, 
                "Active label:", activeLabel, 
                "Current level:", currentLevel);
    setActiveButton(activeLabel);
  }, [location.pathname, level, questionnaire, live_generation, calculations, currentLevel]);

  const handlePageChange = (label: string) => {
    const storedLevel = parseInt(sessionStorage.getItem('currentLevel') || '2');
    console.log("current level: ", storedLevel);
    // Define level-specific routes based on the persisted level
    let targetPath;
    
    if (storedLevel === 3) {
      // Level 3 routes
      switch (label) {
        case "Document":
          targetPath = "/Level-Three-Quiz";
          break;
        case "Questionnaire":
          targetPath = "/Questionnaire_Level3";
          break;
        case "Live Document Generation":
          targetPath = "/Live_Generation_2";
          break;
        case "Generated Document":
          targetPath = "/Finish";
          break;
        case "Calculations":
          targetPath = "/Calculations";
          break;
        default:
          targetPath = null;
      }
    } else {
      // Level 2 routes
      switch (label) {
        case "Document":
          targetPath = "/Level-Two-Part-Two";
          break;
        case "Questionnaire":
          targetPath = "/Questionnaire";
          break;
        case "Live Document Generation":
          targetPath = "/Live_Generation_2";
          break;
        case "Generated Document":
          targetPath = "/Finish";
          break;
        default:
          targetPath = null;
      }
    }
    
    // Override with custom paths from props if provided
    if (label === "Document" && level) targetPath = level;
    if (label === "Questionnaire" && questionnaire && currentLevel === 2) targetPath = questionnaire;
    if (label === "Live Document Generation" && live_generation) targetPath = live_generation;
    if (label === "Calculations" && calculations) targetPath = calculations;
    
    console.log(`Navigating to: ${targetPath}, Label: ${label}, Current level: ${storedLevel}`);
    if (targetPath) {
      navigation(targetPath);
    }
  };

  // Determine which nav buttons to show based on level
  const getNavButtons = () => {
    const baseButtons = ["Document", "Questionnaire", "Live Document Generation"];
    
    // Only show Calculations button in Level 3
    return currentLevel === 3 ? [...baseButtons, "Calculations"] : baseButtons;
  };

  return (
    <div
      className={`w-full shadow-md sticky top-0 z-50 transition-all duration-500 ${
        isDarkMode ? "bg-gray-800" : "bg-lime-300"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex">
            {location.pathname !== "/Finish" ? (
              getNavButtons().map((label, idx) => (
                <button
                  id={
                    idx === 1
                      ? "Questionnaire-button"
                      : idx === 2
                      ? "live-document-generation"
                      : idx === 0
                      ? "document-page"
                      : idx === 3
                      ? "calculations-page"
                      : undefined
                  }
                  key={label}
                  className={`px-8 py-3 cursor-pointer font-medium border-r border-lime-400 transition-colors duration-200 flex items-center space-x-2 ${
                    activeButton === label
                      ? isDarkMode
                        ? "text-teal-300"
                        : "text-gray-700"
                      : isDarkMode
                      ? "text-white"
                      : "text-blue-600"
                  } ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-lime-400"}`}
                  onClick={() => handlePageChange(label)}
                >
                  <span>{label}</span>
                </button>
              ))
            ) : (
              <div className="flex-1 flex justify-end pr-4">
                <span
                  className={`px-8 py-3 font-medium flex items-center space-x-2 text-xl ${
                    isDarkMode ? "text-teal-300" : "text-blue-600"
                  }`}
                >
                  <span>Generated Document</span>
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center px-6 space-x-6">
            <span
              className={`text-xl font-semibold tracking-wide ${
                isDarkMode ? "text-teal-300" : "text-blue-600"
              }`}
            >
              Contractual
            </span>
            <div className="relative flex items-center">
              <button
                className={`p-2 rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center text-2xl ${
                  isDarkMode ? "text-white hover:bg-gray-700" : "text-blue-600 hover:bg-lime-400"
                }`}
                onMouseEnter={() => setTooltip("Settings")}
                onMouseLeave={() => setTooltip(null)}
              >
                <FaTools />
              </button>
              {tooltip === "Settings" && (
                <div
                  className={`absolute top-full mb-2 px-3 py-1 text-sm rounded shadow-md whitespace-nowrap ${
                    isDarkMode ? "text-white bg-gray-700" : "text-white bg-gray-500"
                  }`}
                >
                  Settings
                </div>
              )}
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 relative left-12 rounded-full shadow-md transition-all duration-300 transform hover:scale-110 ${
                isDarkMode
                  ? "bg-gray-600 text-yellow-400 hover:bg-gray-100"
                  : "bg-lime-900 text-white hover:bg-black"
              } flex items-center justify-center text-xl`}
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;