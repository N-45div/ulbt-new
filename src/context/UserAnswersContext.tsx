import React, { createContext, useContext, useState } from "react";

type UserAnswerValue = string | boolean | null | { amount: string; currency: string };

interface UserAnswersContextType {
  userAnswers: { [key: string]: UserAnswerValue };
  setUserAnswers: React.Dispatch<React.SetStateAction<{ [key: string]: UserAnswerValue }>>;
  initializeUserAnswers: (highlightedTexts: string[], selectedTypes: (string | null)[]) => void;
}

const UserAnswersContext = createContext<UserAnswersContextType | undefined>(undefined);

export const UserAnswersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: UserAnswerValue }>({});

  const initializeUserAnswers = (highlightedTexts: string[], selectedTypes: (string | null)[]) => {
    const initial: { [key: string]: UserAnswerValue } = {};
    highlightedTexts.forEach((text, index) => {
      const { primaryValue } = determineQuestionType(text);
      const type = selectedTypes[index] || "Text";
      if (primaryValue) {
        if (primaryValue === "What's the annual salary?") {
          initial[primaryValue] = { amount: "", currency: "USD" };
        } else if (primaryValue === "What is the additional work location?") {
          initial[primaryValue] = "";
        } else {
          initial[primaryValue] = type === "Radio" ? null : "";
        }
      }
    });
    setUserAnswers(prev => ({ ...initial, ...prev })); // preserve existing answers
  };

  return (
    <UserAnswersContext.Provider value={{ userAnswers, setUserAnswers, initializeUserAnswers }}>
      {children}
    </UserAnswersContext.Provider>
  );
};

export const useUserAnswers = () => {
  const context = useContext(UserAnswersContext);
  if (!context) throw new Error("useUserAnswers must be used within a UserAnswersProvider");
  return context;
};

// Stubbed determineQuestionType - replace with your actual implementation
function determineQuestionType(text: string): { primaryValue: string } {
  return { primaryValue: text.trim() };
}
