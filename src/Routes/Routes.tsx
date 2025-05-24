import { Routes, Route } from "react-router";
import HomePage from "../Pages/HomePage";
import LevelOneQuizPage from "../Pages/LevelOneQuizPage";
import Level2 from "../Pages/LevelTwo";
import LevelTwoPart_Two from "../Pages/Level2_PartTwo";
import LevelTwoPart_Two_Demo from "../Pages/LevelTwoPart_Two_Demo";
import MatchingExercise from "../components/MatchingExercise";
import { matchingData } from "../data/matchingData";
import LevelOneDesign from "../Pages/Level1_newDesign";
import Login from "../Pages/Login";
import Signup from "../Pages/Signup";
import Dashboard from "../Pages/Dashboard";
import Level3_Quiz from "../Pages/Level3Quiz";
import Questionnaire_Level3 from "../Pages/Questionnaire_Level3";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/Level-One-Quiz" element={<LevelOneQuizPage />} />
      <Route path="/Level-Two" element={<Level2 />} />
      <Route path="/Matching-Exercise" element={<MatchingExercise data={matchingData} />} />
      <Route path="Level-Two-Part-Two" element={<LevelTwoPart_Two />} />
      <Route path="Level-Two-Part-Two-Demo" element={<LevelTwoPart_Two_Demo /> } />
      <Route path="Level-One-Design" element={<LevelOneDesign />} />
      <Route path="/Level-Three-Quiz" element={<Level3_Quiz />} />
      <Route path="/Questionnaire_Level3" element={<Questionnaire_Level3 />} />
    </Routes>
  );
};

export default AppRoutes;
