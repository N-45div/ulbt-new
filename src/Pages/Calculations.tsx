import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ThemeContext } from "../context/ThemeContext";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useScore } from '../context/ScoreContext';
import { motion } from "framer-motion";
import { FaCalculator } from "react-icons/fa";

const Calculations = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { highlightedTexts } = useHighlightedText();
  const { totalScore, updateScore } = useScore();
  const [clickedButton, setClickedButton] = useState("Multiply");
  const [inputType, setInputType] = useState("text");
  const [showIncludeOptions, setShowIncludeOptions] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [opScoreValue, setOpScoreValue] = useState("");
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [hasScoredFirstInclude, setHasScoredFirstInclude] = useState(false);
  const [hasScoredFinalInclude, setHasScoredFinalInclude] = useState(false);

  // Set default values
  useEffect(() => {
    localStorage.setItem("operationType", clickedButton);
    localStorage.setItem("operationValue", inputValue || "100");
  }, [clickedButton, inputValue]);

  const handleButtonClick = (buttonName: string) => {
    const previousButton = clickedButton;
    setClickedButton(buttonName);
    
    // Only score if the button actually changed
    if (previousButton !== buttonName) {
      if (buttonName === "Multiply") {
        updateScore(3);
        setScoreChange(3);
      } else {
        updateScore(-2);
        setScoreChange(-2);
      }
      setTimeout(() => setScoreChange(null), 2000);
    }
  };

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setInputType(event.target.value); 
  };

  const handleFirstIncludeClick = () => {
    setShowIncludeOptions(!showIncludeOptions);
    
    // Only score the first time include is clicked
    if (!showIncludeOptions && !hasScoredFirstInclude) {
      updateScore(3);
      setScoreChange(3);
      setTimeout(() => setScoreChange(null), 2000);
      setHasScoredFirstInclude(true);
    }
  };

  const handleOpScoreUpdate = () => {
    // Only score the final include once
    if (!hasScoredFinalInclude) {
      if (inputType === "number" && inputValue) {
        updateScore(3);
        setScoreChange(3);
      } else {
        updateScore(-2);
        setScoreChange(-2);
      }
      setTimeout(() => setScoreChange(null), 2000);
      setHasScoredFinalInclude(true);
    }
    
    setOpScoreValue(`${clickedButton} (Unused Holiday Days, ${inputValue})`);
    localStorage.setItem("operationValue", inputValue);
  };

  return (
    <div
      className={`w-full min-h-screen font-sans ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      <Navbar level={"/Level-Three-Quiz"} questionnaire={"/Questionnaire_Level3"} live_generation={"/Live_Generation_2"} calculations={"/Calculations"}/>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4 z-30">
        <button
          onClick={() => navigate("/Questionnaire_Level3")}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
        >
          ← Back to Questionaire
        </button>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
        >
          Home
        </button>
        <button
          onClick={() => navigate("/Live_Generation_2")}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
        >
          Continue
        </button>
      </div>
      {/* Score Display - Only animation kept */}
      <div className="fixed top-16 left-0 z-50 px-6 py-3">
        <div className="relative">
          <div className={`p-3 rounded-full shadow-lg flex items-center ${
            isDarkMode 
              ? "bg-gray-700 text-white" 
              : "bg-teal-500 text-white"
          }`}>
            <FaCalculator className="mr-2" />
            <span className="font-bold mr-2">Score:</span> {totalScore}
            {scoreChange !== null && (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className={`absolute -top-6 right-0 text-sm font-bold ${
                  scoreChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
              </motion.span>
            )}
          </div>
        </div>
      </div>

      {!highlightedTexts.includes("Unused Holiday Days") ? (
        <div className="text-center text-black-500 mt-4">
          Please select "Unused Holiday Days" to begin.
        </div>
      ) : (
        <div className="flex justify-between mt-6 px-4">
          {/* Left Side: Buttons - Original UI */}
          <div className="w-1/2 h-20 p-4 ml-20 border border-gray-300 rounded-lg shadow-lg bg-white">
            <div className="flex space-x-4 justify-center">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleButtonClick("Add")}
              >
                Add
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleButtonClick("Subtract")}
              >
                Subtract
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleButtonClick("Multiply")}
              >
                Multiply
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleButtonClick("Divide")}
              >
                Divide
              </button>
            </div>
            <div className="mt-20 w-full">
                {clickedButton && (
                    <div>
                        <h2 className="text-2xl font-semibold">{clickedButton}</h2>

                        <button 
                            className="px-4 mt-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            onClick={handleFirstIncludeClick}>
                            Include
                        </button>

                        <div className="mt-4 text-lg font-medium">Unused Holiday Days</div>
                        {showIncludeOptions && (
                            <div>
                                <div className="mt-4 flex space-x-4">
                                        <button 
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                            onClick={handleOpScoreUpdate}>
                                            Include
                                        </button>
                                        <div className="flex space-x-2">
                                            <label htmlFor="dropdown" className="text-lg font-medium">Type:</label>
                                            <select
                                            id="dropdown"
                                            className="px-4 py-2 border rounded-lg"
                                            onChange={handleDropdownChange}
                                            >
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <input
                                            type={inputType}
                                            className="px-4 py-2 border rounded-lg w-full"
                                            placeholder={`Enter ${inputType}`}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                        />
                                    </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
          
          {/* Right Side: OpScore 1 - Original UI */}
          <div className="w-1/3 h-40 p-4 mr-10 border border-gray-300 rounded-lg shadow-lg bg-white text-center flex flex-col justify-center overflow-hidden">
            <div className="text-xl font-semibold text-gray-800">
                OpScore 1
            </div>

            <div className="mt-2 text-lg text-gray-700 break-words overflow-hidden text-ellipsis px-2 max-h-[4rem]">
                {opScoreValue || "—"}
            </div>
          </div>
        </div>
      )}
      {/* {highlightedTexts.includes("Unused Holiday Days") && (
        <div className="flex justify-center mt-10">
            <button 
            className="mt-55 px-6 py-3 bg-purple-500 text-white text-lg font-semibold rounded-lg hover:bg-purple-600"
            onClick={() => navigate("/Live_Generation_2")}>
                Continue
            </button>
        </div>
      )} */}
    </div>
  );
};

export default Calculations;
