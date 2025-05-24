import { createContext, useContext, useState, useEffect } from 'react';

type ScoreContextType = {
  totalScore: number;
  levelTwoScore: number;
  questionnaireScore: number;
  updateScore: (delta: number) => void; // Note: This function appears unused in the provided code
  setLevelTwoScore: (score: number) => void;
  updateQuestionnaireScore: (delta: number) => void;
  resetAllScores: () => void;
};

const ScoreContext = createContext<ScoreContextType>({
  totalScore: 0,
  levelTwoScore: 0,
  questionnaireScore: 0,
  updateScore: () => {},
  setLevelTwoScore: () => {},
  updateQuestionnaireScore: () => {},
  resetAllScores: () => {},
});

export const ScoreProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize scores from sessionStorage or default to 0
  const [totalScore, setTotalScore] = useState(() => {
    return parseInt(sessionStorage.getItem('totalScore') || '0', 10);
  });
  
  const [levelTwoScore, setLevelTwoScore] = useState(() => {
    return parseInt(sessionStorage.getItem('levelTwoScore') || '0', 10);
  });
  
  const [questionnaireScore, setQuestionnaireScore] = useState(() => {
    return parseInt(sessionStorage.getItem('questionnaireScore') || '0', 10);
  });

  // Persist scores to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('totalScore', totalScore.toString());
  }, [totalScore]);

  useEffect(() => {
    sessionStorage.setItem('levelTwoScore', levelTwoScore.toString());
  }, [levelTwoScore]);

  useEffect(() => {
    sessionStorage.setItem('questionnaireScore', questionnaireScore.toString());
  }, [questionnaireScore]);

  const updateScore = (delta: number) => {
    const newScore = Math.max(0, totalScore + delta);
    setTotalScore(newScore);
    console.log(`updateScore: Total score updated to ${newScore} (delta: ${delta})`);
  };

  const updateLevelTwoScore = (score: number) => {
    setLevelTwoScore(score);
    const newTotal = score + questionnaireScore;
    setTotalScore(newTotal);
    console.log(`updateLevelTwoScore: Level two score set to ${score}, totalScore updated to ${newTotal}`);
  };

  const updateQuestionnaireScore = (delta: number) => {
    const newScore = Math.max(0, questionnaireScore + delta);
    setQuestionnaireScore(newScore);
    const newTotal = levelTwoScore + newScore;
    setTotalScore(newTotal);
    console.log(`updateQuestionnaireScore: Questionnaire score updated to ${newScore} (delta: ${delta}), totalScore updated to ${newTotal}`);
  };

  const resetAllScores = () => {
    setTotalScore(0);
    setLevelTwoScore(0);
    setQuestionnaireScore(0);
    sessionStorage.removeItem('totalScore');
    sessionStorage.removeItem('levelTwoScore');
    sessionStorage.removeItem('questionnaireScore');
    console.log("resetAllScores: All scores reset");
  };

  return (
    <ScoreContext.Provider
      value={{
        totalScore,
        levelTwoScore,
        questionnaireScore,
        updateScore,
        setLevelTwoScore: updateLevelTwoScore,
        updateQuestionnaireScore,
        resetAllScores,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => useContext(ScoreContext);
