export interface MatchingItem {
    id: string;
    term: string;
    definition: string;
    isMatched: boolean;
  }
  
  export interface MatchLineProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: string;
  }