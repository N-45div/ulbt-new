import { useNavigate } from "react-router-dom";
import { useState, useRef, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { documentText } from "../utils/EmploymentAgreement";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useQuestionType } from "../context/QuestionTypeContext";
import { useQuestionEditContext } from "../context/QuestionEditContext";
import { ThemeContext } from "../context/ThemeContext";
import { useUserAnswers } from "../context/UserAnswersContext";
import parse, { DOMNode, Element } from "html-react-parser";
import PerformanceStar_SubLevel_1Game from "../components/PerformanceStar_SubLevel_1Game";
import CodeCircuit_SubLevel_3Game from "../components/CodeCircuit_SubLevel_3Game";
import { useScore } from "../context/ScoreContext";

// Warning Alert Component
interface WarningAlertProps {
  message: string;
  isVisible: boolean;
  isDarkMode: boolean;
}

const WarningAlert: React.FC<WarningAlertProps> = ({
  message,
  isVisible,
  isDarkMode,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-20 right-6 p-4 rounded-xl shadow-md transition-opacity duration-500 z-50 ${
        isDarkMode
          ? "bg-gradient-to-r from-red-800 to-red-900 border-l-4 border-red-500 text-red-200"
          : "bg-gradient-to-r from-red-100 to-red-200 border-l-4 border-red-400 text-red-800"
      } animate-fadeIn`}
    >
      <p className="font-bold">Warning</p>
      <p className="text-sm">{message}</p>
    </div>
  );
};

// Success Toast Component
interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  isDarkMode: boolean;
}

const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  isVisible,
  isDarkMode,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-md transition-opacity duration-500 z-50 ${
        isDarkMode
          ? "bg-gradient-to-r from-green-800 to-green-900 border-l-4 border-green-500 text-green-200"
          : "bg-gradient-to-r from-green-100 to-green-200 border-l-4 border-green-400 text-green-800"
      } animate-fadeIn`}
    >
      <p className="font-bold">Success</p>
      <p className="text-sm">{message}</p>
    </div>
  );
};

// Certification Popup Component (for Placeholders - Part 1)
interface CertificationPopupProps {
  message: string;
  isVisible: boolean;
  isDarkMode: boolean;
  onContinue: () => void;
  onReplay: () => void;
  score: number;
}

