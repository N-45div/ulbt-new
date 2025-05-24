import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, useLocation } from "react-router";
import Confetti from "react-confetti";
import parse from "html-react-parser";
import { documentText } from "../utils/EmploymentAgreement";
import { findPlaceholderByValue } from "../utils/questionTypeUtils";
import { ThemeContext } from "../context/ThemeContext";

interface UserAnswers {
  [key: string]: string | boolean | null | { amount: string; currency: string };
}

const processAgreement = (html: string, answers: UserAnswers) => {
  let updatedHtml = html;

  console.log("Initial html in processAgreement:", html); // Debug log
  console.log("userAnswers in processAgreement:", answers);

  // Add font-bold class to h2 tags
  updatedHtml = updatedHtml.replace(/<h2 className="([^"]*)"/g, (className) => {
    const classes = className.split(" ");
    if (!classes.includes("font-bold")) {
      classes.push("font-bold");
    }
    return `<h2 className="${classes.join(" ")}"`;
  });

  // Handle [USA] replacement for governing country
  const countryAnswer = answers["What is the governing country?"];
  console.log("countryAnswer for [USA]:", countryAnswer);
  if (
    countryAnswer &&
    typeof countryAnswer === "string" &&
    countryAnswer.trim()
  ) {
    updatedHtml = updatedHtml.replace(
      new RegExp(`\\[USA\\]`, "gi"),
      countryAnswer
    );
    console.log("After [USA] replacement:", updatedHtml);
  }

  // Handle Probationary Period clause
  const probationAnswer =
    answers["Is the clause of probationary period applicable?"];
  if (probationAnswer === null || probationAnswer === false) {
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>[^<]*PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?<\/p>/i,
      ""
    );
  }

  // Handle Pension clause
  const pensionAnswer = answers["Is the Pension clause applicable?"];
  if (pensionAnswer === null || pensionAnswer === false) {
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>[^<]*PENSION[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?<\/p>/i,
      ""
    );
  }

  // Handle Additional Locations clause
  const additionalLocationsAnswer =
    answers[
      "Does the employee need to work at additional locations besides the normal place of work?"
    ];
  const additionalLocationDetails = answers[
    "What is the additional work location?"
  ] as string | undefined;
  if (
    additionalLocationsAnswer === true &&
    additionalLocationDetails &&
    typeof additionalLocationDetails === "string" &&
    additionalLocationDetails.trim()
  ) {
    updatedHtml = updatedHtml.replace(
      /\[other locations\]/gi,
      additionalLocationDetails
    );
  } else if (
    additionalLocationsAnswer === false ||
    additionalLocationsAnswer === null
  ) {
    updatedHtml = updatedHtml.replace(
      /<h2[^>]*>[^<]*ADDITIONAL WORK LOCATIONS[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?\[other locations\][\s\S]*?<\/p>/i,
      ""
    );
  }

  // Handle overtime clause (align with Live_Generation_2 logic)
  const overtimeAnswer = answers[
    "Is the employee entitled to overtime work?"
  ] as boolean | null | undefined;
  const overtimeYesClause =
    "{The Employee is entitled to overtime pay for authorized overtime work.}";
  const overtimeNoClause =
    "{The Employee shall not receive additional payment for overtime worked.}";

  updatedHtml = updatedHtml.replace(
    /<p className="mt-5" id="employment-agreement-working-hours">([\s\S]*?)<\/p>/i,
    () => {
      let replacementText = "";
      if (overtimeAnswer === true) {
        replacementText = overtimeYesClause;
      } else if (overtimeAnswer === false) {
        replacementText = overtimeNoClause;
      } else {
        replacementText = ""; // Default to empty if no answer
      }
      return `<p className="mt-5" id="employment-agreement-working-hours">${replacementText}</p>`;
    }
  );

  // Process other placeholders
  Object.entries(answers).forEach(([question, answer]) => {
    if (
      question === "What is the governing country?" ||
      question === "Is the employee entitled to overtime work?"
    ) {
      return; // Skip these as they are handled separately
    }

    const placeholder = findPlaceholderByValue(question);
    if (placeholder === "Unused Holiday Days" && typeof answer === "string") {
      const calculatedValue = localStorage.getItem("calculatedValue") || "";
      updatedHtml = updatedHtml.replace(
        new RegExp("\\[Holiday Pay\\]", "gi"),
        calculatedValue
      );
    }
    if (placeholder) {
      const escapedPlaceholder = placeholder.replace(
        /[.*+?^=!:${}()|\[\]\/\\]/g,
        "\\$&"
      );
      if (
        question === "What's the annual salary?" ||
        question === "Specify the holiday pay?"
      ) {
        const salaryData = answer as
          | { amount: string; currency: string }
          | undefined;
        const formattedAmount = salaryData?.amount || `[${placeholder}]`;
        const formattedCurrency = salaryData?.currency || "USD";
        updatedHtml = updatedHtml.replace(
          new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
          formattedAmount
        );
        updatedHtml = updatedHtml.replace(
          new RegExp(`\\[USD\\]`, "gi"),
          formattedCurrency
        );
      } else if (typeof answer === "boolean") {
        if (!answer) {
          if (question === "Is the clause of probationary period applicable?") {
            updatedHtml = updatedHtml.replace(
              /<h2[^>]*>[^<]*PROBATIONARY PERIOD[^<]*<\/h2>\s*<p[^>]*>[\s\S]*?<\/p>/i,
              ""
            );
          }
          updatedHtml = updatedHtml.replace(
            new RegExp(`.*${escapedPlaceholder}.*`, "gi"),
            ""
          );
        } else {
          updatedHtml = updatedHtml.replace(
            new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
            "Yes"
          );
        }
      } else if (typeof answer === "string" && answer.trim()) {
        updatedHtml = updatedHtml.replace(
          new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
          answer
        );
      } else {
        updatedHtml = updatedHtml.replace(
          new RegExp(`\\[${escapedPlaceholder}\\]`, "gi"),
          `[${placeholder}]`
        );
      }
    } else {
      if (question === "Is the sick pay policy applicable?") {
        const sickPayClause =
          "{The Employee may also be entitled to Company sick pay of [Details of Company Sick Pay Policy]}";
        if (answer === false) {
          updatedHtml = updatedHtml.replace(sickPayClause, "");
        } else if (answer === true && answers["What's the sick pay policy?"]) {
          updatedHtml = updatedHtml.replace(
            "[Details of Company Sick Pay Policy]",
            answers["What's the sick pay policy?"] as string
          );
        }
      } else if (question === "Is the termination clause applicable?") {
        const terminationClauseStart = updatedHtml.indexOf(
          '<h2 className="text-2xl font-bold mt-6">TERMINATION</h2>'
        );
        const terminationClauseEnd = updatedHtml.indexOf(
          '<h2 className="text-2xl font-bold mt-6">CONFIDENTIALITY</h2>'
        );
        if (
          answer === false &&
          terminationClauseStart !== -1 &&
          terminationClauseEnd !== -1
        ) {
          updatedHtml =
            updatedHtml.slice(0, terminationClauseStart) +
            updatedHtml.slice(terminationClauseEnd);
        } else if (answer === true && answers["What's the notice period?"]) {
          updatedHtml = updatedHtml.replace(
            /\[Notice Period\]/gi,
            answers["What's the notice period?"] as string
          );
        }
      } else if (
        question === "Is the previous service applicable?" &&
        answer === false
      ) {
        const prevEmploymentClause =
          'or, if applicable, "on [Previous Employment Start Date] with previous continuous service taken into account"';
        updatedHtml = updatedHtml.replace(
          new RegExp(
            `\\s*${prevEmploymentClause.replace(
              /[.*+?^=!:${}()|\[\]\/\\]/g,
              "\\$&"
            )}\\s*`,
            "gi"
          ),
          ""
        );
      }
    }
  });

  console.log("Final updatedHtml:", updatedHtml); // Debug log
  return updatedHtml;
};

