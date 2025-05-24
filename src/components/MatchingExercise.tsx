import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchingItem } from '../types';
import MatchLine from './MatchLine';
import '../styles/MatchingExercise.css';

interface MatchingExerciseProps {
  data: MatchingItem[];
}

const MatchingExercise = ({ data }: MatchingExerciseProps) => {
  const [items, setItems] = useState<MatchingItem[]>([...data]);
  const [selectedTerm, setSelectedTerm] = useState<MatchingItem | null>(null);
  const [matches, setMatches] = useState<{ [key: string]: string }>({});
  const [lines, setLines] = useState<
    {
      startId: string;
      endId: string;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color: string;
    }[]
  >([]);
  const [showCompletion, setShowCompletion] = useState(false);

  const termRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const defRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const navigate = useNavigate();

  const handleTermClick = (item: MatchingItem) => {
    if (item.isMatched) return;
    setSelectedTerm((prev) => (prev?.id === item.id ? null : item));
  };

  const handleDefinitionClick = (item: MatchingItem) => {
    if (!selectedTerm || item.isMatched || Object.values(matches).includes(item.id)) return;
    if (matches[selectedTerm.id]) return;

    const isCorrectMatch = item.id === selectedTerm.id;
    const lineColor = isCorrectMatch ? '#10B981' : '#EF4444';

    const termElement = termRefs.current[selectedTerm.id];
    const defElement = defRefs.current[item.id];

    if (termElement && defElement) {
      const termRect = termElement.getBoundingClientRect();
      const defRect = defElement.getBoundingClientRect();

      setLines((prevLines) => prevLines.filter((line) => line.startId !== selectedTerm.id));

      setLines((prevLines) => [
        ...prevLines,
        {
          startId: selectedTerm.id,
          endId: item.id,
          startX: termRect.right + 5,
          startY: termRect.top + termRect.height / 2,
          endX: defRect.left - 5,
          endY: defRect.top + defRect.height / 2,
          color: lineColor,
        },
      ]);
    }

    if (isCorrectMatch) {
      const updatedItems = items.map((i) =>
        i.id === item.id ? { ...i, isMatched: true } : i
      );
      setItems(updatedItems);
      setMatches((prev) => ({
        ...prev,
        [selectedTerm.id]: item.id,
      }));
    } else {
      setMatches((prev) => ({
        ...prev,
        [selectedTerm.id]: item.id,
      }));
    }

    setSelectedTerm(null);
  };

  useEffect(() => {
    const updateLines = () => {
      setLines((prevLines) =>
        prevLines.map((line) => {
          const termElement = termRefs.current[line.startId];
          const defElement = defRefs.current[line.endId];

          if (termElement && defElement) {
            const termRect = termElement.getBoundingClientRect();
            const defRect = defElement.getBoundingClientRect();

            return {
              ...line,
              startX: termRect.right + 10,
              startY: termRect.top + termRect.height / 2,
              endX: defRect.left - 10,
              endY: defRect.top + defRect.height / 2,
            };
          }
          return line;
        })
      );
    };

    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [lines]);

  const isComplete = items.every((item) => item.isMatched);

  useEffect(() => {
    if (isComplete && !showCompletion) {
      setShowCompletion(true);
    }
  }, [isComplete, showCompletion]);

  return (
    <div className="matching-exercise-container">
      <h1 className="matching-exercise-title">Match the definitions with the correct jargons</h1>

      <div className="matching-columns">
        <div className="terms-column">
          {items.map((item) => (
            <div
              key={`term-${item.id}`}
              ref={(el: HTMLDivElement | null) => {
                termRefs.current[item.id] = el; // Explicitly assign without returning
              }}
              className={`term-item ${selectedTerm?.id === item.id ? 'selected' : ''} ${item.isMatched ? 'matched' : ''}`}
              onClick={() => handleTermClick(item)}
            >
              {item.term}
            </div>
          ))}
        </div>

        <div className="definitions-column">
          {items.map((item) => (
            <div
              key={`def-${item.id}`}
              ref={(el: HTMLDivElement | null) => {
                defRefs.current[item.id] = el; // Explicitly assign without returning
              }}
              className={`definition-item ${item.isMatched ? 'matched' : ''}`}
              onClick={() => handleDefinitionClick(item)}
            >
              {item.definition}
            </div>
          ))}
        </div>

        {lines.map((line, index) => (
          <MatchLine
            key={`line-${index}`}
            startX={line.startX}
            startY={line.startY}
            endX={line.endX}
            endY={line.endY}
            color={line.color}
          />
        ))}
      </div>

      {/* Add Home button */}
      <div className="mt-6 flex justify-center">
        <button
          className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
          onClick={() => navigate('/dashboard')} // Navigate to homepage
        >
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default MatchingExercise;