const CertificationPopup: React.FC<CertificationPopupProps> = ({
  isVisible,
  isDarkMode,
  onContinue,
  onReplay,
  score,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <PerformanceStar_SubLevel_1Game
        score={score}
        onRetry={onReplay}
        onContinue={onContinue}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

// Code Circuit Popup Component (for Big Conditions - Part 3)
interface CodeCircuit_SubLevel_3GamePopupProps {
  isVisible: boolean;
  isDarkMode: boolean;
  highlightedTexts: string[];
  userAnswers: { [key: string]: any };
  onContinue: () => void;
  onReplay: () => void;
}

const CodeCircuit_SubLevel_3GamePopup: React.FC<
  CodeCircuit_SubLevel_3GamePopupProps
> = ({
  isVisible,
  isDarkMode,
  highlightedTexts,
  userAnswers,
  onContinue,
  onReplay,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <CodeCircuit_SubLevel_3Game
        highlightedTexts={highlightedTexts}
        userAnswers={userAnswers}
        isDarkMode={isDarkMode}
        onContinue={onContinue}
        onRetry={onReplay}
      />
    </div>
  );
};

const Live_Generation = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { highlightedTexts: originalHighlightedTexts } = useHighlightedText();
  const {
    selectedTypes: originalSelectedTypes,
    editedQuestions: originalEditedQuestions,
    requiredQuestions: originalRequiredQuestions,
  } = useQuestionType();
  const { determineQuestionType, findPlaceholderByValue } =
    useQuestionEditContext();
  const [agreement, setAgreement] = useState<string>(documentText);
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([]);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [additionalLocations, setAdditionalLocations] = useState<string[]>([""]);
  const { userAnswers, setUserAnswers } = useUserAnswers();
  const [highlightedTexts, setHighlightedTexts] = useState<string[]>([]);
  const [selectedTypes, setLocalSelectedTypes] = useState<(string | null)[]>([]);
  const [editedQuestions, setLocalEditedQuestions] = useState<string[]>([]);
  const [requiredQuestions, setLocalRequiredQuestions] = useState<boolean[]>([]);
  const [showCertificationPopup, setShowCertificationPopup] = useState(false);
  const [showCodeCircuit_SubLevel_3GamePopup, setShowCodeCircuit_SubLevel_3GamePopup] = useState(false);
  const [certificationMessage, setCertificationMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { totalScore } = useScore();

  // Load userAnswers from sessionStorage on component mount
  useEffect(() => {
    try {
      const savedAnswers = sessionStorage.getItem("userAnswers");
      if (savedAnswers) {
        const parsedAnswers = JSON.parse(savedAnswers);
        setUserAnswers(parsedAnswers);
      }
    } catch (error) {
      console.error("Error parsing saved userAnswers:", error);
      sessionStorage.removeItem("userAnswers");
      setUserAnswers({});
    }
  }, [setUserAnswers]);

  // Save userAnswers to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    } catch (error) {
      console.error("Error saving userAnswers to sessionStorage:", error);
    }
  }, [userAnswers]);

  // Load and reorder questions
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedOrder = sessionStorage.getItem("questionOrder_2");
      let questionOrder: number[] = [];
      if (savedOrder) {
        questionOrder = JSON.parse(savedOrder);
      } else {
        questionOrder = originalHighlightedTexts.map((_, index) => index);
      }

      const savedTypes = sessionStorage.getItem("selectedQuestionTypes");
      let types: string[] = [];
      if (savedTypes) {
        types = JSON.parse(savedTypes);
      } else {
        types = originalSelectedTypes.map((type) => type ?? "Text");
      }

      const processedTexts = [...originalHighlightedTexts];

      const reorderedHighlightedTexts = questionOrder
        .map((index) => processedTexts[index])
        .filter((text) => text !== undefined);
      const reorderedSelectedTypes = questionOrder
        .map((index) => types[index] ?? "Text")
        .filter((type) => type !== undefined);
      const reorderedEditedQuestions = questionOrder
        .map(
          (index) =>
            originalEditedQuestions[index] ||
            determineQuestionType(processedTexts[index]).primaryValue ||
            "No text selected"
        )
        .filter((text) => text !== undefined);
      const reorderedRequiredQuestions = questionOrder
        .map((index) => originalRequiredQuestions[index] ?? false)
        .filter((req) => req !== undefined);

      console.log("Reordered highlighted texts:", reorderedHighlightedTexts);
      console.log("Reordered selected types:", reorderedSelectedTypes);
      console.log("Reordered edited questions:", reorderedEditedQuestions);
      console.log("Reordered required questions:", reorderedRequiredQuestions);

      setHighlightedTexts(reorderedHighlightedTexts);
      setLocalSelectedTypes(reorderedSelectedTypes);
      setLocalEditedQuestions(reorderedEditedQuestions);
      setLocalRequiredQuestions(reorderedRequiredQuestions);

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error("Error processing questionnaire data:", error);
      setHighlightedTexts([]);
      setLocalSelectedTypes([]);
      setLocalEditedQuestions([]);
      setLocalRequiredQuestions([]);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [
    originalHighlightedTexts,
    originalSelectedTypes,
    originalEditedQuestions,
    originalRequiredQuestions,
    determineQuestionType,
  ]);

  // Map small conditions (enclosed in curly brackets) to their corresponding questions
  const smallConditionsMap: { [key: string]: string } = {
    "Does the employee need to work at additional locations besides the normal place of work?":
      "{/The Employee may be required to work at other locations./}",
    "Is the previous service applicable?":
      '{or, if applicable, "on Previous Employment Start Date with previous continuous service taken into account"}',
    "Is the Employee required to perform additional duties as part of their employment?":
      "{The Employee may be required to perform additional duties as reasonably assigned by the Company.}",
  };

  useEffect(() => {
    let updatedText = documentText;

    // Step 1: Handle small conditions (text in curly brackets) dynamically
    Object.entries(smallConditionsMap).forEach(([question, smallCondition]) => {
      const answer = userAnswers[question];
      const escapedCondition = smallCondition.replace(
        /[.*+?^=!:${}()|\[\]\/\\]/g,
        "\\$&"
      );
      if (answer === false) {
        updatedText = updatedText.replace(
          new RegExp(escapedCondition, "gi"),
          ""
        );
      } else if (answer === true) {
        if (
          smallCondition === "{/The Employee may be required to work at other locations./}"
        ) {
          let conditionContent = smallCondition
            .replace(/^\{\//, "")
            .replace(/\/\}$/, "");
          updatedText = updatedText.replace(
            new RegExp(escapedCondition, "gi"),
            conditionContent
          );
        } else {
          updatedText = updatedText.replace(
            new RegExp(escapedCondition, "gi"),
            smallCondition
              .replace(/^\{/, "")
              .replace(/\}$/, "")
          );
        }
      } else {
        updatedText = updatedText.replace(
          new RegExp(escapedCondition, "gi"),
          `<span class="${
            isDarkMode
              ? "bg-gray-600/70 text-gray-300"
              : "bg-gray-200/70 text-gray-700"
          } px-1 rounded">${smallCondition}</span>`
        );
      }
    });

    // Step 2: Hide probationary clause by default; only show if explicitly true
    const probationAnswer =
      userAnswers["Is the clause of probationary period applicable?"];
    if (probationAnswer !== true) {
      updatedText = updatedText.replace(
        /<h2[^>]*>[^<]*PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i,
        ""
      );
    } else {
      const probationSectionMatch = updatedText.match(
        /<h2[^>]*>[^<]*PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i
      );
      if (!probationSectionMatch) {
        const originalSection = documentText.match(
          /<h2[^>]*>[^<]*PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?(<span[^>]*>\(Optional Clause\)<\/span>)?\s*<\/p>/i
        );
        if (originalSection) {
          updatedText = updatedText.replace(
            /(<h2[^>]*>[^<]*EMPLOYMENT AGREEMENT[^<]*<\/h2>)/i,
            `$1\n${originalSection[0]}`
          );
        }
      }
    }

    // Step 3: Hide pension clause by default; only show if explicitly true
    const pensionAnswer = userAnswers["Is the Pension clause applicable?"];
    if (pensionAnswer !== true) {
      updatedText = updatedText.replace(
        /<h2[^>]*>[^<]*PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?<\/p>/i,
        ""
      );
    } else {
      const pensionSectionMatch = updatedText.match(
        /<h2[^>]*>[^<]*PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?<\/p>/i
      );
      if (!pensionSectionMatch) {
        const originalSection = documentText.match(
          /<h2[^>]*>[^<]*PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?<\/p>/i
        );
        if (originalSection) {
          updatedText = updatedText.replace(
            /(<h2[^>]*>[^<]*EMPLOYMENT AGREEMENT[^<]*<\/h2>)/i,
            `$1\n${originalSection[0]}`
          );
        }
      }
    }

    // Step 4: Handle additional locations formatting
    const additionalLocationsAnswer =
      userAnswers[
        "Does the employee need to work at additional locations besides the normal place of work?"
      ];
    if (additionalLocationsAnswer === true) {
      const locationsAnswer = userAnswers[
        "What is the additional work location?"
      ] as string;
      let formattedLocations = "";
      if (locationsAnswer && locationsAnswer.trim()) {
        const locationsArray = locationsAnswer
          .split(/\s*,\s*|\s*and\s*|\s*, and\s*/)
          .filter(Boolean);
        if (locationsArray.length === 1) {
          formattedLocations = locationsArray[0];
        } else if (locationsArray.length === 2) {
          formattedLocations = locationsArray.join(" and ");
        } else {
          formattedLocations = `${locationsArray
            .slice(0, -1)
            .join(", ")}, and ${locationsArray[locationsArray.length - 1]}`;
        }
      } else {
        formattedLocations = "other locations";
      }
      updatedText = updatedText.replace(
        /other locations/gi,
        `<span class="${
          isDarkMode
            ? "bg-teal-600/70 text-teal-100"
            : "bg-teal-200/70 text-teal-900"
        } px-1 rounded">${formattedLocations}</span>`
      );
    } else {
      updatedText = updatedText.replace(
        /other locations/gi,
        `<span class="${
          isDarkMode
            ? "bg-gray-600/70 text-gray-300"
            : "bg-gray-200/70 text-gray-700"
        } px-1 rounded cursor-pointer hover:bg-gray-500/70" data-question="What is the additional work location?">other locations</span>`
      );
    }

    // Step 5: Handle all placeholders
    Object.entries(userAnswers).forEach(([question, answer]) => {
      const placeholder = findPlaceholderByValue(question);

      if (smallConditionsMap[question]) {
        return;
      }

      if (question === "What's the name of the job title?") {
        const jobTitleAnswer =
          typeof answer === "string" && answer.trim() ? answer : "Job Title";
        updatedText = updatedText.replace(
          /<h2[^>]*>JOB TITLE AND DUTIES<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/,
          (match, p1) => {
            const updatedContent = p1.replace(
              /Job Title/g,
              `<span class="${
                isDarkMode
                  ? "bg-teal-600/70 text-teal-100"
                  : "bg-teal-200/70 text-teal-900"
              } px-1 rounded">${jobTitleAnswer}</span>`
            );
            return match.replace(p1, updatedContent);
          }
        );
        return;
      }

      if (question === "What's the job title of the authorized representative?") {
        const jobTitle =
          typeof answer === "string" && answer.trim()
            ? answer
            : "Job Title of the authorized representative";
        updatedText = updatedText.replace(
          /Job Title of the authorized representative/g,
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${jobTitle}</span>`
        );
        return;
      }

      if (question === "What's the name of the representative?") {
        const repName =
          typeof answer === "string" && answer.trim()
            ? answer
            : "Authorized Representative";
        updatedText = updatedText.replace(
          /Authorized Representative/g,
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${repName}</span>`
        );
        return;
      }

      if (question === "Is the employee entitled to overtime work?") {
        const overtimeYesClause =
          "The Employee is entitled to overtime pay for authorized overtime work.";
        const overtimeNoClause =
          "The Employee shall not receive additional payment for overtime worked.";

        updatedText = updatedText.replace(
          /<p className="mt-5" id="employment-agreement-working-hours">([\s\S]*?)<\/p>/i,
          () => {
            let replacementText = "";
            if (answer === true) {
              replacementText = `${overtimeYesClause}`;
            } else if (answer === false) {
              replacementText = `${overtimeNoClause}`;
            } else {
              replacementText = "The Employee's overtime entitlement will be determined.";
            }
            return `<p className="mt-5" id="employment-agreement-working-hours">${replacementText}</p>`;
          }
        );
        return;
      }

      if (question === "What's the annual salary?") {
        const salaryData = answer as
          | { amount: string; currency: string }
          | undefined;
        updatedText = updatedText.replace(
          /Annual Salary/g,
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${salaryData?.amount || "Annual Salary"}</span>`
        );
        updatedText = updatedText.replace(
          /USD/g,
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${salaryData?.currency || "USD"}</span>`
        );
        return;
      }

      if (question === "What is the governing country?") {
        const countryAnswer =
          typeof answer === "string" && answer.trim() ? answer : "USA";
        updatedText = updatedText.replace(
          /USA/g,
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${countryAnswer}</span>`
        );
        return;
      }

      if (placeholder && placeholder !== "other locations") {
        const escapedPlaceholder = placeholder.replace(
          /[.*+?^=!:${}()|\[\]\/\\]/g,
          "\\$&"
        );
        const displayValue =
          typeof answer === "string" && answer.trim()
            ? answer
            : placeholder;
        updatedText = updatedText.replace(
          new RegExp(escapedPlaceholder, "gi"),
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${displayValue}</span>`
        );
      }
    });

    setAgreement(updatedText);
  }, [userAnswers, isDarkMode, findPlaceholderByValue]);

  const handleInputChange = (
    question: string,
    index: number,
    value: string | boolean
  ) => {
    const newAnswers = { ...userAnswers, [question]: value };
    setUserAnswers(newAnswers);

    if (requiredQuestions[index] && !value) {
      setInputErrors((prev) => ({
        ...prev,
        [question]: "This field is required.",
      }));
    } else {
      setInputErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[question];
        return newErrors;
      });
    }
  };

  const handleAdditionalLocationChange = (index: number, value: string) => {
    const newLocations = [...additionalLocations];
    newLocations[index] = value;
    setAdditionalLocations(newLocations);
    const combinedLocations = newLocations.filter(Boolean).join(", ");
    handleInputChange(
      "What is the additional work location?",
      highlightedTexts.indexOf("other locations"),
      combinedLocations
    );
  };

  const addLocationField = () => {
    setAdditionalLocations([...additionalLocations, ""]);
  };

  const removeLocationField = (index: number) => {
    const newLocations = additionalLocations.filter((_, i) => i !== index);
    setAdditionalLocations(newLocations);
    const combinedLocations = newLocations.filter(Boolean).join(", ");
    handleInputChange(
      "What is the additional work location?",
      highlightedTexts.indexOf("other locations"),
      combinedLocations
    );
  };

  const handleSubmit = () => {
    const hasErrors = editedQuestions.some((question, index) => {
      if (requiredQuestions[index] && !userAnswers[question]) {
        setInputErrors((prev) => ({
          ...prev,
          [question]: "This field is required.",
        }));
        const inputElement = inputRefs.current[index];
        const questionElement = questionRefs.current[index];
        if (inputElement) {
          inputElement.focus();
        } else if (questionElement) {
          questionElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return true;
      }
      return false;
    });

    if (hasErrors) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
      return;
    }

    const selectedPart = localStorage.getItem("selectedPart");
    if (selectedPart === "1") {
      setCertificationMessage("You've completed Level 1: Automate Placeholders!");
      setCalculatedScore(totalScore);
      setShowCertificationPopup(true);
    } else if (selectedPart === "3") {
      setShowCodeCircuit_SubLevel_3GamePopup(true);
    } else {
      navigate("/Level-Two-Part-Two");
    }
  };

  const handleReplay = () => {
    setShowCertificationPopup(false);
    setShowCodeCircuit_SubLevel_3GamePopup(false);
    navigate("/Level-Two-Part-Two");
  };

  const handleContinue = () => {
    setShowCertificationPopup(false);
    setShowCodeCircuit_SubLevel_3GamePopup(false);
    navigate("/Level-Two-Part-Two");
  };

  const renderInputField = (question: string, type: string, index: number) => {
    const commonClasses = `w-full p-2 rounded-lg transition-all duration-300 ${
      isDarkMode
        ? "bg-gray-700 text-teal-200 border-teal-400 focus:border-cyan-400"
        : "bg-white text-teal-900 border-teal-400 focus:border-cyan-500"
    } ${inputErrors[question] ? "border-red-500" : "border"}`;

    if (type === "Radio") {
      return (
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={question}
              value="true"
              checked={userAnswers[question] === true}
              onChange={() => handleInputChange(question, index, true)}
              className="text-teal-500 focus:ring-teal-400"
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
            />
            <span
              className={isDarkMode ? "text-teal-200" : "text-teal-900"}
            >
              Yes
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={question}
              value="false"
              checked={userAnswers[question] === false}
              onChange={() => handleInputChange(question, index, false)}
              className="text-teal-500 focus:ring-teal-400"
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
            />
            <span
              className={isDarkMode ? "text-teal-200" : "text-teal-900"}
            >
              No
            </span>
          </label>
        </div>
      );
    }

    if (type === "Date") {
      return (
        <input
          type="date"
          value={
            typeof userAnswers[question] === "string"
              ? userAnswers[question]
              : ""
          }
          onChange={(e) => handleInputChange(question, index, e.target.value)}
          className={commonClasses}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
        />
      );
    }

    if (type === "Paragraph") {
      return (
        <textarea
          value={
            typeof userAnswers[question] === "string"
              ? userAnswers[question]
              : ""
          }
          onChange={(e) => handleInputChange(question, index, e.target.value)}
          className={`${commonClasses} h-24 resize-none`}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
        />
      );
    }

    if (type === "Number") {
      return (
        <input
          type="number"
          value={
            typeof userAnswers[question] === "string"
              ? userAnswers[question]
              : ""
          }
          onChange={(e) => handleInputChange(question, index, e.target.value)}
          className={commonClasses}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
        />
      );
    }

    return (
      <input
        type="text"
        value={
          typeof userAnswers[question] === "string"
            ? userAnswers[question]
            : ""
        }
        onChange={(e) => handleInputChange(question, index, e.target.value)}
        className={commonClasses}
        ref={(el) => {
          inputRefs.current[index] = el;
        }}
      />
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans relative transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      <Navbar
        level={localStorage.getItem("selectedPart") === "4" ? "/Level-Two-Part-Two-Demo" : "/Level-Two-Part-Two"}
        questionnaire="/Questionnaire"
        live_generation="/Live_Generation"
      />
      <div className="fixed bottom-6 left-14 transform -translate-x-1/2 z-50 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
        >
          Back
        </button>
        <button
          onClick={() => {
            sessionStorage.clear();
            setUserAnswers({});
            setAdditionalLocations([""]);
            setInputErrors({});
            navigate("/Level-Two-Part-Two");
          }}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-red-700 text-teal-200 hover:bg-red-600"
              : "bg-red-200 text-teal-900 hover:bg-red-300"
          }`}
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-teal-700 text-teal-200 hover:bg-teal-600"
              : "bg-teal-600 text-white hover:bg-teal-500"
          }`}
        >
          Submit
        </button>
      </div>

      <div className="fixed top-16 left-6 z-50 px-6 py-3">
        <div
          className={`p-3 rounded-full shadow-lg flex items-center ${
            isDarkMode ? "bg-gray-700 text-white" : "bg-teal-500 text-white"
          }`}
        >
          <span className="font-bold mr-2">Score:</span> {totalScore}
        </div>
      </div>

      <WarningAlert
        message="Please fill in all required fields."
        isVisible={showWarning}
        isDarkMode={isDarkMode}
      />
      <SuccessToast
        message="Questionnaire loaded successfully!"
        isVisible={showSuccessToast}
        isDarkMode={isDarkMode}
      />
      <CertificationPopup
        message={certificationMessage}
        isVisible={showCertificationPopup}
        isDarkMode={isDarkMode}
        onContinue={handleContinue}
        onReplay={handleReplay}
        score={calculatedScore}
      />
      <CodeCircuit_SubLevel_3GamePopup
        isVisible={showCodeCircuit_SubLevel_3GamePopup}
        isDarkMode={isDarkMode}
        highlightedTexts={highlightedTexts}
        userAnswers={userAnswers}
        onContinue={handleContinue}
        onReplay={handleReplay}
      />

      <div className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-y-auto">
        <div className="w-full max-w-4xl space-y-12">
          {isLoading ? (
            <div
              className={`text-center py-12 rounded-xl shadow-lg border ${
                isDarkMode
                  ? "bg-gray-800/80 backdrop-blur-sm border-gray-700/20"
                  : "bg-white/80 backdrop-blur-sm border-teal-100/20"
              }`}
            >
              <p
                className={`text-lg font-medium ${
                  isDarkMode ? "text-teal-300" : "text-teal-700"
                }`}
              >
                Loading...
              </p>
            </div>
          ) : (
            <>
              <div
                className={`rounded-xl shadow-lg p-6 ${
                  isDarkMode
                    ? "bg-gray-800/80 text-teal-200"
                    : "bg-white/80 text-teal-900"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Generated Document
                </h2>
                <div className="prose max-w-none">
                  {parse(agreement, {
                    replace: (domNode: DOMNode) => {
                      if (
                        domNode instanceof Element &&
                        domNode.attribs &&
                        domNode.attribs["data-question"]
                      ) {
                        const question = domNode.attribs["data-question"];
                        const index = editedQuestions.indexOf(question);
                        if (index !== -1) {
                          return (
                            <span
                              onClick={() => {
                                const inputElement = inputRefs.current[index];
                                const questionElement =
                                  questionRefs.current[index];
                                if (inputElement) {
                                  inputElement.focus();
                                } else if (questionElement) {
                                  questionElement.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                }
                              }}
                              className={`${
                                isDarkMode
                                  ? "bg-gray-600/70 text-gray-300"
                                  : "bg-gray-200/70 text-gray-700"
                              } px-1 rounded cursor-pointer hover:bg-gray-500/70`}
                            >
                              {domNode.children
                                .map((child) =>
                                  child.type === "text" ? child.data : ""
                                )
                                .join("")}
                            </span>
                          );
                        }
                      }
                      return domNode;
                    },
                  })}
                </div>
              </div>

              <div
                className={`rounded-xl shadow-lg p-6 ${
                  isDarkMode
                    ? "bg-gray-800/80 text-teal-200"
                    : "bg-white/80 text-teal-900"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Answer the Questions
                </h2>
                <div className="space-y-6">
                  {editedQuestions.map((question, index) => {
                    const type = selectedTypes[index] ?? "Text";
                    const isFollowUp =
                      question === "What is the additional work location?" &&
                      editedQuestions.includes(
                        "Does the employee need to work at additional locations besides the normal place of work?"
                      );
                    const showFollowUp =
                      isFollowUp &&
                      userAnswers[
                        "Does the employee need to work at additional locations besides the normal place of work?"
                      ] === true;

                    if (isFollowUp && !showFollowUp) {
                      return null;
                    }

                    return (
                      <div
                        key={question}
                        className="space-y-2"
                        ref={(el) => {
                          questionRefs.current[index] = el;
                        }}
                      >
                        <label className="block text-sm font-medium">
                          {question}{" "}
                          {requiredQuestions[index] && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {question ===
                        "What is the additional work location?" ? (
                          <div className="space-y-2">
                            {additionalLocations.map((location, locIndex) => (
                              <div
                                key={locIndex}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="text"
                                  value={location}
                                  onChange={(e) =>
                                    handleAdditionalLocationChange(
                                      locIndex,
                                      e.target.value
                                    )
                                  }
                                  className={`flex-1 p-2 rounded-lg transition-all duration-300 ${
                                    isDarkMode
                                      ? "bg-gray-700 text-teal-200 border-teal-400 focus:border-cyan-400"
                                      : "bg-white text-teal-900 border-teal-400 focus:border-cyan-500"
                                  } ${
                                    inputErrors[question]
                                      ? "border-red-500"
                                      : "border"
                                  }`}
                                />
                                {additionalLocations.length > 1 && (
                                  <button
                                    onClick={() =>
                                      removeLocationField(locIndex)
                                    }
                                    className={`p-2 rounded-full ${
                                      isDarkMode
                                        ? "bg-red-700 text-teal-200 hover:bg-red-600"
                                        : "bg-red-200 text-teal-900 hover:bg-red-300"
                                    }`}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={addLocationField}
                              className={`text-sm underline ${
                                isDarkMode
                                  ? "text-teal-400 hover:text-teal-300"
                                  : "text-teal-600 hover:text-teal-500"
                              }`}
                            >
                              Add another location
                            </button>
                          </div>
                        ) : (
                          renderInputField(question, type, index)
                        )}
                        {inputErrors[question] && (
                          <p className="text-red-500 text-sm">
                            {inputErrors[question]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Live_Generation;