const Finish = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [confetti, setConfetti] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [finalAgreement, setFinalAgreement] = useState<React.ReactNode>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: document.body.scrollHeight || window.innerHeight,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: Math.max(document.body.scrollHeight, window.innerHeight),
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    setConfetti(true);
    const answers: UserAnswers = location.state?.userAnswers || {};
    console.log("userAnswers in Finish useEffect:", answers); // Debug log
    const updatedText = processAgreement(documentText, answers);
    setFinalAgreement(parse(updatedText));

    setTimeout(updateDimensions, 100);

    return () => window.removeEventListener("resize", updateDimensions);
  }, [location.state]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const storedLevel = sessionStorage.getItem("level") ?? "none";
  return (
    <div
      className={`min-h-screen overflow-hidden flex flex-col font-sans relative transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      {confetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={200}
          gravity={0.1}
          initialVelocityY={5}
          tweenDuration={6000}
          run={true}
          colors={["#5EEAD4", "#A78BFA", "#F9A8D4", "#FBBF24", "#60A5FA"]}
        />
      )}
      <Navbar
        level={storedLevel}
        questionnaire="/Questionnaire"
        live_generation="/Live_Generation"
        {...(storedLevel === "/Level-Three-Quiz"
          ? { calculations: "/Calculations" }
          : {})}
      />
      <div className="flex justify-center mt-20 mb-12">
        <div
          className={`rounded-xl shadow-xl border p-12 w-4/5 max-w-5xl ${
            isDarkMode
              ? "bg-gray-800/90 backdrop-blur-sm border-gray-700/20"
              : "bg-white/90 backdrop-blur-sm border-teal-100/20"
          }`}
        >
          <h1
            className={`text-4xl font-bold mb-12 tracking-wide text-center border-b-2 pb-4 ${
              isDarkMode
                ? "text-teal-300 border-teal-600"
                : "text-teal-700 border-teal-200"
            }`}
          >
            EMPLOYMENT AGREEMENT
          </h1>
          <div
            className={`${
              isDarkMode ? "text-teal-200" : "text-teal-900"
            } leading-relaxed`}
          >
            {finalAgreement}
          </div>
        </div>
      </div>
      <div className="flex justify-center mb-12 space-x-8">
        <button
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
          onClick={handleBackClick}
        >
          Back
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
          onClick={handleHomeClick}
        >
          Home
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-700 text-teal-200 hover:bg-gray-600"
              : "bg-teal-200 text-teal-900 hover:bg-cyan-200"
          }`}
          onClick={handleDashboardClick}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Finish;
