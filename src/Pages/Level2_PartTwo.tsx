import { FaPenToSquare } from "react-icons/fa6";
import { TbSettingsMinus, TbSettingsPlus } from "react-icons/tb";
import { useState, useContext, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useQuestionType } from "../context/QuestionTypeContext";
import { documentText } from "../utils/EmploymentAgreement";
import { determineQuestionType } from "../utils/questionTypeUtils";
import { ThemeContext } from "../context/ThemeContext";
import AIAnalysisPanel from "../components/AIAnalysisPanel";
import { useLocation, useNavigate } from "react-router";
import { CrispChat } from "../bot/knowledge";
import { useScore } from "../context/ScoreContext";
import { parse, HTMLReactParserOptions } from "html-react-parser";
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

const icons = [
  { icon: <FaPenToSquare />, label: "Edit PlaceHolder" },
  { icon: <TbSettingsMinus />, label: "Small Condition" },
  { icon: <TbSettingsPlus />, label: "Big Condition" },
];

const LevelTwoPart_Two = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const [tooltip, setTooltip] = useState<string | null>(null);
  const { highlightedTexts, addHighlightedText } = useHighlightedText();
  const { selectedTypes, setSelectedTypes } = useQuestionType();
  const documentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isProcessingRef = useRef(false); // Prevent double-clicks
  const tourRef = useRef<ShepherdTour | null>(null);

  // Scoring system
  const { totalScore, levelTwoScore, setLevelTwoScore } = useScore();
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [foundPlaceholders, setFoundPlaceholders] = useState<string[]>([]);
  const [foundSmallConditions, setFoundSmallConditions] = useState<string[]>([]);
  const [foundBigConditions, setFoundBigConditions] = useState<string[]>([]);

  // Sync local score with levelTwoScore
  useEffect(() => {
    console.log(`levelTwoScore updated to ${levelTwoScore}`);
  }, [levelTwoScore]);

  useEffect(() => {
    console.log("LevelTwoPart_Two - Rendering at:", location.pathname);
    sessionStorage.removeItem("level");
    sessionStorage.setItem("level", location.pathname);

    const savedTypes = sessionStorage.getItem("selectedQuestionTypes");
    if (!savedTypes && highlightedTexts.length > 0) {
      const initialTypes = highlightedTexts.map(() => "Text");
      setSelectedTypes(initialTypes);
      sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(initialTypes));
    }
  }, [location.pathname, highlightedTexts, setSelectedTypes]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("selectedQuestionTypes_2");
      sessionStorage.removeItem("typeChangedStates_2");
      sessionStorage.removeItem("questionOrder_2");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const getDocumentText = () => {
    return documentRef.current?.textContent || "";
  };

  const simulateEditPlaceholderClick = (): void => {
    const editPlaceholderButton = document.querySelector("#edit-placeholder") as HTMLButtonElement | null;
    if (editPlaceholderButton) {
      editPlaceholderButton.click();
    }
  };

  const handleIconClick = (label: string) => {
    if (isProcessingRef.current) {
      console.log("Click ignored: Processing another click");
      return;
    }
    isProcessingRef.current = true;

    console.log(`handleIconClick triggered for label: ${label}`);

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      console.log("No selection or range found");
      isProcessingRef.current = false;
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    let textWithoutBrackets = selectedText;
    let hasValidBrackets = false;
    let hasValidSpanClass = false;
    let fullPlaceholderText: string | null = null;

    // Check for placeholders with square brackets
    if (selectedText.startsWith("[") && selectedText.endsWith("]")) {
      textWithoutBrackets = selectedText.slice(1, -1); // Remove [ and ]
      hasValidBrackets = true;
      hasValidSpanClass = true;
    } else if (selectedText.startsWith("{") && selectedText.endsWith("}")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      if (label === "Small Condition") {
        textWithoutBrackets = textWithoutBrackets.replace(/\//g, "").trim();
        console.log("Normalized Small Condition text:", textWithoutBrackets);
      }
      hasValidBrackets = true;
      console.log("Selected text with curly brackets:", textWithoutBrackets);
    } else if (selectedText.startsWith("(") && selectedText.endsWith(")")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
    } else {
      const node = selection.anchorNode;
      if (node && node.parentElement) {
        const parent = node.parentElement;
        const classList = Array.from(parent.classList);
        const placeholderClass = classList.find((cls) =>
          cls.startsWith("placeholder-")
        );

        if (placeholderClass) {
          hasValidSpanClass = true;
          fullPlaceholderText = parent.textContent || selectedText;
          textWithoutBrackets = fullPlaceholderText;

          console.log(`Selected text: "${selectedText}"`);
          console.log(`Full placeholder text: "${fullPlaceholderText}"`);
          if (selectedText !== fullPlaceholderText) {
            console.log(
              `Selected text "${selectedText}" does not match full placeholder "${fullPlaceholderText}". Aborting.`
            );
            isProcessingRef.current = false;
            return;
          }
        }
      }
    }

    if (
      (label === "Edit PlaceHolder" && !hasValidSpanClass && !hasValidBrackets) ||
      ((label === "Small Condition" || label === "Big Condition") &&
        !hasValidBrackets)
    ) {
      console.log("Selected text does not have valid brackets:", selectedText);
      isProcessingRef.current = false;
      return;
    }

    // Scoring validation
    const isCorrectButton =
      (label === "Edit PlaceHolder" && (hasValidSpanClass || hasValidBrackets)) ||
      (label === "Small Condition" && hasValidBrackets) ||
      (label === "Big Condition" && hasValidBrackets);

    if (isCorrectButton) {
      if (
        label === "Edit PlaceHolder" &&
        !foundPlaceholders.includes(textWithoutBrackets)
      ) {
        const newScore = levelTwoScore + 3;
        console.log(`Edit PlaceHolder: Setting score to ${newScore}`);
        setLevelTwoScore(newScore);
        setScoreChange(3);
        setTimeout(() => {
          console.log("Resetting scoreChange");
          setScoreChange(null);
        }, 2000);
        setFoundPlaceholders((prev) => [...prev, textWithoutBrackets]);
      } else if (
        label === "Small Condition" &&
        !foundSmallConditions.includes(textWithoutBrackets)
      ) {
        const newScore = levelTwoScore + 3;
        console.log(`Small Condition: Setting score to ${newScore}`);
        setLevelTwoScore(newScore);
        setScoreChange(3);
        setTimeout(() => {
          console.log("Resetting scoreChange");
          setScoreChange(null);
        }, 2000);
        setFoundSmallConditions((prev) => [...prev, textWithoutBrackets]);
      } else if (
        label === "Big Condition" &&
        !foundBigConditions.includes(textWithoutBrackets)
      ) {
        const newScore = levelTwoScore + 3;
        console.log(`Big Condition: Setting score to ${newScore}`);
        setLevelTwoScore(newScore);
        setScoreChange(3);
        setTimeout(() => {
          console.log("Resetting scoreChange");
          setScoreChange(null);
        }, 2000);
        setFoundBigConditions((prev) => [...prev, textWithoutBrackets]);
      } else {
        console.log(`Already scored for ${label}: ${textWithoutBrackets}`);
      }
    } else {
      console.log(`Incorrect button for ${label}: Deducting 2 points`);
      const newScore = Math.max(0, levelTwoScore - 2);
      console.log(`Incorrect selection: Setting score to ${newScore}`);
      setLevelTwoScore(newScore);
      setScoreChange(-2);
      setTimeout(() => {
        console.log("Resetting scoreChange");
        setScoreChange(null);
      }, 2000);
    }

    if (label === "Edit PlaceHolder") {
      if (highlightedTexts.includes(textWithoutBrackets)) {
        console.log("Placeholder already highlighted:", textWithoutBrackets);
        alert("This placeholder has already been added!");
        isProcessingRef.current = false;
        return;
      }
      console.log("Selected Edit Placeholder:", textWithoutBrackets);
      addHighlightedText(textWithoutBrackets);
      const newTypes = [...selectedTypes, "Text"];
      setSelectedTypes(newTypes);
      sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypes));

      const span = document.createElement("span");
      span.style.backgroundColor = isDarkMode
        ? "rgba(255, 245, 157, 0.5)"
        : "rgba(255, 245, 157, 0.7)";
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);

      const currentStep = sessionStorage.getItem("tourStep") || "welcome";
      if (currentStep === "edit-placeholder-employer-name" && textWithoutBrackets === "Employer Name") {
        sessionStorage.setItem("tourStep", "selected-placeholder-employer-name");
        tourRef.current?.show("selected-placeholder-employer-name");
      } else if (currentStep === "edit-placeholder-employee-name" && textWithoutBrackets === "Employee Name") {
        sessionStorage.setItem("tourStep", "selected-placeholder-employee-name");
        tourRef.current?.show("selected-placeholder-employee-name");
      } else if (currentStep === "edit-placeholder-agreement-date" && textWithoutBrackets === "Agreement Date") {
        sessionStorage.setItem("tourStep", "selected-placeholder-agreement-date");
        tourRef.current?.show("selected-placeholder-agreement-date");
      }
    } else if (label === "Small Condition") {
      if (
        !(selectedText.startsWith("{") && selectedText.endsWith("}")) ||
        selectedText.length < 35 ||
        selectedText.length > 450
      ) {
        console.log("Invalid Small Condition selection:", selectedText);
        isProcessingRef.current = false;
        return;
      }
      if (
        !highlightedTexts.includes(textWithoutBrackets) &&
        !(
          highlightedTexts.includes(
            "The Employee shall not receive additional payment for overtime worked"
          ) &&
          textWithoutBrackets ===
            "The Employee is entitled to overtime pay for authorized overtime work"
        ) &&
        !(
          highlightedTexts.includes(
            "The Employee is entitled to overtime pay for authorized overtime work"
          ) &&
          textWithoutBrackets ===
            "The Employee shall not receive additional payment for overtime worked"
        )
      ) {
        addHighlightedText(textWithoutBrackets);
        const newTypes = [...selectedTypes, "Text"];
        setSelectedTypes(newTypes);
        sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypes));
      }
      const span = document.createElement("span");
      span.style.backgroundColor = isDarkMode
        ? "rgba(129, 236, 236, 0.5)"
        : "rgba(129, 236, 236, 0.7)";
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
    } else if (label === "Big Condition") {
      if (!(selectedText.startsWith("(") && selectedText.endsWith(")"))) {
        console.log("Invalid Big Condition selection:", selectedText);
        isProcessingRef.current = false;
        return;
      }
      console.log("Selected Big Condition:", selectedText);

      let clauseContent = textWithoutBrackets;
      const headingsToStrip = ["PROBATIONARY PERIOD", "PENSION"];
      for (const heading of headingsToStrip) {
        if (textWithoutBrackets.startsWith(heading)) {
          clauseContent = textWithoutBrackets.slice(heading.length).trim();
          console.log(
            `Stripped heading '${heading}', clauseContent:`,
            clauseContent
          );
          break;
        }
      }

      addHighlightedText(clauseContent);
      const newTypes = [...selectedTypes, "Text"];
      setSelectedTypes(newTypes);
      sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypes));

      const fragment = document.createDocumentFragment();
      const contents = range.cloneContents();
      const applyHighlight = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const span = document.createElement("span");
          span.style.backgroundColor = isDarkMode
            ? "rgba(186, 220, 88, 0.5)"
            : "rgba(186, 220, 88, 0.7)";
          span.textContent = node.textContent || "";
          return span;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const newElement = document.createElement(element.tagName);
          for (const attr of element.attributes) {
            newElement.setAttribute(attr.name, attr.value);
          }
          element.childNodes.forEach((child) => {
            const newChild = applyHighlight(child);
            if (newChild) newElement.appendChild(newChild);
          });
          return newElement;
        }
        return null;
      };

      contents.childNodes.forEach((node) => {
        const newNode = applyHighlight(node);
        if (newNode) fragment.appendChild(newNode);
      });

      range.deleteContents();
      range.insertNode(fragment);

      const probationClauseContent =
        "The first Probation Period Length of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.";
      const pensionClauseContent =
        "The Employee will be enrolled in the Company’s pension scheme in accordance with auto-enrolment legislation.";

      const normalizeText = (text: string): string => text.replace(/\s+/g, "");
      const normalizedSelectedText = normalizeText(clauseContent);
      const normalizedProbationClause = normalizeText(probationClauseContent);
      const normalizedPensionClause = normalizeText(pensionClauseContent);

      if (normalizedSelectedText === normalizedProbationClause) {
        console.log("Probation Clause matched, adding question");
        addHighlightedText("Is the clause of probationary period applicable?");
        const newTypesWithQuestion = [...newTypes, "Text"];
        setSelectedTypes(newTypesWithQuestion);
        sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypesWithQuestion));
      } else if (normalizedSelectedText === normalizedPensionClause) {
        console.log("Pension Clause matched, adding question");
        addHighlightedText("Is the Pension clause applicable?");
        const newTypesWithQuestion = [...newTypes, "Text"];
        setSelectedTypes(newTypesWithQuestion);
        sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypesWithQuestion));
      }
    }

    isProcessingRef.current = false;
  };

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
      tourName: `level-two-part-two-level1-${Date.now()}`,
    });

    tourRef.current = tour;

    tour.addStep({
      id: "welcome",
      text: `
        <div class="welcome-message">
          <strong class="welcome-title">🚀 Welcome to Level 1: Automate Placeholders!</strong>
          <p class="welcome-text">Let's learn how to automate placeholders in an employment agreement.</p>
          <p class="mission-text"><strong>Your mission:</strong> Automate placeholders like [Employer Name], [Employee Name], and [Agreement Date].</p>
        </div>
      `,
      attachTo: { element: document.body, on: "bottom-start" },
      classes: "shepherd-theme-custom animate__animated animate__fadeIn",
      buttons: [
        {
          text: "Start Learning →",
          action: () => {
            sessionStorage.setItem("tourStep", "placeholders");
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: "placeholders",
      text: "Notice the text in <strong>[square brackets]</strong>, like <strong>[Employer Name]</strong>? These are placeholders. Let's automate <strong>[Employer Name]</strong> by selecting it and clicking the 'Edit Placeholder' button.",
      attachTo: { element: document.body, on: "bottom-start" },
      buttons: [
        {
          text: "Next →",
          action: () => {
            sessionStorage.setItem("tourStep", "select-employer-name");
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: "select-employer-name",
      text: "Select <strong>[Employer Name]</strong> in the 'PARTIES' section (under 'Employer:') without spaces before or after the square brackets [].",
      attachTo: {
        element: document.querySelector("#employer-name-placeholder") ?? document.body,
        on: "right",
      },
      buttons: [
        {
          text: "Verify Selection ✅",
          action: function (this: ShepherdTour) {
            const selection = window.getSelection();
            const selectedText = selection ? selection.toString().trim() : "";
            const employerNamePlaceholder = "[Employer Name]";

            if (selectedText === employerNamePlaceholder) {
              sessionStorage.setItem("tourStep", "edit-placeholder-employer-name");
              this.next();
            } else {
              alert("⚠️ Please select [Employer Name] exactly as shown in the 'PARTIES' section.");
            }
          },
        },
      ],
    });

    tour.addStep({
      id: "edit-placeholder-employer-name",
      text: "Now click on the <strong>Edit Placeholder</strong> button to automate [Employer Name].",
      attachTo: { element: "#edit-placeholder", on: "bottom" },
      buttons: [
        {
          text: "Next →",
          action: () => {
            simulateEditPlaceholderClick();
          },
        },
      ],
    });

    tour.addStep({
      id: "selected-placeholder-employer-name",
      text: "Your selected placeholder <strong>[Employer Name]</strong> is now visible here 📌 and ready for editing.",
      attachTo: { element: "#selected-placeholder0", on: "bottom" },
      buttons: [
        {
          text: "Next →",
          action: () => {
            sessionStorage.setItem("tourStep", "questionnaire-employer-name");
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: "questionnaire-employer-name",
      text: "Now that you've selected [Employer Name], let's draft a question for it. Go to the 'Questionnaire' page by clicking <strong>'Questionnaire'</strong> in the menu bar.",
      attachTo: { element: "#Questionnaire-button", on: "right" },
      buttons: [
        {
          text: "Go to Questionnaire →",
          action: () => {
            sessionStorage.setItem("tourStep", "return-from-questionnaire-employer-name");
            tour.complete();
            navigate("/Questionnaire");
          },
        },
      ],
    });

    tour.addStep({
      id: "return-from-questionnaire-employer-name",
      text: "Great job! You automated <strong>[Employer Name]</strong>. Let's move on to <strong>[Employee Name]</strong>.",
      attachTo: { element: "#selected-placeholder0", on: "bottom" },
      buttons: [
        {
          text: "Next →",
          action: () => {
            sessionStorage.setItem("tourStep", "introduce-employee-name");
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: "introduce-employee-name",
      text: "Select <strong>[Employee Name]</strong> in the 'PARTIES' section (under 'Employee:') without spaces before or after the square brackets [].",
      attachTo: {
        element: document.querySelector("#employee-name-placeholder") ?? document.body,
        on: "right",
      },
      buttons: [
        {
          text: "Verify Selection ✅",
          action: function (this: ShepherdTour) {
            const selection = window.getSelection();
            const selectedText = selection ? selection.toString().trim() : "";
            const employeeNamePlaceholder = "[Employee Name]";

            if (selectedText === employeeNamePlaceholder) {
              sessionStorage.setItem("tourStep", "edit-placeholder-employee-name");
              this.next();
            } else {
              alert("⚠️ Please select [Employee Name] exactly as shown in the 'PARTIES' section.");
            }
          },
        },
      ],
    });

    tour.addStep({
      id: "edit-placeholder-employee-name",
      text: "Now click on the <strong>Edit Placeholder</strong> button to automate [Employee Name].",
      attachTo: { element: "#edit-placeholder", on: "bottom" },
      buttons: [
        {
          text: "Next →",
          action: () => {
            simulateEditPlaceholderClick();
          },
        },
      ],
    });

    tour.addStep({
      id: "selected-placeholder-employee-name",
      text: "Your selected placeholder <strong>[Employee Name]</strong> is now visible here 📌 and ready for editing.",
      attachTo: { element: "#selected-placeholder1", on: "bottom" },
      buttons: [
        {
          text: "Next →",
          action: () => {
            sessionStorage.setItem("tourStep", "introduce-agreement-date");
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: "introduce-agreement-date",
      text: "Let's automate <strong>[Agreement Date]</strong>. Select it in the 'PARTIES' section (at the end of the section) without spaces before or after the square brackets [].",
      attachTo: {
        element: document.querySelector("#agreement-date-placeholder") ?? document.body,
        on: "right",
      },
      buttons: [
        {
          text: "Verify Selection ✅",
          action: function (this: ShepherdTour) {
            const selection = window.getSelection();
            const selectedText = selection ? selection.toString().trim() : "";
            const agreementDatePlaceholder = "[Agreement Date]";

            if (selectedText === agreementDatePlaceholder) {
              sessionStorage.setItem("tourStep", "edit-placeholder-agreement-date");
              this.next();
            } else {
              alert("⚠️ Please select [Agreement Date] exactly as shown in the 'PARTIES' section.");
            }
          },
        },
      ],
    });

    tour.addStep({
      id: "edit-placeholder-agreement-date",
      text: "Now click on the <strong>Edit Placeholder</strong> button to automate [Agreement Date].",
      attachTo: { element: "#edit-placeholder", on: "bottom" },
      buttons: [
        {
          text: "Next →",
          action: () => {
            simulateEditPlaceholderClick();
          },
        },
      ],
    });

    tour.addStep({
      id: "selected-placeholder-agreement-date",
      text: "Your selected placeholder <strong>[Agreement Date]</strong> is now visible here 📌 and ready for editing.",
      attachTo: { element: "#selected-placeholder2", on: "bottom" },
      buttons: [
        {
          text: "Next →",
          action: () => {
            sessionStorage.setItem("tourStep", "questionnaire-employee-name-agreement-date");
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: "questionnaire-employee-name-agreement-date",
      text: "You've selected <strong>[Employee Name]</strong> and <strong>[Agreement Date]</strong>. Go to the 'Questionnaire' page by clicking <strong>'Questionnaire'</strong> in the menu bar to draft questions for these placeholders.",
      attachTo: { element: "#Questionnaire-button", on: "right" },
      buttons: [
        {
          text: "Go to Questionnaire →",
          action: () => {
            sessionStorage.setItem("tourStep", "return-from-questionnaire-employee-name-agreement-date");
            tour.complete();
            navigate("/Questionnaire");
          },
        },
      ],
    });

    tour.addStep({
      id: "return-from-questionnaire-employee-name-agreement-date",
      text: "Well done! You've automated <strong>[Employee Name]</strong> and <strong>[Agreement Date]</strong>. You've completed Level 1: Automate Placeholders!",
      attachTo: { element: "#selected-placeholder2", on: "bottom" },
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
    };
  }, [navigate]);

  const selectedPart = parseInt(localStorage.getItem("selectedPart") || "0", 10);

  // Function to process document text for Part 1 by removing round and curly brackets
  const processDocumentTextForPart1 = (html: string) => {
    let updatedHtml = html;

    // Remove round brackets from Probationary Period clause
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>\(PROBATIONARY PERIOD<\/h2>\s*<p>([\s\S]*?)\)\s*<span[^>]*>\(Optional Clause\)<\/span>/i,
      (_match, content) => {
        return `<h2 className="text-2xl font-bold mt-6">PROBATIONARY PERIOD</h2><p className="mt-5">${content}</p><span className="text-black font-bold">(Optional Clause)</span>`;
      }
    );

    // Remove round brackets from Pension clause
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>\(PENSION<\/h2>\s*<p>([\s\S]*?)\)/i,
      (_match, content) => {
        return `<h2 className="text-2xl font-bold mt-6">PENSION</h2><p className="mt-5">${content}</p>`;
      }
    );

    // Remove curly brackets from small conditions globally
    updatedHtml = updatedHtml.replace(/\{([\s\S]*?)\}/g, (_match, content) => content);

    // Remove curly brackets with slashes
    updatedHtml = updatedHtml.replace(/\{\/([\s\S]*?)\/\}/g, (_match, content) => content);

    return updatedHtml;
  };

  // Parser options to add IDs to specific placeholders
  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === "text") {
        const text = domNode.data;
        if (text.includes("[Employer Name]")) {
          return (
            <span id="employer-name-placeholder">{text}</span>
          );
        } else if (text.includes("[Employee Name]")) {
          return (
            <span id="employee-name-placeholder">{text}</span>
          );
        } else if (text.includes("[Agreement Date]")) {
          return (
            <span id="agreement-date-placeholder">{text}</span>
          );
        }
      }
      return undefined;
    },
  };

  // Conditionally process the EmploymentAgreement content
  const documentContent =
    selectedPart === 1
      ? parse(processDocumentTextForPart1(documentText), parserOptions)
      : parse(documentText, parserOptions);

  return (
    <div
      className={`w-full min-h-screen font-sans transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      <Navbar
        level={"/Level-Two-Part-Two"}
        questionnaire={"/Questionnaire"}
        live_generation={"/Live_Generation"}
      />

      {/* Label for current level */}
      <div className="text-center mt-24">
        {selectedPart === 1 && (
          <h1
            className={`text-3xl font-bold tracking-wide ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            LEVEL 1: Automate Placeholders
          </h1>
        )}
        {selectedPart === 2 && (
          <h1
            className={`text-3xl font-bold tracking-wide ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            LEVEL 2: Automate Small Conditions
          </h1>
        )}
        {selectedPart === 3 && (
          <h1
            className={`text-3xl font-bold tracking-wide ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            LEVEL 3: Automate Big Conditions
          </h1>
        )}
      </div>

      {/* Score display */}
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

      <div className="fixed flex top-16 right-0 z-50 px-6 py-3 space-x-6">
        {icons.map(({ icon, label }, index) => {
          const shouldRender =
            (label === "Edit PlaceHolder" && selectedPart === 1) ||
            (label === "Small Condition" && selectedPart === 2) ||
            (label === "Big Condition" && selectedPart === 3) ||
            selectedPart === 4;

          if (!shouldRender) return null;

          return (
            <div key={index} className="relative flex items-center">
              <button
                id={
                  label === "Edit PlaceHolder"
                    ? "edit-placeholder"
                    : `icon-${label.toLowerCase().replace(" ", "-")}`
                }
                className={`p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 ease-in-out flex items-center justify-center text-2xl ${
                  isDarkMode
                    ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900"
                    : "bg-gradient-to-r from-teal-400 to-cyan-400 text-white hover:from-teal-500 hover:to-cyan-500"
                }`}
                onMouseEnter={() => setTooltip(label)}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => handleIconClick(label)}
              >
                {icon}
              </button>
              {tooltip === label && (
                <div
                  className={`absolute -left-10 top-full mt-2 px-3 py-1 text-sm text-white rounded-lg shadow-lg whitespace-nowrap animate-fadeIn ${
                    isDarkMode
                      ? "bg-gradient-to-r from-gray-700 to-gray-800"
                      : "bg-gradient-to-r from-gray-800 to-gray-900"
                  }`}
                >
                  {label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className={`max-w-5xl mx-auto p-8 rounded-3xl shadow-2xl border mt-24 transform transition-all duration-500 hover:shadow-3xl ${
          isDarkMode
            ? "bg-gray-800/90 backdrop-blur-lg border-gray-700/50"
            : "bg-white/90 backdrop-blur-lg border-teal-100/30"
        }`}
      >
        <h2
          className={`text-2xl font-semibold mb-6 tracking-wide ${
            isDarkMode ? "text-teal-300" : "text-teal-700"
          }`}
        >
          ☑️ Selected Placeholders
        </h2>
        {highlightedTexts.length > 0 ? (
          <ul
            className={`space-y-3 p-5 rounded-xl shadow-inner ${
              isDarkMode
                ? "bg-gradient-to-r from-gray-700/70 via-gray-800/70 to-gray-900/70"
                : "bg-gradient-to-r from-teal-50/70 via-cyan-50/70 to-indigo-50/70"
            }`}
          >
            {[...new Set(highlightedTexts)].map((text, index) => {
              const { primaryValue } = determineQuestionType(text);
              const questionType = selectedTypes[index] || "Text";
              return (
                <li
                  id={`selected-placeholder${index}`}
                  key={`${text}-${index}`}
                  className={`flex items-center justify-between p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
                    isDarkMode
                      ? "text-teal-200 bg-gray-600/80 hover:bg-gray-500/70"
                      : "text-teal-800 bg-white/80 hover:bg-teal-100/70"
                  }`}
                >
                  <div className="flex items-center">
                    <span
                      className={`mr-3 text-lg ${
                        isDarkMode ? "text-cyan-400" : "text-cyan-500"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-sm font-medium truncate max-w-xs">
                      {primaryValue || text}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode
                        ? "text-gray-300 bg-gray-500/50"
                        : "text-gray-600 bg-teal-100/50"
                    }`}
                  >
                    Type: {questionType}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div
            className={`text-center py-8 rounded-xl shadow-inner ${
              isDarkMode
                ? "bg-gradient-to-r from-gray-700/70 via-gray-800/70 to-gray-900/70"
                : "bg-gradient-to-r from-teal-50/70 via-cyan-50/70 to-indigo-50/70"
            }`}
          >
            <p
              className={`italic text-lg ${
                isDarkMode ? "text-teal-400" : "text-teal-600"
              }`}
            >
              No placeholders selected yet
            </p>
          </div>
        )}
        {highlightedTexts.length > 0 && (
          <div className="mt-5 text-right">
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                isDarkMode
                  ? "text-teal-300 bg-gray-600/50"
                  : "text-teal-600 bg-teal-100/50"
              }`}
            >
              Total Placeholders: {[...new Set(highlightedTexts)].length}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto mt-10 px-8 pb-20" ref={documentRef}>
        <div
          className={`p-6 rounded-3xl shadow-xl border ${
            isDarkMode
              ? "bg-gray-800/80 backdrop-blur-md border-gray-700/20 bg-gradient-to-br from-gray-700/70 via-gray-800/70 to-gray-900/70"
              : "bg-white/80 backdrop-blur-md border-teal-100/20 bg-gradient-to-br from-teal-50/70 via-cyan-50/70 to-indigo-50/70"
          }`}
        >
          {documentContent}
        </div>
        <AIAnalysisPanel
          documentText={getDocumentText()}
          highlightedTexts={highlightedTexts}
          isDarkMode={isDarkMode}
        />
        <CrispChat websiteId="cf9c462c-73de-461e-badf-ab3a1133bdde" />
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
    </div>
  );
};

export default LevelTwoPart_Two;
