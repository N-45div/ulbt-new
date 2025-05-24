import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import lawyaltechLogo from "../assets/lawyaltech_logo.png";
import klaraImg from "../assets/klara.png";

const steps = [
  {
    heading: "What is Contract Lifecycle Management?",
    content: [
      `Contract lifecycle management (CLM) is the process of managing a contract from initiation through execution, performance, and renewal or expiration. CLM tools are software solutions that automate and streamline various stages of this process to enhance efficiency and compliance.`,
      `In this game, you will navigate through stages of creating, managing, and finalizing contracts, earning points and rewards as you complete tasks like drafting, negotiating, and renewing contracts efficiently and compliantly.`,
    ],
    footerImg: lawyaltechLogo,
  },
  {
    content: [
      `Embark on the journey of Ana Smith, a Legal Intern at the prestigious Ron & Taylor's law firm in the heart of London. As Ana, you're currently immersed in the world of legal research and handling elementary legal tasks. However, your true passion lies in the cutting-edge realm of legal technology, and you're eager to transition into the legal tech department. Your adventure begins in a modest cubicle, but as you master new skills and knowledge, your environment will transform. Watch your workspace evolve with upgraded office furniture and state-of-the-art computer accessories. Each level you conquer brings you one step closer to your dream promotion and your very own office. Rise through the ranks and reshape your destiny!`,
    ],
    footerImg: lawyaltechLogo,
  },
  {
    content: [
      `Meet Klara, the head of the IT department at Ron & Taylor's.`,
      `She will be assisting you with your training on how to configure and navigate through CLM tools.`,
    ],
    klara: klaraImg,
    footerImg: lawyaltechLogo,
  },
  {
    content: [
      `To begin, you should get familiar with some of the Legal Tech Jargons commonly used in CLM tools:`,
    ],
    list: [
      {
        term: "Document Automation",
        definition:
          "The use of software to create legal documents by automatically filling in details specific to each case.",
      },
      {
        term: "Negotiation",
        definition:
          "The process within CLM tools that facilitates back-and-forth communication and revisions to reach a mutual agreement on contract terms.",
      },
      {
        term: "Placeholders",
        definition:
          "Designated spaces in a document template where specific data can be automatically inserted by a CLM system.",
      },
      {
        term: "Conditions",
        definition:
          "Predefined rules or criteria that trigger specific actions or changes in a contract document within a CLM system.",
      },
    ],
    footerImg: lawyaltechLogo,
  },
];

const ContentComponent: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string[]>([]);
  const [, setParagraphIndex] = useState<number>(0);
  const navigate = useNavigate(); // Add navigation hook

  useEffect(() => {
    setDisplayText([]); // Reset text when step changes
    setParagraphIndex(0);

    const paragraphs = [...steps[count].content]; // Clone content array

    if (steps[count].list) {
      steps[count].list.forEach((item) => {
        paragraphs.push(`${item.term}: ${item.definition}`);
      });
    }

    let currentPara = 0;

    const typeNextParagraph = () => {
      if (currentPara < paragraphs.length) {
        let i = 0;
        let tempText = "";

        const interval = setInterval(() => {
          if (i < paragraphs[currentPara].length) {
            tempText += paragraphs[currentPara][i];
            setDisplayText((prev) => {
              const newText = [...prev];
              newText[currentPara] = tempText;
              return newText;
            });
            i++;
          } else {
            clearInterval(interval);
            currentPara++;
            if (currentPara < paragraphs.length) {
              setTimeout(typeNextParagraph, 500);
            }
          }
        }, 30);

        return interval;
      }
    };

    const intervalId = typeNextParagraph();

    return () => {
      clearInterval(intervalId);
    };
  }, [count]);

  return (
    <div className={steps[count].klara ? "px-10 py-5" : "p-20"}>
      {steps[count].heading && (
        <h3 className="font-semibold mb-4 uppercase font-mono text-4xl text-center pb-6">
          {steps[count].heading}
        </h3>
      )}
      <div className="flex flex-row items-center">
        {steps[count].klara && (
          <img src={steps[count].klara} alt="klara" className="mr-4" />
        )}
        <span>
          {displayText.map((paragraph, idx) => (
            <p key={idx} className="font-mono text-lg mb-4">
              {paragraph}
            </p>
          ))}
        </span>
      </div>

      <div className={`p-20 pb-32 ${steps[count].klara ? "px-10 py-5" : ""}`}>
        <div className="fixed bottom-0 left-0 w-full flex items-center p-4 bg-white shadow-lg z-10">
          {/* Left section for logo */}
          <div className="w-1/3">
            {steps[count].footerImg && (
              <div className="w-54 h-26">
                <img src={steps[count].footerImg} alt="Lawyaltech Logo" />
              </div>
            )}
          </div>
          
          {/* Center section for buttons */}
          <div className="w-1/3 flex justify-center">
            {count < steps.length - 1 ? (
              <button
                className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition duration-300"
                onClick={() => setCount(count + 1)}
              >
                Next
              </button>
            ) : (
              <button
                className="px-6 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition duration-300"
                onClick={() => navigate("/Matching-Exercise")} // Navigate to MatchingExercise
              >
                Start Matching Exercise
              </button>
            )}
          </div>
          
          {/* Empty right section for balance */}
          <div className="w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default ContentComponent;
