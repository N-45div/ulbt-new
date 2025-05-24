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

// Map primaryType to QuestionType with strict validation
const mapPrimaryTypeToQuestionType = (primaryType: string | undefined): QuestionType => {
  if (!primaryType) {
    console.warn("primaryType is undefined, defaulting to textTypes");
    return "textTypes";
  }
  const lowerType = primaryType.toLowerCase();
  const validTypes: QuestionType[] = ["textTypes", "numberTypes", "dateTypes", "radioTypes"];
  const typeMap: Record<string, QuestionType> = {
    text: "textTypes",
    paragraph: "textTypes",
    number: "numberTypes",
    date: "dateTypes",
    radio: "radioTypes",
  };
  const mappedType = typeMap[lowerType] || "textTypes";
  if (!validTypes.includes(mappedType)) {
    console.warn(`Unknown primaryType "${primaryType}", defaulting to textTypes`);
    return "textTypes";
  }
  return mappedType;
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
    const { primaryType } = determineQuestionType(oldText);
    const placeholder = findPlaceholderByValue(oldText);

    // Ensure primaryType is valid before mapping
    const validPrimaryTypes = ["Text", "Paragraph", "Number", "Date", "Radio"];
    if (placeholder && primaryType && validPrimaryTypes.includes(primaryType)) {
      const typeKey = mapPrimaryTypeToQuestionType(primaryType);
      updateQuestion(typeKey, placeholder, newText);
    } else {
      console.warn(`Skipping updateQuestion: Invalid primaryType "${primaryType}" or placeholder "${placeholder}" for oldText "${oldText}"`);
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
      JSON.stringify(uniqueHighlightedTexts) ===
      JSON.stringify(prevHighlightedTextsRef.current)
    ) {
      console.log("No change in highlightedTexts, skipping state updates");
      return;
    }

    prevHighlightedTextsRef.current = uniqueHighlightedTexts;

    let savedState: Record<string, {
      type: string;
      typeChanged: boolean;
      questionText: string;
      required: boolean;
      scored: { typeScored: boolean; requiredScored: boolean };
      order: number;
    }> = {};

    const savedStateData = sessionStorage.getItem("questionnaireState");
    if (savedStateData) {
      try {
        savedState = JSON.parse(savedStateData);
        console.log("Loaded saved state from sessionStorage:", savedState);
      } catch (error) {
        console.error("Error parsing sessionStorage data:", error);
      }
    }

    const processedTexts: string[] = [];
    const hasSmallCondition = uniqueHighlightedTexts.includes(SMALL_CONDITION_TEXT);
    const hasFollowUp = uniqueHighlightedTexts.includes(FOLLOW_UP_TEXT);

    if (hasSmallCondition) {
      processedTexts.push(SMALL_CONDITION_TEXT);
      console.log("Small condition detected, added to processedTexts");
      if (hasFollowUp) {
        processedTexts.push(FOLLOW_UP_TEXT);
        console.log("Follow-up detected, added to processedTexts");
      }
    }

    uniqueHighlightedTexts.forEach((text) => {
      if (text !== SMALL_CONDITION_TEXT && text !== FOLLOW_UP_TEXT && !processedTexts.includes(text)) {
        processedTexts.push(text);
        console.log(`Added non-duplicate text to processedTexts: "${text}"`);
      }
    });

    console.log("Processed texts:", processedTexts);

    if (
      processedTexts.length === uniqueQuestions.length &&
      processedTexts.every((text, i) => text === uniqueQuestions[i])
    ) {
      console.log("No changes in processed texts, skipping state updates");
      return;
    }

    const newUniqueQuestions = processedTexts;
    const newQuestionTexts: string[] = [];
    const newSelectedTypes: string[] = [];
    const newTypeChangedStates: boolean[] = [];
    const newRequiredQuestions: boolean[] = [];
    const newScoredQuestions: Record<
      number,
      { typeScored: boolean; requiredScored: boolean }
    > = {};
    const newQuestionOrder: number[] = [];
    const newState: Record<string, {
      type: string;
      typeChanged: boolean;
      questionText: string;
      required: boolean;
      scored: { typeScored: boolean; requiredScored: boolean };
      order: number;
    }> = {};

    processedTexts.forEach((text, i) => {
      const { primaryValue, primaryType } = enhancedDetermineQuestionType(text);
      const saved = savedState[text];
      const existingIndex = uniqueQuestions.indexOf(text);
      const existing = existingIndex !== -1;

      console.log(`Processing text "${text}": primaryValue=${primaryValue}, primaryType=${primaryType}`);

      if (saved) {
        newQuestionTexts.push(saved.questionText);
        newSelectedTypes.push(saved.type);
        newTypeChangedStates.push(saved.typeChanged);
        newRequiredQuestions.push(saved.required);
        newScoredQuestions[i] = saved.scored;
        newQuestionOrder.push(saved.order);
        newState[text] = { ...saved };
        console.log(
          `Restored saved state for "${text}": type=${saved.type}, questionText=${saved.questionText}`
        );
      } else if (existing) {
        const existingType = selectedTypes[existingIndex] ?? "Text";
        newQuestionTexts.push(questionTexts[existingIndex]);
        newSelectedTypes.push(existingType);
        newTypeChangedStates.push(typeChangedStates[existingIndex]);
        newRequiredQuestions.push(requiredQuestions[existingIndex]);
        newScoredQuestions[i] = scoredQuestions[existingIndex] || {
          typeScored: false,
          requiredScored: false,
        };
        newQuestionOrder.push(questionOrder[existingIndex] !== undefined ? questionOrder[existingIndex] : i);
        newState[text] = {
          type: existingType,
          typeChanged: typeChangedStates[existingIndex],
          questionText: questionTexts[existingIndex],
          required: requiredQuestions[existingIndex],
          scored: scoredQuestions[existingIndex] || {
            typeScored: false,
            requiredScored: false,
          },
          order: questionOrder[existingIndex] !== undefined ? questionOrder[existingIndex] : i,
        };
        console.log(
          `Preserved existing state for "${text}": type=${existingType}, questionText=${questionTexts[existingIndex]}`
        );
      } else {
        newQuestionTexts.push(primaryValue || "No text selected");
        newSelectedTypes.push(primaryType || "Text");
        newTypeChangedStates.push(false);
        newRequiredQuestions.push(false);
        newScoredQuestions[i] = { typeScored: false, requiredScored: false };
        newQuestionOrder.push(i);
        newState[text] = {
          type: primaryType || "Text",
          typeChanged: false,
          questionText: primaryValue || "No text selected",
          required: false,
          scored: { typeScored: false, requiredScored: false },
          order: i,
        };
        console.log(
          `Initialized new question "${text}": type=${primaryType || "Text"}, questionText=${primaryValue || "No text selected"}`
        );
      }
    });

    setUniqueQuestions(newUniqueQuestions);
    setQuestionTexts(newQuestionTexts);
    setSelectedTypes(newSelectedTypes);
    setTypeChangedStates(newTypeChangedStates);
    setRequiredQuestions(newRequiredQuestions);
    setScoredQuestions(newScoredQuestions);
    setQuestionOrder(newQuestionOrder);
    setEditedQuestions(newQuestionTexts);
    setBonusAwarded(false);

    console.log("Final uniqueQuestions:", newUniqueQuestions);
    console.log("Final questionTexts:", newQuestionTexts);
    console.log("Final selectedTypes:", newSelectedTypes);

    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));
  }, [
    highlightedTexts,
    enhancedDetermineQuestionType,
    determineQuestionType,
    setSelectedTypes,
    setEditedQuestions,
    setRequiredQuestions,
    uniqueQuestions,
    selectedTypes,
    typeChangedStates,
    questionTexts,
    requiredQuestions,
    scoredQuestions,
    questionOrder,
  ]);

  useEffect(() => {
    checkForBonus();
  }, [checkForBonus]);

  const handleTypeChange = (index: number, type: string) => {
    const newTypes = [...selectedTypes];
    newTypes[index] = type;
    setSelectedTypes(newTypes);

    sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypes));

    const newState = {
      ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        type,
        typeChanged: true,
      },
    };
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));
    scoreTypeSelection(index, type);

    const textValue = uniqueQuestions[index];
    const { primaryValue } = enhancedDetermineQuestionType(textValue);
    const newTexts = [...questionTexts];

    if (
      newTexts[index] === primaryValue ||
      newTexts[index] === "No text selected"
    ) {
      newTexts[index] = primaryValue || "No text selected";
      setQuestionTexts(newTexts);
      setEditedQuestions(newTexts);
      newState[uniqueQuestions[index]] = {
        ...newState[uniqueQuestions[index]],
        questionText: newTexts[index],
      };
      sessionStorage.setItem("questionnaireState", JSON.stringify(newState));
    }
    console.log(`Type changed for index ${index} to: ${type}`);
  };

  const handleTypeChanged = (index: number, changed: boolean) => {
    const newTypeChangedStates = [...typeChangedStates];
    newTypeChangedStates[index] = changed;
    setTypeChangedStates(newTypeChangedStates);

    const newState = {
      ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        typeChanged: changed,
      },
    };
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));
    console.log(
      `Updated typeChangedStates after change at index ${index}:`,
      newTypeChangedStates
    );
  };

  const handleQuestionTextChange = (index: number, newText: string) => {
    const oldText = questionTexts[index];
    const newTexts = [...questionTexts];
    newTexts[index] = newText;
    setQuestionTexts(newTexts);
    setEditedQuestions(newTexts);

    const newState = {
      ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        questionText: newText,
      },
    };
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));

    const placeholder = findPlaceholderByValue(oldText) || "undefined";
    const { primaryType } = determineQuestionType(placeholder);

    // Ensure primaryType is valid before mapping
    const validPrimaryTypes = ["Text", "Paragraph", "Number", "Date", "Radio"];
    if (placeholder && primaryType && validPrimaryTypes.includes(primaryType)) {
      const typeKey = mapPrimaryTypeToQuestionType(primaryType);
      updateQuestion(typeKey, placeholder, newText);
    } else {
      console.warn(`Skipping updateQuestion: Invalid primaryType "${primaryType}" or placeholder "${placeholder}" for oldText "${oldText}"`);
    }
    console.log(`Question text changed for index ${index} to: ${newText}`);
  };

  const handleRequiredChange = (index: number, required: boolean) => {
    const newRequired = [...requiredQuestions];
    newRequired[index] = required;
    setRequiredQuestions(newRequired);

    const newState = {
      ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}"),
      [uniqueQuestions[index]]: {
        ...JSON.parse(sessionStorage.getItem("questionnaireState") || "{}")[uniqueQuestions[index]],
        required,
      },
    };
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));

    scoreRequiredStatus(index, required);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const newOrder = [...questionOrder];
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    setQuestionOrder(newOrder);

    const newUniqueQuestions = newOrder.map((index) => uniqueQuestions[index]);
    const newQuestionTexts = newOrder.map((index) => questionTexts[index]);
    const newSelectedTypes = newOrder.map((index) => selectedTypes[index] ?? "Text");
    const newRequiredQuestions = newOrder.map(
      (index) => requiredQuestions[index]
    );
    const newTypeChangedStates = newOrder.map(
      (index) => typeChangedStates[index]
    );
    const newScoredQuestions = Object.fromEntries(
      newOrder.map((originalIndex, newIndex) => [
        newIndex,
        scoredQuestions[originalIndex] || {
          typeScored: false,
          requiredScored: false,
        },
      ])
    );

    setUniqueQuestions(newUniqueQuestions);
    setQuestionTexts(newQuestionTexts);
    setSelectedTypes(newSelectedTypes);
    setRequiredQuestions(newRequiredQuestions);
    setTypeChangedStates(newTypeChangedStates);
    setScoredQuestions(newScoredQuestions);

    const newState: Record<string, {
      type: string;
      typeChanged: boolean;
      questionText: string;
      required: boolean;
      scored: { typeScored: boolean; requiredScored: boolean };
      order: number;
    }> = {};
    newUniqueQuestions.forEach((text, i) => {
      newState[text] = {
        type: newSelectedTypes[i],
        typeChanged: newTypeChangedStates[i],
        questionText: newQuestionTexts[i],
        required: newRequiredQuestions[i],
        scored: newScoredQuestions[i],
        order: newOrder[i],
      };
    });
    sessionStorage.setItem("questionnaireState", JSON.stringify(newState));

    console.log("Questions reordered. New order:", newOrder);
  };

  const handleNextClick = () => {
    sessionStorage.setItem("questionOrder_2", JSON.stringify(questionOrder));
    sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(selectedTypes));
    navigate("/Live_Generation");
    console.log("Navigating to Live Generation tab");
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
            setUniqueQuestions([]);
            setSelectedTypes([]);
            setTypeChangedStates([]);
            setQuestionTexts([]);
            setRequiredQuestions([]);
            setQuestionOrder([]);
            setScoredQuestions({});
            setBonusAwarded(false);
            prevHighlightedTextsRef.current = [];
            console.log("Full reset: sessionStorage cleared, all states reset");
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
          data-testid="next-button"
          onClick={handleNextClick}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-teal-700 text-teal-200 hover:bg-teal-600"
              : "bg-teal-600 text-white hover:bg-teal-500"
          }`}
        >
          Next
        </button>
      </div>

      <div className="fixed top-16 left-6 z-50 px-6 py-3">
        <div
          className={`p-3 rounded-full shadow-lg flex items-center ${
            isDarkMode ? "bg-gray-700 text-white" : "bg-teal-500 text-white"
          }`}
        >
          <span className="font-bold mr-2">Score:</span> {totalScore}
          {scoreChange !== null && (
            <span
              className={`ml-2 text-sm font-bold ${
                scoreChange > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
            </span>
          )}
        </div>
      </div>

      <div
        className={`absolute top-16 right-6 w-80 h-12 rounded-xl shadow-lg flex items-center justify-center text-sm font-semibold z-20 ${
          isDarkMode
            ? "bg-gradient-to-r from-gray-700 to-gray-800 text-teal-200"
            : "bg-gradient-to-r from-teal-200 to-cyan-200 text-teal-900"
        }`}
      >
        <div className="flex items-center space-x-6">
          <div
            className={`flex items-center space-x-2 ${
              leftActive
                ? isDarkMode
                  ? "text-teal-400"
                  : "text-teal-600"
                : isDarkMode
                ? "text-cyan-400"
                : "text-cyan-500"
            } transition-all duration-300`}
          >
            <span>Employer</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setLeftActive(true);
                setRightActive(false);
              }}
              className={`${
                isDarkMode
                  ? "text-teal-400 hover:text-cyan-400"
                  : "text-teal-600 hover:text-cyan-500"
              } transform hover:scale-110 transition-all duration-300`}
            >
              <FaChevronLeft className="text-xl" />
            </button>
            <button
              onClick={() => {
                setRightActive(true);
                setLeftActive(false);
              }}
              className={`${
                isDarkMode
                  ? "text-teal-400 hover:text-cyan-400"
                  : "text-teal-600 hover:text-cyan-500"
              } transform hover:scale-110 transition-all duration-300`}
            >
              <FaChevronRight className="text-xl" />
            </button>
          </div>
          <div
            className={`flex items-center space-x-2 ${
              rightActive
                ? isDarkMode
                  ? "text-teal-400"
                  : "text-teal-600"
                : isDarkMode
                ? "text-cyan-400"
                : "text-cyan-500"
            } transition-all duration-300`}
          >
            <span>Employee</span>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-y-auto">
        <div className="space-y-12 w-full max-w-4xl">
          {uniqueQuestions.length > 0 ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {questionOrder.map((originalIndex, displayIndex) => {
                      const text = uniqueQuestions[originalIndex];
                      const { primaryValue } = enhancedDetermineQuestionType(text);
                      console.log(`Rendering question ${displayIndex}: text="${text}", questionText="${questionTexts[originalIndex]}"`);
                      return (
                        <Draggable
                          key={primaryValue || `question-${originalIndex}`}
                          draggableId={
                            primaryValue || `question-${originalIndex}`
                          }
                          index={displayIndex}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <DivWithDropdown
                                textValue={text}
                                index={originalIndex}
                                onTypeChange={handleTypeChange}
                                onTypeChanged={handleTypeChanged}
                                onQuestionTextChange={handleQuestionTextChange}
                                onRequiredChange={handleRequiredChange}
                                initialQuestionText={
                                  questionTexts[originalIndex] ||
                                  "No text selected"
                                }
                                initialType={
                                  selectedTypes[originalIndex] ?? "Text"
                                }
                                initialRequired={
                                  requiredQuestions[originalIndex] || false
                                }
                                initialTypeChanged={
                                  typeChangedStates[originalIndex] || false
                                }
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
                No text has been selected yet.
              </p>
              <p
                className={`text-sm mt-2 ${
                  isDarkMode ? "text-teal-400" : "text-teal-500"
                }`}
              >
                Go to the Document tab and select text to generate questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
