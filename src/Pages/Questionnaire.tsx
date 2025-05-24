import { useState, useEffect, useCallback, useRef, useContext } from "react";
import Navbar from "../components/Navbar";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { useQuestionType } from "../context/QuestionTypeContext";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useQuestionEditContext } from "../context/QuestionEditContext.tsx";
import { ThemeContext } from "../context/ThemeContext";
import { useScore } from "../context/ScoreContext";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

// Type definitions for Shepherd.js
interface ShepherdStep {
  id: string;
  text: string;
  attachTo: { element: Element | string | null; on: string };
  buttons: Array<{
    text: string;
    action: () => void;
  }>;
  classes?: string;
}

interface ShepherdTour {
  start: () => void;
  show: (stepId: string) => void;
  next: () => void;
  complete: () => void;
  addStep: (step: ShepherdStep) => void;
}

interface ShepherdStatic {
  Tour: new (options: {
    defaultStepOptions: {
      cancelIcon: { enabled: boolean };
      classes: string;
      scrollTo: { behavior: "smooth"; block: "center" };
    };
    useModalOverlay: boolean;
    confirmCancel: boolean;
    tourName: string;
  }) => ShepherdTour;
}

const ShepherdStatic = Shepherd as unknown as ShepherdStatic;

// Define QuestionType to match expected keys
type QuestionType = "textTypes" | "numberTypes" | "dateTypes" | "radioTypes";

// Type guard to map primaryType to QuestionType
const getQuestionType = (primaryType: string | undefined): QuestionType => {
  if (!primaryType) {
    console.warn(`primaryType is undefined, defaulting to textTypes`);
    return "textTypes";
  }
  
  const lowerType = primaryType.toLowerCase();
  switch (lowerType) {
    case "text":
    case "paragraph":
      return "textTypes";
    case "number":
      return "numberTypes";
    case "date":
      return "dateTypes";
    case "radio":
      return "radioTypes";
    default:
      console.warn(`Unknown primaryType "${primaryType}", defaulting to textTypes`);
      return "textTypes";
  }
};

interface DivWithDropdownProps {
  textValue: string;
  index: number;
  onTypeChange: (index: number, type: string) => void;
  onTypeChanged: (index: number, changed: boolean) => void;
  onQuestionTextChange: (index: number, newText: string) => void;
  onRequiredChange: (index: number, required: boolean) => void;
  initialQuestionText: string;
  initialType: string;
  initialRequired: boolean;
  initialTypeChanged: boolean;
  isFollowUp?: boolean;
}

