import { useState, useEffect } from "react";

// Props for the CodeCircuit component
interface CodeCircuitProps {
  highlightedTexts: string[];
  userAnswers: { [key: string]: any };
  isDarkMode: boolean;
  onRetry: () => void;
  onContinue: () => void;
}

const CodeCircuit_SubLevel_3Game: React.FC<CodeCircuitProps> = ({
  highlightedTexts,
  userAnswers,
  isDarkMode,
  onRetry,
  onContinue,
}) => {
  const [stars, setStars] = useState(0);
  const [showBonusTip, setShowBonusTip] = useState(false);
  const [animateCircuit, setAnimateCircuit] = useState(false);

  // Big Conditions to check
  const bigConditions = [
    "Is the clause of probationary period applicable?",
    "Is the Pension clause applicable?",
  ];

  // Calculate the number of correct Big Conditions and the score
  const totalConditions = bigConditions.length;
  const userCorrect = bigConditions.filter((condition) => {
    // Check if the user answered "true" for the condition
    return userAnswers[condition] === true;
  }).length;
  const score = (userCorrect / totalConditions) * 100;

  // Determine stars and bonus tip visibility
  useEffect(() => {
    let starCount = 0;
    if (userCorrect === 2) starCount = 3; // 100% → 3 stars
    else if (userCorrect === 1) starCount = 1; // 50% → 1 star
    else starCount = 0; // 0% → 0 stars

    setStars(starCount);

    // Animate circuit
    setAnimateCircuit(true);

    // Show bonus tip if 3 stars
    if (starCount === 3) {
      setTimeout(() => {
        setShowBonusTip(true);
      }, 1000); // Delay bonus tip for effect
    }

    // Debugging logs
    console.log("Big Conditions:", bigConditions);
    console.log("Highlighted Texts:", highlightedTexts);
    console.log("User Answers:", userAnswers);
    console.log("User Correct:", userCorrect);
    console.log("Score:", score);
  }, [userCorrect, highlightedTexts, userAnswers]);

  // Determine feedback message
  let feedbackMessage = "";
  let feedbackIcon = "";
  if (userCorrect === 2) {
    feedbackMessage = "Circuit Complete – You've mastered big conditions!";
    feedbackIcon = "⚡";
  } else if (userCorrect === 1) {
    feedbackMessage = "Circuit Incomplete – Try again to complete the logic.";
    feedbackIcon = "⚠️";
  } else {
    feedbackMessage = "Circuit Failed – Give it another shot.";
    feedbackIcon = "🔌";
  }

  // Determine the progress percentage for the connector line
  const progressPercentage = userCorrect === 1 ? 50 : userCorrect === 2 ? 100 : 0;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Simple transparent blur background */}
      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? "bg-gray-900/60 backdrop-blur-md"
            : "bg-white/60 backdrop-blur-md"
        }`}
      ></div>

      {/* Main Container */}
      <div
        className={`p-6 rounded-3xl shadow-2xl border max-w-md w-full text-center relative z-10 backdrop-blur-sm transition-all duration-500 ${
          isDarkMode
            ? "bg-gray-800/70 border-teal-700/50 text-teal-200"
            : "bg-white/70 border-teal-300 text-teal-900"
        }`}
      >
        {/* Header with glowing effect */}
        <div className="mb-8">
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-teal-300" : "text-teal-700"
            } flex items-center justify-center gap-3`}
          >
            <span className={`text-2xl ${userCorrect === 2 ? 'animate-pulse' : ''}`}>⚡</span>
            <span className="relative">
              Sub-Level 3: Big Conditions
              {userCorrect === 2 && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></span>
              )}
            </span>
          </h2>
        </div>

        {/* Circuit Display with enhanced animation */}
        <div className="relative mb-10 py-4">
          <div className="flex items-center justify-center gap-4">
            {/* Node 1 with pulsing effect */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-700 transform ${
                animateCircuit && userCorrect >= 1 ? "scale-110" : ""
              } ${
                userCorrect >= 1
                  ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-400"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <span className={userCorrect >= 1 ? "animate-pulse" : ""}>💡</span>
            </div>

            {/* Electric Connector Line with animation */}
            <div className="relative flex-1 h-16 flex items-center">
              <div
                className={`absolute top-1/2 -translate-y-1/2 h-2 w-full rounded-full transition-all duration-1000 ${
                  isDarkMode ? "bg-gray-600" : "bg-gray-200"
                }`}
              ></div>
              {/* Progress Overlay */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full transition-all duration-1000 bg-gradient-to-r from-green-500 via-teal-400 to-green-500`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
              
              {/* Electric current animation */}
              {userCorrect >= 1 && (
                <>
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-2 w-6 bg-white rounded-full animate-ping opacity-70 ${
                      userCorrect === 1 ? "left-[25%]" : "left-0"
                    }`}
                  ></div>
                  {userCorrect === 1 ? (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 left-[50%] h-2 w-4 bg-white rounded-full animate-ping opacity-70"
                      style={{ animationDelay: '0.3s' }}
                    ></div>
                  ) : (
                    <>
                      <div
                        className="absolute top-1/2 -translate-y-1/2 left-1/4 h-2 w-4 bg-white rounded-full animate-ping opacity-70"
                        style={{ animationDelay: '0.3s' }}
                      ></div>
                      <div
                        className="absolute top-1/2 -translate-y-1/2 left-2/3 h-2 w-5 bg-white rounded-full animate-ping opacity-70"
                        style={{ animationDelay: '0.7s' }}
                      ></div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Node 2 with pulsing effect */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-700 transform ${
                animateCircuit && userCorrect === 2 ? "scale-110" : ""
              } ${
                userCorrect === 2
                  ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-400"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <span className={userCorrect === 2 ? "animate-pulse" : ""}>💡</span>
            </div>
          </div>
          
          {/* Circuit Status Indicator */}
          <div className={`mt-6 px-4 py-2 rounded-full mx-auto max-w-max transition-all duration-500 ${
            userCorrect === 2
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : userCorrect === 1
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{feedbackIcon}</span>
              <p className="text-sm font-semibold">{feedbackMessage}</p>
            </div>
          </div>
        </div>

        {/* Star Ratings with enhanced animation */}
        <div className="flex justify-center gap-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="relative">
              <span
                className={`text-3xl transition-all duration-700 ${
                  i < stars
                    ? "text-yellow-400 scale-110 opacity-100"
                    : "text-gray-400 scale-95 opacity-40"
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                ⭐
              </span>
              {i < stars && (
                <div className="absolute inset-0 text-3xl text-yellow-400 animate-ping opacity-30">
                  ⭐
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced Bonus Tip (only for 3 stars) */}
        {showBonusTip && (
          <div
            className={`p-5 rounded-2xl mb-8 transform transition-all duration-500 ${
              isDarkMode
                ? "bg-gradient-to-br from-teal-900/70 to-teal-800/50 border border-teal-700/50"
                : "bg-gradient-to-br from-teal-100 to-teal-50 border border-teal-200"
            } shadow-lg`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl animate-bounce">🎁</span>
              <h3 className="text-lg font-bold">Pro Tip Unlocked!</h3>
            </div>
            <p className="text-sm mb-3 leading-relaxed">
              Think ahead: Use clear naming and folder structure when building
              automation projects — future you will thank you!
            </p>
            <div
              className={`text-sm font-bold px-4 py-2 rounded-full max-w-max mx-auto ${
                isDarkMode ? "bg-teal-800/50 text-teal-100" : "bg-teal-500/20 text-teal-800"
              }`}
            >
              You've completed all 3 levels. Great job! 🎉🎉🎉
            </div>
          </div>
        )}

        {/* User Options (CTA Buttons) with enhanced styling */}
        <div className="flex flex-col gap-4">
          <button
            onClick={onRetry}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 ${
              isDarkMode
                ? "bg-gray-700/80 text-teal-200 hover:bg-gray-600/80 border border-gray-600/50"
                : "bg-teal-100 text-teal-900 hover:bg-teal-200 border border-teal-200"
            } shadow-md`}
          >
            <span className="text-xl">🔁</span>
            <span>Retry Sub-Level 3</span>
          </button>
          <button
            onClick={onContinue}
            disabled={score < 50}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 transform ${score >= 50 ? "hover:scale-105" : ""} ${
              score >= 50
                ? isDarkMode
                  ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-500 hover:to-teal-400"
                  : "bg-gradient-to-r from-teal-500 to-teal-400 text-white hover:from-teal-400 hover:to-teal-300"
                : "bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed"
            } shadow-md`}
          >
            {score >= 50 ? (
              <>
                <span className="text-xl">✅</span>
                <span>Finish Training</span>
              </>
            ) : (
              <span>Score ≥ 50% to Continue</span>
            )}
          </button>
        </div>

        {/* Enhanced Level Indicator Badge */}
        <div
          className={`absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center ${
            isDarkMode 
              ? "bg-gradient-to-br from-teal-600 to-teal-800" 
              : "bg-gradient-to-br from-teal-400 to-teal-600"
          } text-white font-bold text-lg shadow-lg border-2 ${
            isDarkMode ? "border-teal-900" : "border-teal-300"
          }`}
        >
          Lv.3
        </div>

        {/* Progress Indicator */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gray-900/80 text-xs text-white font-medium">
          {userCorrect}/{totalConditions} complete
        </div>
      </div>
    </div>
  );
};

export default CodeCircuit_SubLevel_3Game;