import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Changed to react-router-dom
import "./index.css";
import App from "./App.tsx";
import { QuestionTypeProvider } from "./context/QuestionTypeContext";
import { HighlightedTextProvider } from "./context/HighlightedTextContext"; // Import HighlightedTextProvider
import { ScoreProvider } from "./context/ScoreContext.tsx";
import '../crisp-override.css'

createRoot(document.getElementById("root")!).render(
    <StrictMode>
  
  <BrowserRouter>
      <HighlightedTextProvider>
        <QuestionTypeProvider>
          <ScoreProvider>
            <App />
          </ScoreProvider>
        </QuestionTypeProvider>
      </HighlightedTextProvider>
  </BrowserRouter>
    </StrictMode>

);