const DivWithDropdown: React.FC<DivWithDropdownProps> = ({
  textValue,
  index,
  onTypeChange,
  onTypeChanged,
  onQuestionTextChange,
  onRequiredChange,
  initialQuestionText,
  initialType,
  initialRequired = false,
  initialTypeChanged = false,
  isFollowUp = false,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [questionText, setQuestionText] = useState(initialQuestionText || "No text selected");
  const [selectedType, setSelectedType] = useState<string>(initialType || "Text");
  const [isOpen, setIsOpen] = useState(false);
  const [isRequired, setIsRequired] = useState(initialRequired);
  const [typeChanged, setTypeChanged] = useState(initialTypeChanged);
  const { findPlaceholderByValue, updateQuestion, determineQuestionType } = useQuestionEditContext();

  const enhancedDetermineQuestionType = useCallback(
    (text: string) => {
      if (/yes\/no|radio/i.test(text)) {
        return {
          primaryType: "Radio",
          primaryValue: text,
          validTypes: ["Radio", "Text", "Paragraph"],
        };
      }
      return determineQuestionType(text);
    },
    [determineQuestionType]
  );

  const { primaryType, primaryValue, validTypes } = enhancedDetermineQuestionType(textValue);
  console.log(`DivWithDropdown rendering for textValue "${textValue}": primaryType=${primaryType}, primaryValue=${primaryValue}, validTypes=${validTypes}, selectedType=${selectedType}`);

  const handleTypeSelect = (type: string) => {
    if (typeChanged) return;

    if (validTypes.includes(type)) {
      setSelectedType(type);
      onTypeChange(index, type);
      setTypeChanged(true);
      onTypeChanged(index, true);

      let newQuestionText = questionText;
      if (questionText === primaryValue || questionText === "No text selected") {
        newQuestionText = primaryValue || "No text selected";
        setQuestionText(newQuestionText);
        onQuestionTextChange(index, newQuestionText);
      }
      console.log(`Dropdown at index ${index} selected type: ${type}`);

      // Trigger tour advancement for specific placeholders
      const currentStep = sessionStorage.getItem("tourStep");
      if (currentStep === "set-type-employer-name" && textValue === "Employer Name" && type === "Text") {
        sessionStorage.setItem("tourStep", "set-required-employer-name");
        (window as any).tourRef?.show("set-required-employer-name");
      } else if (currentStep === "set-type-employee-name" && textValue === "Employee Name" && type === "Text") {
        sessionStorage.setItem("tourStep", "set-required-employee-name");
        (window as any).tourRef?.show("set-required-employee-name");
      } else if (currentStep === "set-type-agreement-date" && textValue === "Agreement Date" && type === "Date") {
        sessionStorage.setItem("tourStep", "set-required-agreement-date");
        (window as any).tourRef?.show("set-required-agreement-date");
      }
    }
    setIsOpen(false);
  };

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const oldText = textValue;
    const newText = e.target.value;
    setQuestionText(newText);
    onQuestionTextChange(index, newText);
    
    const { primaryType: determinedPrimaryType } = determineQuestionType(oldText);
    const placeholder = findPlaceholderByValue(oldText);

    if (placeholder && determinedPrimaryType) {
      const typeKey: QuestionType = getQuestionType(determinedPrimaryType);
      updateQuestion(typeKey, placeholder, newText);
    } else {
      console.warn(`Skipping updateQuestion: Invalid primaryType "${determinedPrimaryType}" or placeholder "${placeholder}" for oldText "${oldText}"`);
    }

    // Trigger tour advancement for specific placeholders
    const currentStep = sessionStorage.getItem("tourStep");
    if (currentStep === "edit-question-employer-name" && textValue === "Employer Name") {
      sessionStorage.setItem("tourStep", "set-type-employer-name");
      (window as any).tourRef?.show("set-type-employer-name");
    } else if (currentStep === "edit-question-employee-name" && textValue === "Employee Name") {
      sessionStorage.setItem("tourStep", "set-type-employee-name");
      (window as any).tourRef?.show("set-type-employee-name");
    } else if (currentStep === "edit-question-agreement-date" && textValue === "Agreement Date") {
      sessionStorage.setItem("tourStep", "set-type-agreement-date");
      (window as any).tourRef?.show("set-type-agreement-date");
    }
  };

  const handleRequiredToggle = () => {
    const newRequired = !isRequired;
    setIsRequired(newRequired);
    onRequiredChange(index, newRequired);
    console.log(`Required status for index ${index} set to: ${newRequired}`);

    // Trigger tour advancement for specific placeholders
    const currentStep = sessionStorage.getItem("tourStep");
    if (currentStep === "set-required-employer-name" && textValue === "Employer Name" && newRequired) {
      sessionStorage.setItem("tourStep", "edit-question-employee-name");
      (window as any).tourRef?.show("edit-question-employee-name");
    } else if (currentStep === "set-required-employee-name" && textValue === "Employee Name" && newRequired) {
      sessionStorage.setItem("tourStep", "edit-question-agreement-date");
      (window as any).tourRef?.show("edit-question-agreement-date");
    } else if (currentStep === "set-required-agreement-date" && textValue === "Agreement Date" && newRequired) {
      sessionStorage.setItem("tourStep", "click-next-button");
      (window as any).tourRef?.show("click-next-button");
    }
  };

  const allPossibleTypes = ["Text", "Paragraph", "Radio", "Number", "Date"];

  return (
    <div
      className={`flex items-center space-x-8 w-full relative ${
        isFollowUp ? "ml-0" : ""
      }`}
    >
      <button className="flex flex-col justify-between h-10 w-12 p-1 transform hover:scale-105 transition-all duration-300">
        <span
          className={`block h-1 w-full rounded-full ${
            isDarkMode ? "bg-teal-400" : "bg-teal-600"
          }`}
        ></span>
        <span
          className={`block h-1 w-full rounded-full ${
            isDarkMode ? "bg-teal-400" : "bg-teal-600"
          }`}
        ></span>
        <span
          className={`block h-1 w-full rounded-full ${
            isDarkMode ? "bg-teal-400" : "bg-teal-600"
          }`}
        ></span>
      </button>
      <div
        className={`relative w-full mt-5 max-w-lg h-36 rounded-xl shadow-lg flex flex-col items-center justify-center text-lg font-semibold p-6 z-10 transform transition-all duration-300 hover:shadow-xl ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-700 to-gray-800 text-teal-200"
            : "bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-900"
        }`}
      >
        <div className="relative w-full flex items-center">
          <div
            className={`h-0.5 w-1/2 absolute left-0 opacity-50 ${
              isDarkMode ? "bg-teal-400" : "bg-teal-500"
            }`}
          ></div>
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
          {isRequired && <span className="text-red-500 ml-2">*</span>}
        </div>

        <div className="absolute top-1/2 right-6 transform -translate-y-1/2 flex items-center space-x-2">
          <div className="relative">
            <button
              data-testid={`type-dropdown-${index}`}
              className={`flex items-center space-x-2 text-sm px-3 py-1 rounded-lg shadow-md transition-all duration-300 ${
                isDarkMode
                  ? "bg-gray-600/80 text-teal-200 hover:bg-gray-500"
                  : "bg-white/80 text-teal-900 hover:bg-white"
              } ${typeChanged ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !typeChanged && setIsOpen(!isOpen)}
              disabled={typeChanged}
            >
              <span>{selectedType}</span>
              {!typeChanged && (
                <FaChevronDown
                  className={isDarkMode ? "text-teal-400" : "text-teal-600"}
                />
              )}
            </button>
            {isOpen && !typeChanged && (
              <div
                className={`absolute right-0 mt-1 w-40 rounded-lg shadow-lg z-50 overflow-y-auto max-h-[150px] ${
                  isDarkMode
                    ? "bg-gray-700/90 backdrop-blur-sm border-gray-600"
                    : "bg-white/90 backdrop-blur-sm border-teal-100"
                } scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-teal-500 scrollbar-track-transparent`}
              >
                {allPossibleTypes.map((type) => (
                  <div
                    key={type}
                    className={`px-4 py-2 cursor-pointer transition-all duration-200 ${
                      isDarkMode
                        ? "text-teal-200 hover:bg-gray-600"
                        : "text-teal-800 hover:bg-teal-50"
                    } ${
                      !validTypes.includes(type)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => handleTypeSelect(type)}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <span
              className={`text-sm ${
                isDarkMode ? "text-teal-300" : "text-teal-700"
              }`}
            >
              Required
            </span>
            <div
              data-testid={`required-toggle-${index}`}
              className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                isRequired
                  ? "bg-green-500"
                  : isDarkMode
                  ? "bg-gray-600"
                  : "bg-gray-300"
              }`}
              onClick={handleRequiredToggle}
            >
              <span
                className={`absolute w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${
                  isRequired ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

const Questionnaire = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { totalScore, updateQuestionnaireScore } = useScore();
  const [leftActive, setLeftActive] = useState(true);
  const [rightActive, setRightActive] = useState(false);
  const { highlightedTexts } = useHighlightedText();
  const {
    selectedTypes,
    setSelectedTypes,
    setEditedQuestions,
    requiredQuestions,
    setRequiredQuestions,
  } = useQuestionType();
  const [uniqueQuestions, setUniqueQuestions] = useState<string[]>([]);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [questionTexts, setQuestionTexts] = useState<string[]>([]);
  const [scoredQuestions, setScoredQuestions] = useState<
    Record<number, { typeScored: boolean; requiredScored: boolean }>
  >({});
  const [bonusAwarded, setBonusAwarded] = useState(false);
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [typeChangedStates, setTypeChangedStates] = useState<boolean[]>([]);
  const tourRef = useRef<ShepherdTour | null>(null);
  const { updateQuestion, determineQuestionType, findPlaceholderByValue } =
    useQuestionEditContext();
  const navigate = useNavigate();
  const prevHighlightedTextsRef = useRef<string[]>([]);

  const SMALL_CONDITION_TEXT = "The Employee may be required to work at other locations.";
  const SMALL_CONDITION_QUESTION = "Does the employee need to work at additional locations besides the normal place of work?";
  const FOLLOW_UP_TEXT = "other locations";
  const FOLLOW_UP_QUESTION = "What is the additional work location?";

  const enhancedDetermineQuestionType = useCallback(
    (text: string) => {
      if (text === SMALL_CONDITION_TEXT) {
        console.log(`Hardcoding type for "${text}": Radio, question: ${SMALL_CONDITION_QUESTION}`);
        return {
          primaryType: "Radio",
          primaryValue: SMALL_CONDITION_QUESTION,
          validTypes: ["Radio"],
          correctType: "Radio",
        };
      }
      if (text === FOLLOW_UP_TEXT) {
        console.log(`Hardcoding type for "${text}": Text, question: ${FOLLOW_UP_QUESTION}`);
        return {
          primaryType: "Text",
          primaryValue: FOLLOW_UP_QUESTION,
          validTypes: ["Text"],
          correctType: "Text",
        };
      }
      if (/yes\/no|radio/i.test(text)) {
        return {
          primaryType: "Radio",
          primaryValue: text,
          validTypes: ["Radio", "Text", "Paragraph"],
          correctType: "Radio",
        };
      }
      const result = determineQuestionType(text);
      console.log(`Determined type for "${text}": primaryType=${result.primaryType}, primaryValue=${result.primaryValue}`);
      return {
        ...result,
        correctType: result.primaryType,
      };
    },
    [determineQuestionType]
  );

  const scoreTypeSelection = useCallback(
    (index: number, selectedType: string) => {
      if (scoredQuestions[index]?.typeScored) return;

      const textValue = uniqueQuestions[index];
      const { correctType } = enhancedDetermineQuestionType(textValue);

      const isEquivalent =
        (selectedType === "Text" && correctType === "Paragraph") ||
        (selectedType === "Paragraph" && correctType === "Text");

      const isCorrect = selectedType === correctType || isEquivalent;
      const points = isCorrect ? 2 : -2;

      updateQuestionnaireScore(points);
      console.log(`Scored type selection for index ${index}: ${points} points`);

      setScoreChange(points);
      setTimeout(() => setScoreChange(null), 2000);

      setScoredQuestions((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          typeScored: true,
          typeCorrect: isCorrect,
        },
      }));
    },
    [uniqueQuestions, enhancedDetermineQuestionType, scoredQuestions, updateQuestionnaireScore]
  );

  const scoreRequiredStatus = useCallback(
    (index: number, isRequired: boolean) => {
      if (isRequired) {
        if (!scoredQuestions[index]?.requiredScored) {
          updateQuestionnaireScore(2);
          console.log(`Required status for "${uniqueQuestions[index]}" set to true, scored +2`);
          setScoreChange(2);
          setTimeout(() => setScoreChange(null), 2000);
          setScoredQuestions((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              requiredScored: true,
              requiredCorrect: true,
            },
          }));
        }
      } else {
        if (scoredQuestions[index]?.requiredScored) {
          updateQuestionnaireScore(-2);
          console.log(`Required status for "${uniqueQuestions[index]}" set to false, scored -2`);
          setScoreChange(-2);
          setTimeout(() => setScoreChange(null), 2000);
          setScoredQuestions((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              requiredScored: false,
              requiredCorrect: false,
            },
          }));
        }
      }
    },
    [updateQuestionnaireScore, scoredQuestions, uniqueQuestions]
  );

  const checkForBonus = useCallback(() => {
    if (uniqueQuestions.length === 0 || bonusAwarded) return;

    const allCorrect = uniqueQuestions.every((text, index) => {
      const { correctType } = enhancedDetermineQuestionType(text);
      const selectedType = selectedTypes[index] ?? "Text";

      const typeCorrect =
        selectedType === correctType ||
        (selectedType === "Text" && correctType === "Paragraph") ||
        (selectedType === "Paragraph" && correctType === "Text");

      const requiredCorrect = requiredQuestions[index];
      return typeCorrect && requiredCorrect;
    });

    if (allCorrect) {
      updateQuestionnaireScore(10);
      console.log(`Bonus awarded: All question types and required statuses are correct. +10 points`);
      setScoreChange(10);
      setTimeout(() => setScoreChange(null), 2000);
      setBonusAwarded(true);
    }
  }, [
    uniqueQuestions,
    selectedTypes,
    requiredQuestions,
    enhancedDetermineQuestionType,
    bonusAwarded,
    updateQuestionnaireScore,
  ]);

  // Shepherd.js tour for Level 1 (Automate Placeholders)
  useEffect(() => {
    const selectedPart = parseInt(localStorage.getItem("selectedPart") || "0", 10);
    if (selectedPart !== 1) return; // Only run tour for Level 1

    const tour = new ShepherdStatic.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: "shadow-md bg-purple-dark",
        scrollTo: { behavior: "smooth", block: "center" },
      },
      useModalOverlay: true,
      confirmCancel: false,
      tourName: `questionnaire-level1-${Date.now()}`,
    });

    tourRef.current = tour;
    (window as any).tourRef = tour; // Store tour in global scope for DivWithDropdown access

    tour.addStep({
      id: "welcome",
      text: `
        <div class="welcome-message">
          <strong class="welcome-title">📝 Welcome to the Questionnaire for Level 1!</strong>
          <p class="welcome-text">Here, you'll create questions for the placeholders you selected.</p>
          <p class="mission-text"><strong>Your mission:</strong> Edit questions for [Employer Name], [Employee Name], and [Agreement Date], set their types, and mark them as required.</p>
        </div>
      `,
      attachTo: { element: document.body, on: "bottom-start" },
      classes: "shepherd-theme-custom animate__animated animate__fadeIn",
      buttons: [
        {
          text: "Start Editing →",
          action: () => {
            sessionStorage.setItem("tourStep", "edit-question-employer-name");
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: "edit-question-employer-name",
      text: "Edit the question text for <strong>Employer Name</strong>. For example, type 'What is the employer's name?'.",
      attachTo: {
        element: document.querySelector(`input[value="Employer Name"]`) ?? document.body,
        on: "bottom",
      },
      buttons: [
        {
          text: "Next →",
          action: () => {
            // Handled by handleQuestionTextChange
          },
        },
      ],
    });

    tour.addStep({
      id: "set-type-employer-name",
      text: "Set the question type for <strong>Employer Name</strong> to <strong>Text</strong>. Click the dropdown and select 'Text'.",
      attachTo: {
        element: document.querySelector(`[data-testid="type-dropdown-0"]`) ?? document.body,
        on: "bottom",
      },
      buttons: [
        {
          text: "Next →",
          action: () => {
            // Handled by handleTypeSelect
          },
        },
      ],
    });

    tour.addStep({
      id: "set-required-employer-name",
      text: "Mark the <strong>Employer Name</strong> question as <strong>Required</strong> by toggling the switch.",
      attachTo: {
        element: document.querySelector(`[data-testid="required-toggle-0"]`) ?? document.body,
        on: "bottom",
      },
      buttons: [
        {
          text: "Next →",
          action: () => {
            // Handled by handleRequiredToggle
          },
        },
      ],
    });

    tour.addStep({
      id: "edit-question-employee-name",
      text: "Now edit the question text for <strong>Employee Name</strong>. For example, type 'What is the employee's name?'.",
      attachTo: {
        element: document.querySelector(`input[value="Employee Name"]`) ?? document.body,
        on: "bottom",
      },
      buttons: [
        {
          text: "Next →",
          action: () => {
            // Handled by handleQuestionTextChange
          },
        },
      ],
    });

    tour.addStep({
      id: "set-type-employee-name",
      text: "Set the question type for <strong>Employee Name</strong> to <strong>Text</strong>. Click the dropdown and select 'Text'.",
      attachTo: {
        element: document.querySelector(`[data-testid="type-dropdown-1"]`) ?? document.body,
        on: "bottom",
      },
      buttons: [
        {
          text: "Next →",
          action: () => {
            // Handled by handleTypeSelect
          },
        },
      ],
    });

    tour.addStep({
      id: "set-required-employee-name",
      text: "Mark the <strong>Employee Name</strong> question as <strong>Required</strong> by toggling the switch.",
      attachTo: {
        element: document.querySelector(`[data-testid="required-toggle-1"]`) ?? document.body,
        on: "bottom",
      },
      buttons: [
        {
          text: "Next →",
          action: () => {
            // Handled by handleRequiredToggle
          },
        },
      ],
    });

    tour.addStep({
      id: "edit-question-agreement-date",
      text: "Edit the question text for <strong>Agreement Date</strong>. For example, type 'What is the agreement date?'.",
      attachTo: {
        element: document.querySelector(`input[value="Agreement Date"]`) ?? document.body,
        on: "bottom",
      },
      buttons: [
        {
          text: "Next →",
          action: () => {
            // Handled by handleQuestionTextChange
          },
        },
      ],
    });

    tour.addStep({
      id: "set-type-agreement-date",
      text: "Set the question type for <strong>Agreement Date</strong> to <strong>Date</strong>. Click the dropdown and select 'Date'.",
      attachTo: {
        element: document.querySelector(`[data-testid="type-dropdown-2"]`) ?? document.body,
        on: "bottom",
      },
      buttons: [
        {
          text: "Next →",
          action: () => {
            // Handled by handleTypeSelect
          },
        },
      ],
    });

    tour.addStep({
      id: "set-required-agreement-date",
      text: "Mark the <strong>Agreement Date</strong> question as <strong>Required</strong> by toggling the switch.",
      attachTo: {
        element: document.querySelector(`[data-testid="required-toggle-2"]`) ?? document.body,
        on: "bottom",
      },
      buttons: [
        {
          text: "Next →",
          action: () => {
            // Handled by handleRequiredToggle
          },
        },
      ],
    });

    tour.addStep({
      id: "click-next-button",
      text: "🎉 Great job! You've completed the Questionnaire setup. Now, click the <strong>Next</strong> button below to proceed to the Live Generation tab and see your document come to life!",
      attachTo: {
        element: document.querySelector(`[data-testid="next-button"]`) ?? document.body,
        on: "top",
      },
      buttons: [
        {
          text: "Finish →",
          action: () => {
            sessionStorage.removeItem("tourStep");
            tour.complete();
          },
        },
      ],
    });

    const initialTourStep = sessionStorage.getItem("tourStep") || "welcome";
    if (initialTourStep) {
      tour.start();
      tour.show(initialTourStep);
    }

    return () => {
      tour.complete();
      delete (window as any).tourRef;
    };
  }, [navigate]);

  useEffect(() => {
    const normalizedHighlightedTexts = highlightedTexts.map((text) =>
      text
        .replace(/[{}]/g, "")
        .replace(/\[|\]/g, "")
        .replace(/\/\//g, "")
        .replace(/\//g, "")
        .trim()
    );
    const uniqueHighlightedTexts = [...new Set(normalizedHighlightedTexts)];
    console.log("Raw highlightedTexts:", highlightedTexts);
    console.log("Normalized highlightedTexts:", normalizedHighlightedTexts);
    console.log("Unique highlightedTexts:", uniqueHighlightedTexts);

    if (
      JSON.stringify(uniqueHighlightedTexts) !==
      JSON.stringify(prevHighlightedTextsRef.current)
    ) {
      console.log("highlightedTexts changed, updating uniqueQuestions");
      setUniqueQuestions(uniqueHighlightedTexts);
      setQuestionOrder(uniqueHighlightedTexts.map((_, index) => index));
      setQuestionTexts(uniqueHighlightedTexts.map((text) => text));
      setSelectedTypes(
        uniqueHighlightedTexts.map((text) => {
          const { primaryType } = enhancedDetermineQuestionType(text);
          return primaryType || "Text";
        })
      );
      setEditedQuestions(
        uniqueHighlightedTexts.map((text) => {
          const { primaryValue } = enhancedDetermineQuestionType(text);
          return primaryValue || text;
        })
      );
      setRequiredQuestions(new Array(uniqueHighlightedTexts.length).fill(false));
      setTypeChangedStates(new Array(uniqueHighlightedTexts.length).fill(false));
      setScoredQuestions({});
      setBonusAwarded(false);
      prevHighlightedTextsRef.current = uniqueHighlightedTexts;
    }
  }, [
    highlightedTexts,
    enhancedDetermineQuestionType,
    setSelectedTypes,
    setEditedQuestions,
    setRequiredQuestions,
  ]);

  useEffect(() => {
    checkForBonus();
  }, [checkForBonus]);

  const handleTypeChange = (index: number, type: string) => {
    setSelectedTypes((prev) => {
      const newTypes = [...prev];
      newTypes[index] = type;
      return newTypes;
    });
    
    const textValue = uniqueQuestions[index];
    const { primaryType: determinedPrimaryType } = determineQuestionType(textValue);
    const placeholder = findPlaceholderByValue(textValue);

    if (placeholder && determinedPrimaryType) {
      const typeKey: QuestionType = getQuestionType(determinedPrimaryType);
      updateQuestion(typeKey, placeholder, questionTexts[index]);
    }

    scoreTypeSelection(index, type);
  };

  const handleTypeChanged = (index: number, changed: boolean) => {
    setTypeChangedStates((prev) => {
      const newStates = [...prev];
      newStates[index] = changed;
      return newStates;
    });
  };

  const handleQuestionTextChange = (index: number, newText: string) => {
    setQuestionTexts((prev) => {
      const newTexts = [...prev];
      newTexts[index] = newText;
      return newTexts;
    });
    setEditedQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[index] = newText;
      return newQuestions;
    });
  };

  const handleRequiredChange = (index: number, required: boolean) => {
    setRequiredQuestions((prev) => {
      const newRequired = [...prev];
      newRequired[index] = required;
      return newRequired;
    });
    scoreRequiredStatus(index, required);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questionOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuestionOrder(items);
  };

  const handleNext = () => {
    navigate("/live-generation");
  };

  const handlePrevious = () => {
    navigate("/highlight-text");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50"
      }`}
    >
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className={`text-4xl font-bold mb-4 ${
              isDarkMode ? "text-teal-200" : "text-teal-800"
            }`}
          >
            Create Your Questionnaire
          </h1>
          <p
            className={`text-lg ${
              isDarkMode ? "text-teal-300" : "text-teal-600"
            }`}
          >
            Transform your highlighted text into interactive questions
          </p>
          {scoreChange !== null && (
            <div
              className={`inline-block px-4 py-2 rounded-full text-white font-semibold text-lg ${
                scoreChange > 0 ? "bg-green-500" : "bg-red-500"
              } animate-pulse`}
            >
              {scoreChange > 0 ? "+" : ""}{scoreChange} points
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="text-center mb-8">
          <div
            className={`inline-block px-6 py-3 rounded-xl font-bold text-xl ${
              isDarkMode
                ? "bg-gray-700 text-teal-200 border-2 border-teal-400"
                : "bg-white text-teal-800 border-2 border-teal-300 shadow-lg"
            }`}
          >
            Total Score: {totalScore}
          </div>
        </div>

        {/* Questions List */}
        <div className="max-w-4xl mx-auto mb-12">
          {uniqueQuestions.length > 0 ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {questionOrder.map((questionIndex, index) => {
                      const question = uniqueQuestions[questionIndex];
                      const isFollowUp = question === FOLLOW_UP_TEXT;
                      return (
                        <Draggable
                          key={`question-${questionIndex}`}
                          draggableId={`question-${questionIndex}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-8"
                            >
                              <DivWithDropdown
                                textValue={question}
                                index={questionIndex}
                                onTypeChange={handleTypeChange}
                                onTypeChanged={handleTypeChanged}
                                onQuestionTextChange={handleQuestionTextChange}
                                onRequiredChange={handleRequiredChange}
                                initialQuestionText={questionTexts[questionIndex]}
                                initialType={selectedTypes[questionIndex]}
                                initialRequired={requiredQuestions[questionIndex]}
                                initialTypeChanged={typeChangedStates[questionIndex]}
                                isFollowUp={isFollowUp}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div
              className={`text-center py-12 rounded-xl ${
                isDarkMode
                  ? "bg-gray-700 text-teal-200"
                  : "bg-white text-teal-600 shadow-lg"
              }`}
            >
              <p className="text-xl">No highlighted text found</p>
              <p className="text-sm mt-2 opacity-70">
                Go back to the previous step to highlight some text first
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between max-w-4xl mx-auto">
          <button
            onClick={handlePrevious}
            className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
              isDarkMode
                ? "bg-gray-700 text-teal-200 hover:bg-gray-600 border-2 border-teal-400"
                : "bg-white text-teal-800 hover:bg-teal-50 border-2 border-teal-300 shadow-lg"
            }`}
          >
            <FaChevronLeft />
            <span>Previous</span>
          </button>
          <button
            data-testid="next-button"
            onClick={handleNext}
            className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
              isDarkMode
                ? "bg-teal-600 text-white hover:bg-teal-500"
                : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg"
            }`}
          >
            <span>Next</span>
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
