import { useNavigate } from "react-router-dom";
import { useState, useRef, useCallback, useContext, useEffect } from "react";
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
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>(
    []
  );
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [additionalLocations, setAdditionalLocations] = useState<string[]>([
    "",
  ]);
  const { userAnswers, setUserAnswers } = useUserAnswers();
  const [highlightedTexts, setHighlightedTexts] = useState<string[]>([]);
  const [selectedTypes, setLocalSelectedTypes] = useState<(string | null)[]>(
    []
  );
  const [editedQuestions, setLocalEditedQuestions] = useState<string[]>([]);
  const [requiredQuestions, setLocalRequiredQuestions] = useState<boolean[]>(
    []
  );
  const [showCertificationPopup, setShowCertificationPopup] = useState(false);
  const [
    showCodeCircuit_SubLevel_3GamePopup,
    setShowCodeCircuit_SubLevel_3GamePopup,
  ] = useState(false);
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
      sessionStorage.removeItem("userAnswers"); // Clear invalid data
      setUserAnswers({}); // Reset to empty object
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

      if (placeholder === "Unused Holiday Days" && typeof answer === "string") {
        const storedOperationType = localStorage.getItem("operationType");
        const storedOperationValue = localStorage.getItem("operationValue");
        const operationValue = storedOperationValue
          ? parseFloat(storedOperationValue)
          : null;
        let calculatedValue: number | null = null;
        const floatAnswer = parseFloat(answer).toFixed(2);
        const numericAnswer = parseFloat(floatAnswer);
        if (storedOperationType && operationValue !== null) {
          switch (storedOperationType.toLowerCase()) {
            case "add":
              calculatedValue = numericAnswer + operationValue;
              break;
            case "subtract":
              calculatedValue = numericAnswer - operationValue;
              break;
            case "multiply":
              calculatedValue = numericAnswer * operationValue;
              break;
            case "divide":
              calculatedValue =
                operationValue !== 0 ? numericAnswer / operationValue : null;
              break;
            default:
              calculatedValue = null;
          }
        }
        localStorage.setItem(
          "calculatedValue",
          calculatedValue !== null ? String(calculatedValue) : "0"
        );

        updatedText = updatedText.replace(
          new RegExp("Holiday Pay", "gi"),
          `<span class="${
            isDarkMode
              ? "bg-teal-600/70 text-teal-100"
              : "bg-teal-200/70 text-teal-900"
          } px-1 rounded">${calculatedValue !== null ? calculatedValue : "Holiday Pay"}</span>`
        );
      }

      if (placeholder) {
        const escapedPlaceholder = placeholder.replace(
          /[.*+?^=!:${}()|\[\]\/\\]/g,
          "\\$&"
        );
        if (question === "What's the annual salary?") {
          const salaryData = answer as
            | { amount: string; currency: string }
            | undefined;
          updatedText = updatedText.replace(
            new RegExp(`${escapedPlaceholder}`, "gi"),
            `<span class="${
              isDarkMode
                ? "bg-teal-600/70 text-teal-100"
                : "bg-teal-200/70 text-teal-900"
            } px-1 rounded">${salaryData?.amount || "Annual Salary"}</span>`
          );
          updatedText = updatedText.replace(
            new RegExp(`USD`, "gi"),
            `<span class="${
              isDarkMode
                ? "bg-teal-600/70 text-teal-100"
                : "bg-teal-200/70 text-teal-900"
            } px-1 rounded">${salaryData?.currency || "USD"}</span>`
          );
        } else if (question === "What is the governing country?") {
          const countryAnswer =
            typeof answer === "string" && answer.trim() ? answer : "USA";
          updatedText = updatedText.replace(
            new RegExp(`USA`, "gi"),
            `<span class="${
              isDarkMode
                ? "bg-teal-600/70 text-teal-100"
                : "bg-teal-200/70 text-teal-900"
            } px-1 rounded">${countryAnswer}</span>`
          );
        } else if (placeholder === "Job Title") {
          return;
        } else if (typeof answer === "boolean" || answer === null) {
          if (!answer && placeholder !== "other locations") {
            updatedText = updatedText.replace(
              new RegExp(`.*${escapedPlaceholder}.*`, "gi"),
              ""
            );
          } else if (answer === null) {
            updatedText = updatedText.replace(
              new RegExp(`${escapedPlaceholder}`, "gi"),
              `<span class="${
                isDarkMode
                  ? "bg-gray-600/70 text-gray-300"
                  : "bg-gray-200/70 text-gray-700"
              } px-1 rounded cursor-pointer hover:bg-gray-500/70" data-question="${question}">${placeholder}</span>`
            );
          } else {
            updatedText = updatedText.replace(
              new RegExp(`${escapedPlaceholder}`, "gi"),
              `<span class="${
                isDarkMode
                  ? "bg-teal-600/70 text-teal-100"
                  : "bg-teal-200/70 text-teal-900"
              } px-1 rounded">${answer ? "Yes" : "No"}</span>`
            );
          }
        } else if (
          typeof answer === "string" &&
          answer.trim() &&
          question !== "What is the additional work location?"
        ) {
          updatedText = updatedText.replace(
            new RegExp(`${escapedPlaceholder}`, "gi"),
            `<span class="${
              isDarkMode
                ? "bg-teal-600/70 text-teal-100"
                : "bg-teal-200/70 text-teal-900"
            } px-1 rounded">${answer}</span>`
          );
        } else if (question !== "What is the additional work location?") {
          updatedText = updatedText.replace(
            new RegExp(`${escapedPlaceholder}`, "gi"),
            `<span class="${
              isDarkMode
                ? "bg-gray-600/70 text-gray-300"
                : "bg-gray-200/70 text-gray-700"
              } px-1 rounded cursor-pointer hover:bg-gray-500/70" data-question="${question}">${placeholder}</span>`
          );
        }
      } else {
        if (question === "Is the sick pay policy applicable?") {
          const sickPayClause =
            "The Employee may also be entitled to Company sick pay of Details of Company Sick Pay Policy";
          if (answer === false) {
            updatedText = updatedText.replace(sickPayClause, "");
          } else if (
            answer === true &&
            userAnswers["What's the sick pay policy?"]
          ) {
            updatedText = updatedText.replace(
              "Details of Company Sick Pay Policy",
              `<span class="${
                isDarkMode
                  ? "bg-teal-600/70 text-teal-100"
                  : "bg-teal-200/70 text-teal-900"
              } px-1 rounded">${
                userAnswers["What's the sick pay policy?"] as string
              }</span>`
            );
          } else {
            updatedText = updatedText.replace(
              "Details of Company Sick Pay Policy",
              `<span class="${
                isDarkMode
                  ? "bg-gray-600/70 text-gray-300"
                  : "bg-gray-200/70 text-gray-700"
              } px-1 rounded cursor-pointer hover:bg-gray-500/70" data-question="What's the sick pay policy?">Details of Company Sick Pay Policy</span>`
            );
          }
        } else if (question === "Is the termination clause applicable?") {
          if (answer === false) {
            const terminationSection = updatedText.match(
              /<h2[^>]*>TERMINATION CLAUSE<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/i
            );
            if (terminationSection) {
              const sectionWithoutClause = terminationSection[0].replace(
                /After the probationary period.*?gross misconduct\./,
                ""
              );
              updatedText = updatedText.replace(
                terminationSection[0],
                sectionWithoutClause
              );
            }
          } else if (
            answer === true &&
            userAnswers["What's the notice period?"]
          ) {
            updatedText = updatedText.replace(
              /Notice Period/gi,
              `<span class="${
                isDarkMode
                  ? "bg-teal-600/70 text-teal-100"
                  : "bg-teal-200/70 text-teal-900"
              } px-1 rounded">${
                userAnswers["What's the notice period?"] as string
              }</span>`
            );
          } else {
            updatedText = updatedText.replace(
              /Notice Period/gi,
              `<span class="${
                isDarkMode
                  ? "bg-gray-600/70 text-gray-300"
                  : "bg-gray-200/70 text-gray-700"
              } px-1 rounded cursor-pointer hover:bg-gray-500/70" data-question="What's the notice period?">Notice Period</span>`
            );
          }
        }
      }
    });

    const employerNameAnswer = userAnswers["Employer Name"] as string;
    if (employerNameAnswer && employerNameAnswer.trim()) {
      updatedText = updatedText.replace(
        /\[Employer Name\]/gi,
        `<span class="${
          isDarkMode
            ? "bg-teal-600/70 text-teal-100"
            : "bg-teal-200/70 text-teal-900"
        } px-1 rounded">${employerNameAnswer}</span>`
      );
    } else {
      updatedText = updatedText.replace(
        /\[Employer Name\]/gi,
        `<span class="${
          isDarkMode
            ? "bg-gray-600/70 text-gray-300"
            : "bg-gray-200/70 text-gray-700"
        } px-1 rounded cursor-pointer hover:bg-gray-500/70" data-question="Employer Name">[Employer Name]</span>`
      );
    }

    setAgreement(updatedText + " ");
  }, [userAnswers, isDarkMode, findPlaceholderByValue]);

  const validateInput = (type: string, value: string): string => {
    if (!value) return "";
    switch (type) {
      case "Number":
        if (!/^\d*\.?\d*$/.test(value)) {
          return "Please enter a valid number.";
        }
        break;
      case "Date":
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return "Please enter a valid date in YYYY-MM-DD format.";
        }
        break;
      case "Email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address.";
        }
        break;
      case "Text":
      case "Paragraph":
        break;
      default:
        break;
    }
    return "";
  };

  const handleAnswerChange = useCallback(
    (
      index: number,
      value: string | boolean | { amount: string; currency: string },
      followUpQuestion?: string,
      isAdditional?: boolean,
      locationIndex?: number
    ) => {
      const question = editedQuestions[index] || "";
      if (!question) return;

      const currentType = selectedTypes[index] || "Text";

      if (
        typeof value === "string" &&
        currentType !== "Radio" &&
        question !== "What's the annual salary?"
      ) {
        const error = validateInput(currentType, value);
        setInputErrors((prev) => ({
          ...prev,
          [question]: error,
        }));
      }

      if (isAdditional && locationIndex !== undefined) {
        setAdditionalLocations((prev) => {
          const updated = [...prev];
          updated[locationIndex] = value as string;
          const locations = updated.filter(Boolean);
          const formattedLocations =
            locations.length === 1
              ? locations[0]
              : locations.length === 2
              ? locations.join(" and ")
              : `${locations.slice(0, -1).join(", ")}, and ${
                  locations[locations.length - 1]
                }`;
          setUserAnswers((prevAnswers) => ({
            ...prevAnswers,
            [question]: formattedLocations,
          }));
          return updated;
        });
      } else {
        setUserAnswers((prev) => {
          const newAnswers = {
            ...prev,
            [question]: value,
          };
          if (followUpQuestion && value === true) {
            newAnswers[followUpQuestion] = "";
          } else if (followUpQuestion && value === false) {
            newAnswers[followUpQuestion] = "";
            if (followUpQuestion === "What is the additional work location?") {
              setAdditionalLocations([""]);
            }
          }
          return newAnswers;
        });
      }
    },
    [editedQuestions, selectedTypes, setUserAnswers]
  );

  const handleAddMore = () => {
    setAdditionalLocations((prev) => [...prev, ""]);
  };

  const handlePlaceholderClick = (question: string) => {
    const index = editedQuestions.indexOf(question);
    if (index !== -1 && questionRefs.current[index]) {
      questionRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // Highlight the question briefly
      const element = questionRefs.current[index];
      if (element) {
        element.classList.add("highlight");
      }
    }
  };

  const renderAnswerInput = (index: number) => {
    const question = editedQuestions[index] || "";
    if (!question) return null;

    const currentType = selectedTypes[index] || "Text";
    const answer =
      userAnswers[question] !== undefined
        ? userAnswers[question]
        : currentType === "Radio"
        ? null
        : "";
    const error = inputErrors[question] || "";
    const isRequired = requiredQuestions[index] || false;

    if (
      question ===
      "Does the employee need to work at additional locations besides the normal place of work?"
    ) {
      return (
        <div
          key={index}
          ref={(el) => (questionRefs.current[index] = el)}
          className="mb-12"
        >
          <div className="flex items-center space-x-2 mb-2">
            <p
              className={`text-sm font-semibold ${
                isDarkMode ? "text-teal-400" : "text-teal-600"
              }`}
            >
              Type: {currentType}
            </p>
          </div>
          <p
            className={`text-lg font-medium ${
              isDarkMode ? "text-teal-200" : "text-teal-900"
            }`}
          >
            {question}
            {isRequired && <span className="text-red-500 ml-2">*</span>}
          </p>
          <div className="mt-4 flex space-x-6">
            <label
              className={`flex items-center space-x-2 cursor-pointer ${
                isDarkMode ? "text-teal-300" : "text-teal-700"
              }`}
            >
              <input
                type="radio"
                name={`additional-locations-${index}`}
                checked={answer === true}
                onChange={() =>
                  handleAnswerChange(
                    index,
                    true,
                    "What is the additional work location?"
                  )
                }
                className={`cursor-pointer ${
                  isDarkMode
                    ? "text-teal-500 focus:ring-teal-400"
                    : "text-teal-600 focus:ring-teal-500"
                }`}
                required={isRequired}
              />
              <span>Yes</span>
            </label>
            <label
              className={`flex items-center space-x-2 cursor-pointer ${
                isDarkMode ? "text-teal-300" : "text-teal-700"
              }`}
            >
              <input
                type="radio"
                name={`additional-locations-${index}`}
                checked={answer === false}
                onChange={() => handleAnswerChange(index, false)}
                className={`cursor-pointer ${
                  isDarkMode
                    ? "text-teal-500 focus:ring-teal-400"
                    : "text-teal-600 focus:ring-teal-500"
                }`}
                required={isRequired}
              />
              <span>No</span>
            </label>
          </div>
          {answer === true &&
            editedQuestions.some(
              (q) => q === "What is the additional work location?"
            ) && (
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <p
                    className={`text-sm font-semibold ${
                      isDarkMode ? "text-teal-400" : "text-teal-600"
                    }`}
                  >
                    Type: Text
                  </p>
                </div>
                <p
                  className={`text-lg font-medium ${
                    isDarkMode ? "text-teal-200" : "text-teal-900"
                  }`}
                >
                  What is the additional work location?
                  {isRequired && <span className="text-red-500 ml-2">*</span>}
                </p>
                {additionalLocations.map((location, locIndex) => (
                  <div key={locIndex} className="mt-4">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) =>
                        handleAnswerChange(
                          editedQuestions.indexOf(
                            "What is the additional work location?"
                          ),
                          e.target.value,
                          undefined,
                          true,
                          locIndex
                        )
                      }
                      className={`p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                        isDarkMode
                          ? `bg-gray-700/80 border ${
                              error ? "border-red-400" : "border-teal-600"
                            } focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                          : `bg-white/80 border ${
                              error ? "border-red-400" : "border-teal-200"
                            } focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                      }`}
                      placeholder={`Enter additional location ${locIndex + 1}`}
                      required={isRequired}
                    />
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <button
                    className={`px-6 py-3 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                        : "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500"
                    }`}
                    onClick={handleAddMore}
                  >
                    Add More Locations
                  </button>
                </div>
              </div>
            )}
        </div>
      );
    }

    if (question === "What's the annual salary?") {
      const answerWithCurrency =
        typeof answer === "object" &&
        answer !== null &&
        "amount" in answer &&
        "currency" in answer
          ? (answer as { amount: string; currency: string })
          : { amount: "", currency: "USD" };

      return (
        <div
          key={index}
          ref={(el) => (questionRefs.current[index] = el)}
          className="mb-12"
        >
          <div className="flex items-center space-x-2 mb-2">
            <p
              className={`text-sm font-semibold ${
                isDarkMode ? "text-teal-400" : "text-teal-600"
              }`}
            >
              Type: {currentType}
            </p>
          </div>
          <div className="w-full">
            <p
              className={`text-lg font-medium ${
                isDarkMode ? "text-teal-200" : "text-teal-900"
              }`}
            >
              {question}
              {isRequired && <span className="text-red-500 ml-2">*</span>}
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <input
                type="number"
                value={answerWithCurrency.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  const error = validateInput("Number", value);
                  setInputErrors((prev) => ({
                    ...prev,
                    [question]: error,
                  }));
                  const currentAnswer = userAnswers[question];
                  const currentCurrency =
                    typeof currentAnswer === "object" &&
                    currentAnswer !== null &&
                    "currency" in currentAnswer
                      ? (currentAnswer as { amount: string; currency: string })
                          .currency
                      : "USD";
                  handleAnswerChange(index, {
                    amount: value,
                    currency: currentCurrency,
                  });
                }}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                className={`p-3 w-1/2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${
                        error ? "border-red-400" : "border-teal-600"
                      } focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${
                        error ? "border-red-400" : "border-teal-200"
                      } focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter amount"
                required={isRequired}
              />
              <select
                value={answerWithCurrency.currency}
                onChange={(e) => {
                  handleAnswerChange(index, {
                    amount: answerWithCurrency.amount,
                    currency: e.target.value,
                  });
                }}
                className={`p-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-700/80 border border-teal-600 focus:ring-teal-400 text-teal-200"
                    : "bg-white/80 border border-teal-200 focus:ring-teal-500 text-teal-800"
                }`}
                required={isRequired}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="SEK">SEK</option>
                <option value="AUD">AUD</option>
                <option value="JPY">JPY</option>
                <option value="CAD">CAD</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      );
    }

    if (question === "What is the additional work location?") {
      return null;
    }

    return (
      <div
        key={index}
        ref={(el) => (questionRefs.current[index] = el)}
        className="mb-12"
      >
        <div className="flex items-center space-x-2 mb-2">
          <p
            className={`text-sm font-semibold ${
              isDarkMode ? "text-teal-400" : "text-teal-600"
            }`}
          >
            Type: {currentType}
          </p>
        </div>
        <div className="w-full">
          <p
            className={`text-lg font-medium ${
              isDarkMode ? "text-teal-200" : "text-teal-900"
            }`}
          >
            {question}
            {isRequired && <span className="text-red-500 ml-2">*</span>}
          </p>
          {currentType === "Radio" ? (
            question === "Is the sick pay policy applicable?" ? (
              <>
                <div className="mt-4 flex space-x-6">
                  <label
                    className={`flex items-center space-x-2 cursor-pointer ${
                      isDarkMode ? "text-teal-300" : "text-teal-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`sick-pay-${index}`}
                      checked={answer === true}
                      onChange={() =>
                        handleAnswerChange(
                          index,
                          true,
                          "What's the sick pay policy?"
                        )
                      }
                      className={`cursor-pointer ${
                        isDarkMode
                          ? "text-teal-500 focus:ring-teal-400"
                          : "text-teal-600 focus:ring-teal-500"
                      }`}
                      required={isRequired}
                    />
                    <span>Yes</span>
                  </label>
                  <label
                    className={`flex items-center space-x-2 cursor-pointer ${
                      isDarkMode ? "text-teal-300" : "text-teal-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`sick-pay-${index}`}
                      checked={answer === false}
                      onChange={() => handleAnswerChange(index, false)}
                      className={`cursor-pointer ${
                        isDarkMode
                          ? "text-teal-500 focus:ring-teal-400"
                          : "text-teal-600 focus:ring-teal-500"
                      }`}
                      required={isRequired}
                    />
                    <span>No</span>
                  </label>
                </div>
                {answer === true && (
                  <div className="mt-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <p
                        className={`text-sm font-semibold ${
                          isDarkMode ? "text-teal-400" : "text-teal-600"
                        }`}
                      >
                        Type: Text
                      </p>
                    </div>
                    <input
                      type="text"
                      value={
                        (userAnswers["What's the sick pay policy?"] as string) ||
                        ""
                      }
                      onChange={(e) =>
                        setUserAnswers((prev) => ({
                          ...prev,
                          "What's the sick pay policy?": e.target.value,
                        }))
                      }
                      className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                        isDarkMode
                          ? "bg-gray-700/80 border border-teal-600 focus:ring-teal-400 text-teal-200 placeholder-teal-300/70"
                          : "bg-white/80 border border-teal-200 focus:ring-teal-500 text-teal-800 placeholder-teal-400/70"
                      }`}
                      placeholder="What's the sick pay policy?"
                      required={isRequired}
                    />
                  </div>
                )}
              </>
            ) : question === "Is the termination clause applicable?" ? (
              <>
                <div className="mt-4 flex space-x-6">
                  <label
                    className={`flex items-center space-x-2 cursor-pointer ${
                      isDarkMode ? "text-teal-300" : "text-teal-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`termination-${index}`}
                      checked={answer === true}
                      onChange={() =>
                        handleAnswerChange(
                          index,
                          true,
                          "What's the notice period?"
                        )
                      }
                      className={`cursor-pointer ${
                        isDarkMode
                          ? "text-teal-500 focus:ring-teal-400"
                          : "text-teal-600 focus:ring-teal-500"
                      }`}
                      required={isRequired}
                    />
                    <span>Yes</span>
                  </label>
                  <label
                    className={`flex items-center space-x-2 cursor-pointer ${
                      isDarkMode ? "text-teal-300" : "text-teal-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`termination-${index}`}
                      checked={answer === false}
                      onChange={() => handleAnswerChange(index, false)}
                      className={`cursor-pointer ${
                        isDarkMode
                          ? "text-teal-500 focus:ring-teal-400"
                          : "text-teal-600 focus:ring-teal-500"
                      }`}
                      required={isRequired}
                    />
                    <span>No</span>
                  </label>
                </div>
                {answer === true && (
                  <div className="mt-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <p
                        className={`text-sm font-semibold ${
                          isDarkMode ? "text-teal-400" : "text-teal-600"
                        }`}
                      >
                        Type: Text
                      </p>
                    </div>
                    <input
                      type="text"
                      value={
                        (userAnswers["What's the notice period?"] as string) || ""
                      }
                      onChange={(e) =>
                        setUserAnswers((prev) => ({
                          ...prev,
                          "What's the notice period?": e.target.value,
                        }))
                      }
                      className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                        isDarkMode
                          ? "bg-gray-700/80 border border-teal-600 focus:ring-teal-400 text-teal-200 placeholder-teal-300/70"
                          : "bg-white/80 border border-teal-200 focus:ring-teal-500 text-teal-800 placeholder-teal-400/70"
                      }`}
                      placeholder="What's the notice period?"
                      required={isRequired}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 flex space-x-6">
                <label
                  className={`flex items-center space-x-2 cursor-pointer ${
                    isDarkMode ? "text-teal-300" : "text-teal-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={`radio-${index}`}
                    checked={answer === true}
                    onChange={() => handleAnswerChange(index, true)}
                    className={`cursor-pointer ${
                      isDarkMode
                        ? "text-teal-500 focus:ring-teal-400"
                        : "text-teal-600 focus:ring-teal-500"
                    }`}
                    required={isRequired}
                  />
                  <span>Yes</span>
                </label>
                <label
                  className={`flex items-center space-x-2 cursor-pointer ${
                    isDarkMode ? "text-teal-300" : "text-teal-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={`radio-${index}`}
                    checked={answer === false}
                    onChange={() => handleAnswerChange(index, false)}
                    className={`cursor-pointer ${
                      isDarkMode
                        ? "text-teal-500 focus:ring-teal-400"
                        : "text-teal-600 focus:ring-teal-500"
                    }`}
                    required={isRequired}
                  />
                  <span>No</span>
                </label>
              </div>
            )
          ) : currentType === "Number" ? (
            <>
              <input
                ref={(el) => {
                  if (el) inputRefs.current[index] = el as HTMLInputElement;
                }}
                type="number"
                value={(userAnswers[question] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${
                        error ? "border-red-400" : "border-teal-600"
                      } focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${
                        error ? "border-red-400" : "border-teal-200"
                      } focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter a number"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Date" ? (
            <>
              <input
                ref={(el) => {
                  if (el) inputRefs.current[index] = el as HTMLInputElement;
                }}
                type="date"
                value={(userAnswers[question] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${
                        error ? "border-red-400" : "border-teal-600"
                      } focus:ring-teal-400 text-teal-200`
                    : `bg-white/80 border ${
                        error ? "border-red-400" : "border-teal-200"
                      } focus:ring-teal-500 text-teal-800`
                }`}
                placeholder="Select a date"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Email" ? (
            <>
              <input
                ref={(el) => {
                  if (el) inputRefs.current[index] = el as HTMLInputElement;
                }}
                type="email"
                value={(userAnswers[question] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${
                        error ? "border-red-400" : "border-teal-600"
                      } focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${
                        error ? "border-red-400" : "border-teal-200"
                      } focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter an email address"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Paragraph" ? (
            <>
              <textarea
                ref={(el) => {
                  if (el) inputRefs.current[index] = el as HTMLTextAreaElement;
                }}
                value={(userAnswers[question] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${
                        error ? "border-red-400" : "border-teal-600"
                      } focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${
                        error ? "border-red-400" : "border-teal-200"
                      } focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter your answer"
                rows={3}
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : (
            <>
              <input
                ref={(el) => {
                  if (el) inputRefs.current[index] = el as HTMLInputElement;
                }}
                type="text"
                value={(userAnswers[question] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${
                        error ? "border-red-400" : "border-teal-600"
                      } focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${
                        error ? "border-red-400" : "border-teal-200"
                      } focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter your answer"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          )}
        </div>
      </div>
    );
  };

  const handleContinueToDocument = () => {
    setShowCertificationPopup(false);
    navigate("/Finish", { state: { userAnswers } });
  };

  const handleFinishCodeCircuit_SubLevel_3Game = () => {
    setShowCodeCircuit_SubLevel_3GamePopup(false);
    navigate("/Finish", { state: { userAnswers } });
  };

  const handleFinish = () => {
    const hasErrors = Object.values(inputErrors).some((error) => error !== "");
    if (hasErrors) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
      return;
    }

    const unansweredRequiredFields = editedQuestions
      .map((question, index) => {
        const isRequired = requiredQuestions[index] || false;
        if (!question || !isRequired) return null;

        const answer = userAnswers[question];
        if (
          answer === null ||
          answer === "" ||
          (typeof answer === "object" &&
            answer !== null &&
            (!answer.amount || !answer.currency))
        ) {
          return question;
        }
        return null;
      })
      .filter(Boolean);

    if (unansweredRequiredFields.length > 0) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
      return;
    }

    const totalQuestions = highlightedTexts.length;
    let correctAnswers = 0;

    editedQuestions.forEach((question) => {
      const answer = userAnswers[question];
      if (
        answer !== null &&
        answer !== "" &&
        !(
          typeof answer === "object" &&
          answer !== null &&
          (!answer.amount || !answer.currency))
      ) {
        correctAnswers += 1;
      }
    });

    const calculatedScore = correctAnswers;
    setCalculatedScore(calculatedScore);

    let message = "";
    if (calculatedScore === 20) {
      message =
        "Congratulations! You've achieved Document Automation Master certification (Perfect Performance)";
    } else if (calculatedScore >= 15) {
      message =
        "Congratulations! You've achieved Document Automation Pro certification (Excellent Performance)";
    } else if (calculatedScore >= 10) {
      message =
        "Congratulations! You've achieved Document Automation Novice certification";
    } else if (calculatedScore >= 5) {
      message =
        "Congratulations! You've achieved Document Automation Beginner certification";
    } else {
      message = "Please retry the exercise to improve your accuracy.";
    }

    setCertificationMessage(message);

    const selectedPart = localStorage.getItem("selectedPart");
    if (selectedPart === "1") {
      setShowCertificationPopup(true);
    } else if (selectedPart === "3") {
      setShowCodeCircuit_SubLevel_3GamePopup(true);
    } else {
      navigate("/Finish", { state: { userAnswers } });
    }
  };

  const handleReplay = () => {
    setCalculatedScore(0);
    setAdditionalLocations([""]);
    navigate("/Level-Two-Part-Two");
  };

  const selectedPart = localStorage.getItem("selectedPart");
  const levelPath = selectedPart === "4" ? "/Level-Two-Part-Two-Demo" : "/Level-Two-Part-Two";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans relative transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      <style>
        {`
          .highlight {
            animation: highlightAnimation 2s ease-in-out;
          }
          @keyframes highlightAnimation {
            0% { background-color: transparent; }
            50% { background-color: ${
              isDarkMode ? "rgba(129, 236, 236, 0.3)" : "rgba(129, 236, 236, 0.5)"
            }; }
            100% { background-color: transparent; }
          }
        `}
      </style>
      <Navbar
        level={levelPath}
        questionnaire="/Questionnaire"
        live_generation="/Live_Generation"
      />
      <div
        className={`fixed top-14 right-2 p-2 rounded-lg shadow-md z-50 ${
          isDarkMode ? "bg-gray-700/90 text-teal-300" : "bg-white/90 text-teal-700"
        }`}
      >
        <p className="font-bold">Score: {totalScore}</p>
      </div>
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
      </div>
      <div className="flex-grow flex items-center justify-center py-12 px-6">
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-[calc(100vh-6rem)]">
            <div
              className={`flex items-center space-x-3 p-4 rounded-lg shadow-md ${
                isDarkMode
                  ? "bg-gray-700/90 text-teal-300"
                  : "bg-white/90 text-teal-700"
              }`}
            >
              <svg
                className="animate-spin h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Loading questions...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-row w-full max-w-7xl">
            <div
              className={`flex flex-col w-1/2 pl-4 pr-8 sticky top-12 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl shadow-lg border p-6 ${
                isDarkMode
                  ? "bg-gradient-to-b from-gray-700/70 to-gray-800/70 border-gray-700/20"
                  : "bg-gradient-to-b from-teal-50/50 to-cyan-50/50 border-teal-100/20"
              }`}
            >
              {highlightedTexts.length > 0 ? (
                <>
                  <h2
                    className={`text-2xl font-semibold mb-6 tracking-wide ${
                      isDarkMode ? "text-teal-300" : "text-teal-700"
                    }`}
                  >
                    Questions
                  </h2>
                  {highlightedTexts.map((_, index) => renderAnswerInput(index))}
                  <div className="flex justify-end mt-8">
                    <button
                      className={`px-6 py-3 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ${
                        isDarkMode
                          ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                          : "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500"
                      }`}
                      onClick={handleFinish}
                    >
                      Finish
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-teal-300" : "text-teal-700"
                    }`}
                  >
                    No questions have been generated yet.
                  </p>
                  <p
                    className={`text-sm mt-3 ${
                      isDarkMode ? "text-teal-400" : "text-teal-500"
                    }`}
                  >
                    Please go to the Questionnaire tab, create or select questions
                    from the Document tab, and then return here to answer them and
                    generate a live document preview.
                  </p>
                </div>
              )}
            </div>
            <div
              className={`w-1/2 pl-8 rounded-xl shadow-lg border ${
                isDarkMode
                  ? "bg-gray-800/90 backdrop-blur-sm border-gray-700/20"
                  : "bg-white/90 backdrop-blur-sm border-teal-100/20"
              }`}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === "SPAN" && target.dataset.question) {
                  handlePlaceholderClick(target.dataset.question);
                }
              }}
            >
              <div className="mt-6 p-6">
                {parse(agreement, {
                  replace: (domNode: DOMNode) => {
                    if (domNode instanceof Element && domNode.attribs) {
                      const className = domNode.attribs.className || "";
                      if (className.includes("bg-white")) {
                        domNode.attribs.className =
                          "bg-white rounded-lg shadow-sm border border-black-100 p-8";
                      }
                      if (className.includes("text-blue-600 leading-relaxed")) {
                        domNode.attribs.className =
                          "text-blue-600 leading-relaxed space-y-6";
                      }
                    }
                    return domNode;
                  },
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <SuccessToast
        message="Questions loaded successfully!"
        isVisible={showSuccessToast}
        isDarkMode={isDarkMode}
      />
      <WarningAlert
        message={
          highlightedTexts.length === 0
            ? "Failed to load questions. Please return to the Questionnaire tab to set up questions."
            : "Please correct all input errors and answer all required questions before finishing."
        }
        isVisible={showWarning}
        isDarkMode={isDarkMode}
      />
      {selectedPart === "1" && (
        <CertificationPopup
          message={certificationMessage}
          isVisible={showCertificationPopup}
          isDarkMode={isDarkMode}
          onContinue={handleContinueToDocument}
          onReplay={handleReplay}
          score={calculatedScore}
        />
      )}
      {selectedPart === "3" && (
        <CodeCircuit_SubLevel_3GamePopup
          isVisible={showCodeCircuit_SubLevel_3GamePopup}
          isDarkMode={isDarkMode}
          highlightedTexts={highlightedTexts}
          userAnswers={userAnswers}
          onContinue={handleFinishCodeCircuit_SubLevel_3Game}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
};

export default Live_Generation;