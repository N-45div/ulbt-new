import { FaChevronDown } from "react-icons/fa";
import { useState, useContext } from "react";
import { determineQuestionType } from "../utils/questionTypeUtils";
import { ThemeContext } from "../context/ThemeContext";

interface DivWithDropdownProps {
    textValue: string;
    index: number;
    onTypeChange: (index: number, type: string) => void;
    onQuestionTextChange: (index: number, newText: string) => void;
    initialQuestionText: string;
    initialType: string;
}

const DivWithDropdown: React.FC<DivWithDropdownProps> = ({
  textValue,
  index,
  onTypeChange,
  onQuestionTextChange,
  initialQuestionText,
  initialType,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [questionText, setQuestionText] = useState(initialQuestionText || "No text selected");
  const [selectedType, setSelectedType] = useState<string>(initialType || "Text");
  const [isOpen, setIsOpen] = useState(false);
  const { primaryValue } = determineQuestionType(textValue);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    onTypeChange(index, type);

    let newQuestionText = questionText;
    if (questionText === primaryValue || questionText === "No text selected") {
      if (type.toLowerCase() === "radio" && primaryValue) {
        newQuestionText = primaryValue;
      } else if (type.toLowerCase() === "text" && primaryValue) {
        newQuestionText = primaryValue;
      } else if (type.toLowerCase() === "number" && primaryValue) {
        newQuestionText = primaryValue;
      } else if (type.toLowerCase() === "date" && primaryValue) {
        newQuestionText = primaryValue;
      }
      setQuestionText(newQuestionText);
      onQuestionTextChange(index, newQuestionText);
    }
    setIsOpen(false);
  };

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setQuestionText(newText);
    onQuestionTextChange(index, newText);
  };

  const dropdownOptions = ["Text", "Paragraph", "Email", "Radio", "Number", "Date"];

  return (
    <div className="flex items-center space-x-8 w-full relative -top-[20vh]">
      <button className="flex flex-col justify-between h-10 w-12 p-1 transform hover:scale-105 transition-all duration-300">
        <span className={`block h-1 w-full rounded-full ${isDarkMode ? "bg-teal-400" : "bg-teal-600"}`}></span>
        <span className={`block h-1 w-full rounded-full ${isDarkMode ? "bg-teal-400" : "bg-teal-600"}`}></span>
        <span className={`block h-1 w-full rounded-full ${isDarkMode ? "bg-teal-400" : "bg-teal-600"}`}></span>
      </button>
      <div
        className={`relative w-full max-w-lg h-36 rounded-xl shadow-lg flex flex-col items-center justify-center text-lg font-semibold p-6 z-10 transform transition-all duration-300 hover:shadow-xl ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-700 to-gray-800 text-teal-200"
            : "bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-900"
        }`}
      >
        <div className="relative w-full flex items-center">
          <div className={`h-0.5 w-1/2 absolute left-0 opacity-50 ${isDarkMode ? "bg-teal-400" : "bg-teal-500"}`}></div>
          <input
            type="text"
            value={questionText}
            onChange={handleQuestionTextChange}
            className={`px-3 py-2 text-sm bg-transparent w-1/2 relative z-10 top-[-10px] max-w-full focus:outline-none transition-all duration-300 ${
              isDarkMode
                ? "border-b border-teal-400 text-teal-200 placeholder-teal-300/70 focus:border-cyan-400"
                : "border-b border-teal-400 text-teal-800 placeholder-teal-400/70 focus:border-cyan-500"
            }`}
            placeholder="Edit question text"
          />
        </div>

        <div className="absolute top-1/2 right-6 transform -translate-y-1/2 flex items-center space-x-2">
          <div className="relative">
            <button
              className={`flex items-center space-x-2 text-sm px-3 py-1 rounded-lg shadow-md transition-all duration-300 ${
                isDarkMode
                  ? "bg-gray-600/80 text-teal-200 hover:bg-gray-500"
                  : "bg-white/80 text-teal-900 hover:bg-white"
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>{selectedType}</span>
              <FaChevronDown className={isDarkMode ? "text-teal-400" : "text-teal-600"} />
            </button>
            {isOpen && (
              <div
                className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-50 ${
                  isDarkMode
                    ? "bg-gray-700/90 backdrop-blur-sm border-gray-600"
                    : "bg-white/90 backdrop-blur-sm border-teal-100"
                }`}
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div className="hide-scrollbar">
                  {dropdownOptions.map((type) => (
                    <div
                      key={type}
                      className={`px-4 py-2 cursor-pointer transition-all duration-200 ${
                        isDarkMode
                          ? "text-teal-200 hover:bg-gray-600"
                          : "text-teal-800 hover:bg-teal-50"
                      }`}
                      onClick={() => handleTypeSelect(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DivWithDropdown;
