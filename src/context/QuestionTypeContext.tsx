// QuestionTypeContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

interface FollowUpQuestion {
  parentQuestion: string; // The question that triggers this follow-up (e.g., "Is the Pension clause applicable?")
  question: string; // The follow-up question (e.g., "What's the name of HR/relevant contact?")
  visible: boolean; // Whether the follow-up question should be visible
}

interface QuestionTypeContextProps {
  selectedTypes: (string | null)[];
  setSelectedTypes: (types: (string | null)[]) => void;
  editedQuestions: string[];
  setEditedQuestions: (questions: string[]) => void;
  requiredQuestions: boolean[];
  setRequiredQuestions: (required: boolean[]) => void;
  followUpQuestions: FollowUpQuestion[];
  setFollowUpQuestions: (followUps: FollowUpQuestion[]) => void;
  questionOrder: number[];
  setQuestionOrder: (order: number[]) => void;
}

interface QuestionTypeProviderProps {
  children: ReactNode;
}

const QuestionTypeContext = createContext<QuestionTypeContextProps | undefined>(undefined);

export const QuestionTypeProvider: React.FC<QuestionTypeProviderProps> = ({ children }) => {
  const [selectedTypes, setSelectedTypes] = useState<(string | null)[]>([]);
  const [editedQuestions, setEditedQuestions] = useState<string[]>([]);
  const [requiredQuestions, setRequiredQuestions] = useState<boolean[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);

  return (
    <QuestionTypeContext.Provider
      value={{
        selectedTypes,
        setSelectedTypes,
        editedQuestions,
        setEditedQuestions,
        requiredQuestions,
        setRequiredQuestions,
        followUpQuestions,
        setFollowUpQuestions,
        questionOrder,
        setQuestionOrder,
      }}
    >
      {children}
    </QuestionTypeContext.Provider>
  );
};

export const useQuestionType = () => {
  const context = useContext(QuestionTypeContext);
  if (!context) {
    throw new Error("useQuestionType must be used within a QuestionTypeProvider");
  }
  return context;
};
