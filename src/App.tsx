// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import LevelOneQuizPage from "./Pages/LevelOneQuizPage";
import Level2 from "./Pages/LevelTwo";
import LevelTwoPart_Two from "./Pages/Level2_PartTwo";
import LevelTwoPart_Two_Demo from "./Pages/LevelTwoPart_Two_Demo";
import LevelOneDesign from "./Pages/Level1_newDesign";
import Questionnaire from "./Pages/Questionnaire";
import Live_Generation from "./Pages/Live_Generation";
import Live_Generation_2 from "./Pages/Live_Generation_2";
import Finish from "./Pages/Finish";
import { HighlightedTextProvider } from "./context/HighlightedTextContext";
import { QuestionTypeProvider } from "./context/QuestionTypeContext";
import { QuestionEditProvider } from "./context/QuestionEditContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
import ProtectedRoute from "./Routes/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import Level3_Quiz from "./Pages/Level3Quiz";
import Calculations from "./Pages/Calculations";
import Questionnaire_Level3 from "./Pages/Questionnaire_Level3";
import MatchingExercise from "./components/MatchingExercise";
import { matchingData } from "./data/matchingData";
import { UserAnswersProvider } from "./context/UserAnswersContext";


const App = () => {
  return (
    <UserAnswersProvider>
      <AuthProvider>
        <HighlightedTextProvider>
          <QuestionTypeProvider>
            <QuestionEditProvider>
              <ThemeProvider>
                <AppRoutes />
              </ThemeProvider>
            </QuestionEditProvider>
          </QuestionTypeProvider>
        </HighlightedTextProvider>
      </AuthProvider>
    </UserAnswersProvider>
    
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/Questionnaire_Level3" element={<Questionnaire_Level3 />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/Level-One-Quiz" element={<ProtectedRoute><LevelOneQuizPage /></ProtectedRoute>} />
      <Route path="/Level-Two-Part-One" element={<ProtectedRoute><Level2 /></ProtectedRoute>} />
      <Route path="/Matching-Exercise" element={<ProtectedRoute><MatchingExercise data={matchingData} /></ProtectedRoute>} />
      <Route path="/Level-Two-Part-Two" element={<ProtectedRoute><LevelTwoPart_Two /></ProtectedRoute>} />
      <Route path="/Level-Two-Part-Two-Demo" element={<ProtectedRoute><LevelTwoPart_Two_Demo /></ProtectedRoute>} />
      <Route path="/Level-Three-Quiz" element={<ProtectedRoute><Level3_Quiz /></ProtectedRoute>} />
      <Route path="/Questionnaire" element={<ProtectedRoute><Questionnaire /></ProtectedRoute>} />
      <Route path="/Calculations" element={<Calculations />} />
      <Route path="/Live_Generation" element={<ProtectedRoute><Live_Generation /></ProtectedRoute>} />
      <Route path="/Live_Generation_2" element={<ProtectedRoute><Live_Generation_2 /></ProtectedRoute>} />
      <Route path="/Level-One-Design" element={<ProtectedRoute><LevelOneDesign /></ProtectedRoute>} />
      <Route path="/Finish" element={<ProtectedRoute><Finish /></ProtectedRoute>} />
    </Routes>
  );
};

export default App;
