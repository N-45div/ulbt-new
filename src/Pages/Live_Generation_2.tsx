import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import Navbar from "../components/Navbar";
import { documentText } from "../utils/EmploymentAgreement";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useQuestionType } from "../context/QuestionTypeContext";
import { useQuestionEditContext } from "../context/QuestionEditContext";
import { ThemeContext } from "../context/ThemeContext";
import parse, { DOMNode, Element } from "html-react-parser";
import { useUserAnswers } from "../context/UserAnswersContext";

const Live_Generation_2 = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { highlightedTexts: originalHighlightedTexts } = useHighlightedText();
  const { selectedTypes: originalSelectedTypes, editedQuestions: originalEditedQuestions, requiredQuestions: originalRequiredQuestions } = useQuestionType();
  const { determineQuestionType, findPlaceholderByValue } = useQuestionEditContext();
  const [agreement, setAgreement] = useState<string>(documentText);
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([]);
  const [additionalLocations, setAdditionalLocations] = useState<string[]>([""]); // Initialize with one empty location
  // const [userAnswers, setUserAnswers] = useState<{ [key: string]: string | boolean | null | { amount: string; currency: string } }>({});
  const { userAnswers, setUserAnswers } = useUserAnswers();
  const [highlightedTexts, setHighlightedTexts] = useState<string[]>(originalHighlightedTexts);
  const [selectedTypes, setLocalSelectedTypes] = useState<(string | null)[]>(originalSelectedTypes);
  const [editedQuestions, setLocalEditedQuestions] = useState<string[]>(originalEditedQuestions);
  const [requiredQuestions, setLocalRequiredQuestions] = useState<boolean[]>(originalRequiredQuestions);

  // function initializeUserAnswers(highlightedTexts: string[], selectedTypes: (string | null)[]): { [key: string]: string | boolean | null | { amount: string; currency: string } } {
  //   const initialAnswers: { [key: string]: string | boolean | null | { amount: string; currency: string } } = {};
  //   highlightedTexts.forEach((text, index) => {
  //     const { primaryValue } = determineQuestionType(text);
  //     const type = selectedTypes[index] || "Text";
  //     if (primaryValue) {
  //       if (primaryValue === "What's the annual salary?") {
  //         initialAnswers[primaryValue] = { amount: "", currency: "USD" };
  //       } else if (primaryValue === "What is the additional work location?") {
  //         initialAnswers[primaryValue] = ""; // Initialize as empty string for locations
  //       } else {
  //         initialAnswers[primaryValue] = type === "Radio" ? null : "";
  //       }
  //     }
  //   });
  //   return initialAnswers;
  // }

  useEffect(() => {
    const savedOrder = sessionStorage.getItem("questionOrder");
    let questionOrder: number[] = [];
    if (savedOrder) {
      questionOrder = JSON.parse(savedOrder);
    } else {
      questionOrder = originalHighlightedTexts.map((_, index) => index);
    }

    const processedTexts: string[] = [];
    const questionMap = new Map();

    const isProbationaryClauseSelected = originalHighlightedTexts.some((text) =>
      text.toLowerCase().includes("probationary period") &&
      text.includes("[Probation Period Length]") &&
      text.length > "[Probation Period Length]".length
    );

    const isAdditionalLocationsClauseSelected = originalHighlightedTexts.some((text) =>
      text.includes("The Employee may be required to work at [other locations].")
    );

    const followUpQuestions = [
      "What's the probation period length?",
      "What's the probation extension length?",
      "How many weeks?",
      "Who is the HR/Relevant Contact?",
      "What is the additional work location?",
    ];

    const filteredQuestions = originalHighlightedTexts.filter((text) => {
      const { primaryValue } = determineQuestionType(text);
      const isFollowUp = followUpQuestions.includes(primaryValue || "");

      if (isProbationaryClauseSelected && text === "Probation Period Length") {
        return false;
      }

      if (
        text === "other locations" &&
        !isAdditionalLocationsClauseSelected
      ) {
        return false;
      }

      const shouldInclude =
        !isFollowUp ||
        text === "USA" ||
        (primaryValue === "What's the probation period length?" &&
          text === "Probation Period Length" &&
          !isProbationaryClauseSelected) ||
        (primaryValue === "What is the additional work location?" &&
          text === "other locations" &&
          isAdditionalLocationsClauseSelected);
      return shouldInclude;
    });

    for (const text of filteredQuestions) {
      const { primaryValue } = determineQuestionType(text);
      const displayValue = primaryValue;
      if (displayValue && !questionMap.has(displayValue)) {
        questionMap.set(displayValue, text);
        processedTexts.push(text);
      }
    }

    if (originalHighlightedTexts.includes("USA") && !processedTexts.includes("USA")) {
      processedTexts.push("USA");
    }

    const reorderedHighlightedTexts = questionOrder
      .map((index) => processedTexts[index])
      .filter((text) => text !== undefined);
    const reorderedSelectedTypes = questionOrder
      .map((index) => originalSelectedTypes[index])
      .filter((type) => type !== undefined);
    const reorderedEditedQuestions = questionOrder
      .map((index) => originalEditedQuestions[index])
      .filter((text) => text !== undefined);
    const reorderedRequiredQuestions = questionOrder
      .map((index) => originalRequiredQuestions[index])
      .filter((req) => req !== undefined);

    setHighlightedTexts(reorderedHighlightedTexts);
    setLocalSelectedTypes(reorderedSelectedTypes);
    setLocalEditedQuestions(reorderedEditedQuestions);
    setLocalRequiredQuestions(reorderedRequiredQuestions);

    // const initial = initializeUserAnswers(reorderedHighlightedTexts, reorderedSelectedTypes);
    // setUserAnswers(initial);
  }, [originalHighlightedTexts, originalSelectedTypes, originalEditedQuestions, originalRequiredQuestions]);

  useEffect(() => {
    let updatedText = documentText;
  
    // Hide the condition by default
    updatedText = updatedText.replace(
      /\(\/The Employee may be required to work at \[other locations\]\.\/\)/gi,
      ""
    );
    const probationAnswer = userAnswers["Is the clause of probationary period applicable?"];
    if (probationAnswer === null || probationAnswer === false) {
      updatedText = updatedText.replace(
        /<h2[^>]*>[^<]*PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?<\/p>/i,
        ""
      );
    }
  
    const pensionAnswer = userAnswers["Is the Pension clause applicable?"];
    if (pensionAnswer === null || pensionAnswer === false) {
      updatedText = updatedText.replace(
        /<h2[^>]*>[^<]*PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?<\/p>/i,
        ""
      );
    }
  
    const additionalLocationsAnswer = userAnswers["Does the employee need to work at additional locations besides the normal place of work?"];
    if (additionalLocationsAnswer === false) {
      // No change needed as the condition is already hidden by default
    } else if (additionalLocationsAnswer === true) {
      const locationsAnswer = userAnswers["What is the additional work location?"] as string;
      let formattedLocations = "";
      if (locationsAnswer) {
        const locationsArray = locationsAnswer
          .split(/\s*,\s*|\s*and\s*|\s*, and\s*/)
          .filter(Boolean);
        if (locationsArray.length === 1) {
          formattedLocations = locationsArray[0];
        } else if (locationsArray.length === 2) {
          formattedLocations = locationsArray.join(" and ");
        } else {
          formattedLocations = `${locationsArray.slice(0, -1).join(", ")}, and ${locationsArray[locationsArray.length - 1]}`;
        }
      } else {
        formattedLocations = "[other locations]";
      }
      updatedText = updatedText.replace(
        /\[other locations\]/gi,
        `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${formattedLocations}</span>`
      );
    }
  
    Object.entries(userAnswers).forEach(([question, answer]) => {
      const placeholder = findPlaceholderByValue(question);
      if (question === "Is the employee entitled to overtime work?") {
        const overtimeYesClause = "{The Employee is entitled to overtime pay for authorized overtime work.}";
        const overtimeNoClause = "{The Employee shall not receive additional payment for overtime worked.}";

        updatedText = updatedText.replace(
          /<p className="mt-5" id="employment-agreement-working-hours">([\s\S]*?)<\/p>/i,
          () => {
            let replacementText = "";

            if (answer === true) {
              replacementText = `${overtimeYesClause}`;
            } else if (answer === false) {
              replacementText = `${overtimeNoClause}`;
            }

            return `<p className="mt-5" id="employment-agreement-working-hours">${replacementText}</p>`;
          }
        );
        return;
      }
      if (placeholder === "Unused Holiday Days" && typeof answer === "string") {
        const storedOperationType = localStorage.getItem("operationType");
        const storedOperationValue = localStorage.getItem("operationValue");
        const operationValue = storedOperationValue ? parseFloat(storedOperationValue) : null;
        let calculatedValue: number | null = null;
        let floatAnswer = parseFloat(answer).toFixed(2);
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
              calculatedValue = operationValue !== 0 ? numericAnswer / operationValue : null;
              break;
            default:
              calculatedValue = null;
          }
        }
        localStorage.setItem("calculatedValue", calculatedValue !== null ? String(calculatedValue) : "0");
  
        updatedText = updatedText.replace(
          new RegExp("\\[Holiday Pay\\]", "gi"),
          `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${calculatedValue}</span>`
        );
      }
  
      if (placeholder) {
        const escapedPlaceholder = placeholder.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
        if (question === "What's the annual salary?") {
          const salaryData = answer as { amount: string; currency: string } | undefined;
          updatedText = updatedText.replace(
            new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
            `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${salaryData?.amount || "[Annual Salary]"}</span>`
          );
          updatedText = updatedText.replace(
            new RegExp(`\\[USD\\]`, "gi"),
            `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${salaryData?.currency || "[USD]"}</span>`
          );
        } else if (question === "What is the governing country?") {
          const countryAnswer = typeof answer === "string" && answer.trim() ? answer : "[USA]";
          updatedText = updatedText.replace(
            new RegExp(`\\[USA\\]`, "gi"),
            `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${countryAnswer}</span>`
          );
        } else if (typeof answer === "boolean" || answer === null) {
          if ((!answer) && placeholder !== "other locations") {
            updatedText = updatedText.replace(new RegExp(`.*${escapedPlaceholder}.*`, "gi"), "");
          } else {
            updatedText = updatedText.replace(
              new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
              answer ? "Yes" : "No"
            );
          }
        } else if (typeof answer === "string" && answer.trim() && question !== "What is the additional work location?") {
          updatedText = updatedText.replace(
            new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
            `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${answer}</span>`
          );
        } else if (question !== "What is the additional work location?") {
          updatedText = updatedText.replace(
            new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
            `[${placeholder}]`
          );
        }
      } else {
        if (question === "Is the sick pay policy applicable?") {
          const sickPayClause = "{The Employee may also be entitled to Company sick pay of [Details of Company Sick Pay Policy]}";
          if (answer === false) {
            updatedText = updatedText.replace(sickPayClause, "");
          } else if (answer === true && userAnswers["What's the sick pay policy?"]) {
            updatedText = updatedText.replace(
              "[Details of Company Sick Pay Policy]",
              `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${userAnswers["What's the sick pay policy?"] as string}</span>`
            );
          }
        } else if (question === "Is the termination clause applicable?") {
          if (answer === false) {
            const terminationSection = updatedText.match(/<h2[^>]*>TERMINATION<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/i);
            if (terminationSection) {
              const sectionWithoutClause = terminationSection[0].replace(/\(After the probationary period.*?gross misconduct\.\)/, '');
              updatedText = updatedText.replace(terminationSection[0], sectionWithoutClause);
            }
          } else if (answer === true && userAnswers["What's the notice period?"]) {
            updatedText = updatedText.replace(
              /\[Notice Period\]/gi,
              `<span class="${isDarkMode ? "bg-teal-600/70 text-teal-100" : "bg-teal-200/70 text-teal-900"} px-1 rounded">${userAnswers["What's the notice period?"] as string}</span>`
            );
          }
        } else if (question === "Is the previous service applicable?" && answer === false) {
          const prevEmploymentClause = 'or, if applicable, "on [Previous Employment Start Date] with previous continuous service taken into account"';
          updatedText = updatedText.replace(new RegExp(`\\s*${prevEmploymentClause.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&")}\\s*`, "gi"), "");
        }
      }
    });
  
    setAgreement(updatedText + " ");
  }, [userAnswers, isDarkMode]);
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
      const { primaryValue } = determineQuestionType(highlightedTexts[index] || "");
      if (!primaryValue) return;

      const currentType = selectedTypes[index] || "Text";

      if (typeof value === "string" && currentType !== "Radio" && primaryValue !== "What's the annual salary?") {
        const error = validateInput(currentType, value);
        setInputErrors((prev) => ({
          ...prev,
          [primaryValue]: error,
        }));
      }

      if (isAdditional && locationIndex !== undefined) {
        setAdditionalLocations((prev) => {
          const updated = [...prev];
          updated[locationIndex] = value as string;
          return updated;
        });
        setUserAnswers((prev) => {
          const locations = additionalLocations
            .map((loc, idx) => (idx === locationIndex ? (value as string) : loc))
            .filter(Boolean);
          const formattedLocations =
            locations.length === 1
              ? locations[0]
              : locations.length === 2
              ? locations.join(" and ")
              : `${locations.slice(0, -1).join(", ")}, and ${locations[locations.length - 1]}`;
          return {
            ...prev,
            [primaryValue]: formattedLocations,
          };
        });
      } else {
        setUserAnswers((prev) => {
          const newAnswers = {
            ...prev,
            [primaryValue]: value,
          };
          if (followUpQuestion && value === true) {
            newAnswers[followUpQuestion] = "";
          }
          return newAnswers;
        });
      }
    },
    [highlightedTexts, selectedTypes, additionalLocations]
  );

  const handleAddMore = () => {
    setAdditionalLocations((prev) => [...prev, ""]);
  };

  const renderAnswerInput = (index: number) => {
    const questionText = highlightedTexts[index] || "";
    const { primaryValue } = determineQuestionType(questionText);
    if (!primaryValue) return null;

    const currentType = selectedTypes[index] || "Text";
    const answer = userAnswers[primaryValue] !== undefined ? userAnswers[primaryValue] : (currentType === "Radio" ? null : "");
    const error = inputErrors[primaryValue] || "";
    const isRequired = requiredQuestions[index] || false;

    if (primaryValue === "Does the employee need to work at additional locations besides the normal place of work?") {
      return (
        <div key={index} className="mb-12">
          <p className={`text-lg font-medium ${isDarkMode ? "text-teal-200" : "text-teal-900"}`}>
            {editedQuestions[index] || primaryValue}
            {isRequired && <span className="text-red-500 ml-2">*</span>}
          </p>
          <div className="mt-4 flex space-x-6">
            <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
              <input
                type="radio"
                checked={answer === true}
                onChange={() => handleAnswerChange(index, true, "What is the additional work location?")}
                className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                required={isRequired}
              />
              <span>Yes</span>
            </label>
            <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
              <input
                type="radio"
                checked={answer === false}
                onChange={() => handleAnswerChange(index, false)}
                className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                required={isRequired}
              />
              <span>No</span>
            </label>
          </div>
          {answer === true && highlightedTexts.some((text) => determineQuestionType(text).primaryValue === "What is the additional work location?") && (
            <div className="mt-6">
              <p className={`text-lg font-medium ${isDarkMode ? "text-teal-200" : "text-teal-900"}`}>
                What is the additional work location?
                {isRequired && <span className="text-red-500 ml-2">*</span>}
              </p>
              {additionalLocations.map((location, locIndex) => (
                <div key={locIndex} className="mt-4">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => handleAnswerChange(index + 1, e.target.value, undefined, true, locIndex)}
                    className={`p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isDarkMode
                        ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                        : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                    }`}
                    placeholder={`Enter additional location ${locIndex + 1}`}
                    required={isRequired}
                  />
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <button
                  className={`px-6 py-3 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ${
                    isDarkMode ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800" : "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500"
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

    if (primaryValue === "What's the annual salary?") {
      const answerWithCurrency = typeof answer === "object" && answer !== null && "amount" in answer && "currency" in answer
        ? answer as { amount: string; currency: string }
        : { amount: "", currency: "USD" };

      return (
        <div key={index} className="mb-12">
          <div className="w-full">
            <p className={`text-lg font-medium ${isDarkMode ? "text-teal-200" : "text-teal-900"}`}>
              {editedQuestions[index] || primaryValue || "Unnamed Question"}
              {isRequired && <span className="text-red-500 ml-2">*</span>}
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <input
                type="number"
                value={answerWithCurrency.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  const error = validateInput("Number", value);
                  setInputErrors((prev) => ({ ...prev, [primaryValue]: error }));
                  const currentAnswer = userAnswers[primaryValue];
                  const currentCurrency = typeof currentAnswer === "object" && currentAnswer !== null && "currency" in currentAnswer
                    ? (currentAnswer as { amount: string; currency: string }).currency
                    : "USD";
                  handleAnswerChange(index, { amount: value, currency: currentCurrency });
                }}
                ref={(el) => { if (el) inputRefs.current[index] = el; }}
                className={`p-3 w-1/2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter amount"
              />
              <select
                value={answerWithCurrency.currency}
                onChange={(e) => {
                  handleAnswerChange(index, { amount: answerWithCurrency.amount, currency: e.target.value });
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

    if (primaryValue === "What is the additional work location?") {
      return null; // Handled within the parent radio question
    }

    return (
      <div key={index} className="mb-12">
        <div className="w-full">
          <p className={`text-lg font-medium ${isDarkMode ? "text-teal-200" : "text-teal-900"}`}>
            {editedQuestions[index] || primaryValue || "Unnamed Question"}
            {isRequired && <span className="text-red-500 ml-2">*</span>}
          </p>
          {currentType === "Radio" ? (
            primaryValue === "Is the sick pay policy applicable?" ? (
              <>
                <div className="mt-4 flex space-x-6">
                  <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                    <input
                      type="radio"
                      checked={answer === true}
                      onChange={() => handleAnswerChange(index, true, "What's the sick pay policy?")}
                      className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                      required={isRequired}
                    />
                    <span>Yes</span>
                  </label>
                  <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                    <input
                      type="radio"
                      checked={answer === false}
                      onChange={() => handleAnswerChange(index, false)}
                      className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                      required={isRequired}
                    />
                    <span>No</span>
                  </label>
                </div>
                {answer === true && (
                  <input
                    type="text"
                    value={(userAnswers["What's the sick pay policy?"] as string) || ""}
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
                )}
              </>
            ) : (
              <div className="mt-4 flex space-x-6">
                <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                  <input
                    type="radio"
                    checked={answer === true}
                    onChange={() => handleAnswerChange(index, true)}
                    className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                    required={isRequired}
                  />
                  <span>Yes</span>
                </label>
                <label className={`flex items-center space-x-2 cursor-pointer ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                  <input
                    type="radio"
                    checked={answer === false}
                    onChange={() => handleAnswerChange(index, false)}
                    className={`cursor-pointer ${isDarkMode ? "text-teal-500 focus:ring-teal-400" : "text-teal-600 focus:ring-teal-500"}`}
                    required={isRequired}
                  />
                  <span>No</span>
                </label>
              </div>
            )
          ) : currentType === "Number" ? (
            <>
              <input
                ref={(el) => { if (el) inputRefs.current[index] = el as HTMLInputElement; }}
                type="number"
                value={(userAnswers[primaryValue] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter a number"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Date" ? (
            <>
              <input
                ref={(el) => { if (el) inputRefs.current[index] = el as HTMLInputElement; }}
                type="date"
                value={(userAnswers[primaryValue] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800`
                }`}
                placeholder="Select a date"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Email" ? (
            <>
              <input
                ref={(el) => { if (el) inputRefs.current[index] = el as HTMLInputElement; }}
                type="email"
                value={(userAnswers[primaryValue] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter an email address"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Text" ? (
            <>
              <input
                ref={(el) => { if (el) inputRefs.current[index] = el as HTMLInputElement; }}
                type="text"
                value={(userAnswers[primaryValue] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter your answer"
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : currentType === "Paragraph" ? (
            <>
              <textarea
                ref={(el) => { if (el) inputRefs.current[index] = el as HTMLTextAreaElement; }}
                value={(userAnswers[primaryValue] as string) || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mt-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDarkMode
                    ? `bg-gray-700/80 border ${error ? "border-red-400" : "border-teal-600"} focus:ring-teal-400 text-teal-200 placeholder-teal-300/70`
                    : `bg-white/80 border ${error ? "border-red-400" : "border-teal-200"} focus:ring-teal-500 text-teal-800 placeholder-teal-400/70`
                }`}
                placeholder="Enter your answer"
                rows={3}
                required={isRequired}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  };

  const handleFinish = () => {
    const hasErrors = Object.values(inputErrors).some((error) => error !== "");
    if (hasErrors) {
      alert("Please correct all input errors before finishing.");
      return;
    }

    const unansweredRequiredFields = highlightedTexts
      .map((text, index) => {
        const { primaryValue } = determineQuestionType(text);
        const isRequired = requiredQuestions[index] || false;
        if (!primaryValue || !isRequired) return null;

        const answer = userAnswers[primaryValue];
        if (
          answer === null ||
          answer === "" ||
          (typeof answer === "object" && answer !== null && (!answer.amount || !answer.currency))
        ) {
          return primaryValue;
        }
        return null;
      })
      .filter(Boolean);

    if (unansweredRequiredFields.length > 0) {
      alert(`Please answer all required questions: ${unansweredRequiredFields.join(", ")}`);
      return;
    }

    navigate("/Finish", { state: { userAnswers } });
  };

  const storedLevel = sessionStorage.getItem("level") ?? "/Level-Two-Part-Two";
  return (
    <div
      className={`min-h-screen flex flex-col font-sans relative transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      <Navbar
        level={storedLevel}
        questionnaire="/Questionnaire_Level3"
        live_generation="/Live_Generation_2"
        {...(storedLevel === "/Level-Three-Quiz" ? { calculations: "/Calculations" } : {})}
      />
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
        <button
          onClick={() => navigate("/Questionnaire_Level3")}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
        >
          ← Back to Questionnaire
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
      </div>
      <div className="flex-grow flex items-center justify-center py-12 px-6">
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
                <h2 className={`text-2xl font-semibold mb-6 tracking-wide ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                  Questions
                </h2>
                {highlightedTexts.map((_, index) => renderAnswerInput(index))}
                <div className="flex justify-end mt-8">
                  <button
                    className={`px-6 py-3 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                        : "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500"
                    } departmental`}
                    onClick={handleFinish}
                  >
                    Finish
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className={`text-lg font-medium ${isDarkMode ? "text-teal-300" : "text-teal-700"}`}>
                  No questions have been generated yet.
                </p>
                <p className={`text-sm mt-3 ${isDarkMode ? "text-teal-400" : "text-teal-500"}`}>
                  Please go to the Questionnaire tab, create or select questions from the Document tab, and then return here to answer them and generate a live document preview.
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
          >
            <div className="mt-6 p-6">
              {parse(agreement, {
                replace: (domNode: DOMNode) => {
                  if (domNode instanceof Element && domNode.attribs) {
                    const className = domNode.attribs.className || "";
                    if (className.includes("bg-white")) {
                      domNode.attribs.className = "bg-white rounded-lg shadow-sm border border-black-100 p-8";
                    }
                    if (className.includes("text-blue-600 leading-relaxed")) {
                      domNode.attribs.className = "text-blue-600 leading-relaxed space-y-6";
                    }
                  }
                  return domNode;
                },
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Live_Generation_2;


// latest code
