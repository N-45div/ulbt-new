import { FaPenToSquare } from "react-icons/fa6";
import { TbSettingsMinus, TbSettingsPlus } from "react-icons/tb";
import { ImLoop2 } from "react-icons/im";
import { useState, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useHighlightedText } from "../context/HighlightedTextContext";
import { useQuestionType } from "../context/QuestionTypeContext";
import EmploymentAgreement from "../utils/EmploymentAgreement";
import { determineQuestionType } from "../utils/questionTypeUtils";
import { ThemeContext } from "../context/ThemeContext";
import AIAnalysisPanel from "../components/AIAnalysisPanel";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

const icons = [
  { icon: <FaPenToSquare />, label: "Edit PlaceHolder" },
  { icon: <TbSettingsMinus />, label: "Small Condition" },
  { icon: <TbSettingsPlus />, label: "Big Condition" },
  { icon: <ImLoop2 />, label: "Loop" },
];

const LevelTwoPart_Two_Demo = () => {
  const location = useLocation();
  const { isDarkMode } = useContext(ThemeContext);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const { highlightedTexts, addHighlightedText } = useHighlightedText();
  const { selectedTypes, setSelectedTypes } = useQuestionType();
  const documentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("LevelTwoPart_Two_Demo - Rendering at:", location.pathname);
    sessionStorage.removeItem("level");
    sessionStorage.setItem("level", location.pathname);

    // Initialize selectedTypes if not already set
    const savedTypes = sessionStorage.getItem("selectedQuestionTypes");
    if (!savedTypes && highlightedTexts.length > 0) {
      const initialTypes = highlightedTexts.map(() => "Text");
      setSelectedTypes(initialTypes);
      sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(initialTypes));
    }
  }, [location.pathname, highlightedTexts, setSelectedTypes]);

  const getDocumentText = () => {
    return documentRef.current?.textContent || "";
  };

  const handleIconClick = (label: string) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    let textWithoutBrackets = selectedText;
    let hasValidBrackets = false;
    let hasValidSpanClass = false;

    if (selectedText.startsWith("[") && selectedText.endsWith("]")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
      hasValidSpanClass = true;
    } else if (selectedText.startsWith("{") && selectedText.endsWith("}")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
    } else if (selectedText.startsWith("(") && selectedText.endsWith(")")) {
      textWithoutBrackets = selectedText.slice(1, -1);
      hasValidBrackets = true;
    } else {
      const node = selection.anchorNode;
      if (node && node.parentElement) {
        const parent = node.parentElement;
        const classList = Array.from(parent.classList);
        const placeholderClass = classList.find(cls => cls.startsWith("placeholder-"));

        if (placeholderClass) {
          hasValidSpanClass = true;
          textWithoutBrackets = parent.textContent || selectedText;
        }
      }
    }

    if (
      (label === "Edit PlaceHolder" && !hasValidSpanClass) ||
      ((label === "Small Condition" || label === "Big Condition") && !hasValidBrackets)
    ) {
      console.log("Selected text does not have valid brackets:", selectedText);
      return;
    }

    if (label === "Edit PlaceHolder") {
      // if (!(selectedText.startsWith("[") && selectedText.endsWith("]"))) {
      //   console.log("Invalid Edit Placeholder selection:", selectedText);
      //   return;
      // }
      if (highlightedTexts.includes(textWithoutBrackets)) {
        console.log("Placeholder already highlighted:", textWithoutBrackets);
        alert("This placeholder has already been added!");
        return;
      }
      console.log("Selected Edit Placeholder:", textWithoutBrackets);
      addHighlightedText(textWithoutBrackets);
      console.log("Updated highlightedTexts after adding:", highlightedTexts);

      // Update selectedTypes with default "Text" for new placeholder
      const newTypes = [...selectedTypes, "Text"];
      setSelectedTypes(newTypes);
      sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypes));

      const span = document.createElement("span");
      span.style.backgroundColor = isDarkMode ? "rgba(255, 245, 157, 0.5)" : "rgba(255, 245, 157, 0.7)";
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
    } else if (label === "Small Condition") {
      if (!(selectedText.startsWith("{") && selectedText.endsWith("}")) || 
          selectedText.length < 35 || 
          selectedText.length > 450) return;
      addHighlightedText(textWithoutBrackets);

      // Update selectedTypes with default "Text" for new condition
      const newTypes = [...selectedTypes, "Text"];
      setSelectedTypes(newTypes);
      sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypes));

      const span = document.createElement("span");
      span.style.backgroundColor = isDarkMode ? "rgba(129, 236, 236, 0.5)" : "rgba(129, 236, 236, 0.7)";
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
    } else if (label === "Big Condition") {
      if (!(selectedText.startsWith("(") && selectedText.endsWith(")"))) return;
      console.log("Selected Big Condition:", selectedText);

      let clauseContent = textWithoutBrackets;
      const headingsToStrip = ["PROBATIONARY PERIOD", "PENSION"];
      for (const heading of headingsToStrip) {
        if (textWithoutBrackets.startsWith(heading)) {
          clauseContent = textWithoutBrackets.slice(heading.length).trim();
          console.log(`Stripped heading '${heading}', clauseContent:`, clauseContent);
          break;
        }
      }

      addHighlightedText(clauseContent);

      // Update selectedTypes with default "Text" for new condition
      const newTypes = [...selectedTypes, "Text"];
      setSelectedTypes(newTypes);
      sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypes));

      const fragment = document.createDocumentFragment();
      const contents = range.cloneContents();

      const applyHighlight = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const span = document.createElement("span");
          span.style.backgroundColor = isDarkMode ? "rgba(186, 220, 88, 0.5)" : "rgba(186, 220, 88, 0.7)";
          span.textContent = node.textContent;
          return span;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const newElement = document.createElement(element.tagName);
          for (const attr of element.attributes) {
            newElement.setAttribute(attr.name, attr.value);
          }
          element.childNodes.forEach((child) => {
            const newChild = applyHighlight(child);
            if (newChild) {
              newElement.appendChild(newChild);
            }
          });
          return newElement;
        }
        return null;
      };
      contents.childNodes.forEach((node) => {
        const newNode = applyHighlight(node);
        if (newNode) {
          fragment.appendChild(newNode);
        }
      });

      range.deleteContents();
      range.insertNode(fragment);

      const probationClauseContent = "The first [Probation Period Length] of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.";
      const pensionClauseContent = "The Employee will be enrolled in the Company’s pension scheme in accordance with auto-enrolment legislation.";

      const normalizeText = (text: string) => text.replace(/\s+/g, "");
      const normalizedSelectedText = normalizeText(textWithoutBrackets);
      const normalizedProbationClause = normalizeText(probationClauseContent);
      const normalizedPensionClause = normalizeText(pensionClauseContent);

      console.log("Normalized selectedText:", normalizedSelectedText);
      console.log("Normalized probationClause:", normalizedProbationClause);

      if (normalizedSelectedText === normalizedProbationClause) {
        console.log("Probation Clause matched, adding question instead of placeholder");
        addHighlightedText("Is the clause of probationary period applicable?");
        // Add "Text" type for the additional question
        const newTypesWithQuestion = [...newTypes, "Text"];
        setSelectedTypes(newTypesWithQuestion);
        sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypesWithQuestion));
      } else if (normalizedSelectedText === normalizedPensionClause) {
        console.log("Pension Clause matched, adding Pension question");
        addHighlightedText("Is the Pension clause applicable?");
        // Add "Text" type for the additional question
        const newTypesWithQuestion = [...newTypes, "Text"];
        setSelectedTypes(newTypesWithQuestion);
        sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypesWithQuestion));
      } else {
        console.log("No clause matched.");
      }
    } else if (label === "Loop") {
      addHighlightedText(textWithoutBrackets);

      // Update selectedTypes with default "Text" for new loop
      const newTypes = [...selectedTypes, "Text"];
      setSelectedTypes(newTypes);
      sessionStorage.setItem("selectedQuestionTypes", JSON.stringify(newTypes));

      const span = document.createElement("span");
      span.style.backgroundColor = isDarkMode ? "rgba(255, 245, 157, 0.5)" : "rgba(255, 245, 157, 0.7)";
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);
    }
  };

  useEffect(() => {
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: "shadow-md bg-purple-dark",
        scrollTo: { behavior: "smooth", block: "center" },
      },
      useModalOverlay: true,
      confirmCancel: false,
      tourName: `level-two-part-two-demo-${Date.now()}`,
    });

    tour.addStep({
      id: "welcome",
      text: `
        <div class="welcome-message">
          <strong class="welcome-title">🚀 Welcome to Part II of Level 2 Demo, brave document warrior!</strong>
          <p class="welcome-text">It's time to master the art of document automation.</p>
          <p class="mission-text"><strong>Your mission:</strong> Automate an employment agreement using placeholders and conditions. Let's dive in!</p>
        </div>
      `,
      attachTo: { element: document.body, on: "bottom-start" },
      classes: "shepherd-theme-custom animate__animated animate__fadeIn",
      buttons: [{ text: "Start Learning →", action: tour.next }],
    });

    tour.addStep({
      id: "placeholders",
      text: "Behold your <strong>employment agreement!</strong> Notice those bits wrapped in square brackets, like <strong> [Employer Name] </strong>? Those are placeholders—your secret weapons for automation. Any text inside <strong> [square brackets] </strong> is a placeholder waiting to be customized.<br> Let's start with [Employer Name] by highlighting it and verifying your selection. Then, click on the 'Edit Placeholder' button to automate your placeholder. Hurray! A placeholder has been created for you.",
      attachTo: { element: document.body, on: "bottom-start" },
      buttons: [{ text: "Next →", action: tour.next }],
    });

    tour.addStep({
      id: "select-employer-name",
      text: "Select [Employer Name] in the 'PARTIES' section (under 'Employer:') without spaces before or after the square brackets [].",
      attachTo: {
        element: (document.querySelector("#employer-name-placeholder") as HTMLElement | null) || document.body,
        on: "bottom",
      },
      buttons: [
        {
          text: "Verify Selection ✅",
          action: function () {
            const selection = window.getSelection();
            const selectedText = selection ? selection.toString().trim() : "";
            const employerNamePlaceholder = "[Employer Name]";

            if (selectedText === employerNamePlaceholder) {
              tour.next();
            } else {
              alert("⚠️ Please select [Employer Name] exactly as shown in the 'PARTIES' section.");
            }
          },
        },
      ],
    });

    tour.addStep({
      id: "edit-placeholder",
      text: "Now click on the <strong> Edit Placeholder </strong> to make changes.",
      attachTo: { element: "#edit-placeholder", on: "bottom" },
      buttons: [{ text: "Next →", action: tour.next }],
    });

    tour.addStep({
      id: "selected-placeholder",
      text: "Your selected placeholder is now visible here 📌 and ready for editing.",
      attachTo: { element: "#selected-placeholder0", on: "bottom" },
      buttons: [{ text: "Next →", action: tour.next }],
    });

    tour.addStep({
      id: "questionnaire",
      text: "Now that you've selected the [Employer Name] placeholder. This is where the magic begins. To bring it to life, head to the 'Questionnaire' page. Click <strong> 'Questionnaire' </strong> in the menu bar which would take you to the page, and let's build the question that powers this placeholder!",
      attachTo: { element: "#Questionnaire-button", on: "right" },
      buttons: [{ text: "Done", action: tour.complete }],
    });

    tour.start();
    window.history.replaceState({}, document.title, location.pathname);

    return () => {
      tour.complete();
    };
  }, []);

  return (
    <div
      className={`w-full min-h-screen font-sans transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      <Navbar
        level={"/Level-Two-Part-Two-Demo"}
        questionnaire={"/Questionnaire"}
        live_generation={"/Live_Generation"}
      />
      <div className="fixed flex top-16 right-0 z-50 px-6 py-3 space-x-6">
        {icons.map(({ icon, label }, index) => (
          <div key={index} className="relative flex items-center">
            <button
              id={label === "Edit PlaceHolder" ? "edit-placeholder" : `icon-${label.toLowerCase().replace(" ", "-")}`}
              className={`p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 ease-in-out flex items-center justify-center text-2xl ${
                isDarkMode
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800"
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
        ))}
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
          <EmploymentAgreement />
        </div>
        <AIAnalysisPanel
          documentText={getDocumentText()}
          highlightedTexts={highlightedTexts}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default LevelTwoPart_Two_Demo;
